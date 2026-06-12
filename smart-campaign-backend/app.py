from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
import io

from pipeline.column_mapping import map_columns, get_completeness_tier
from pipeline.aggregation import aggregate_campaigns, aggregate_all_platforms, PLATFORM_NAME_MAP
from pipeline.feature_pipeline import load_artifacts, prepare_features
from pipeline.recommender import generate_recommendations

app = Flask(__name__)
CORS(app)

# ── Load artifacts once at startup ────────────────────────────────────
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "model_artifacts")

artifacts = load_artifacts()

def load_pkl(name):
    with open(os.path.join(ARTIFACTS_DIR, name), "rb") as f:
        return pickle.load(f)

perf_model  = load_pkl("perf_model.pkl")
alert_model = load_pkl("alert_model.pkl")

PERF_LABELS = {0: "Low", 1: "Medium", 2: "High"}


# ── Helpers ───────────────────────────────────────────────────────────
def clean_value(val):
    """Convert NaN, inf, numpy types to JSON-safe Python types."""
    if val is None:
        return None
    if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
        return 0
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    if isinstance(val, pd.Timestamp):
        return str(val.date()) if not pd.isna(val) else None
    return val

def clean_dict(d):
    """Recursively clean a dict for JSON serialization."""
    return {k: clean_value(v) for k, v in d.items()}

def read_csv_file(file):
    """Read uploaded file as DataFrame."""
    content = file.read()
    try:
        return pd.read_csv(io.StringIO(content.decode("utf-8")))
    except UnicodeDecodeError:
        return pd.read_csv(io.StringIO(content.decode("latin-1")))


# ── Routes ────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models": "loaded"})


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        files     = request.files
        form      = request.form
        platforms = form.getlist("platforms")
        file_mode = form.get("file_mode", "one_per_platform")
        # file_mode: "one_per_platform" or "one_for_all"
        # platform_col: column name identifying platform in unified file
        platform_col = form.get("platform_col", None)

        if not files:
            return jsonify({"error": "No files provided"}), 400
        if not platforms:
            return jsonify({"error": "No platforms specified"}), 400

        platform_dfs = {}

        # ── Mode A: one file per platform ─────────────────────────────
        if file_mode == "one_per_platform":
            for platform in platforms:
                file_key = f"file_{platform.lower()}"
                if file_key not in files:
                    continue
                df = read_csv_file(files[file_key])
                df = map_columns(df, platform)
                print("COLUMNS AFTER MAPPING:", df.columns.tolist())
                platform_dfs[platform] = df

        # ── Mode B: one file for all platforms ────────────────────────
        elif file_mode == "one_for_all":
            if "file_all" not in files:
                return jsonify({"error": "No file provided for unified upload"}), 400

            df = read_csv_file(files["file_all"])

            if platform_col and platform_col in df.columns:
                # Split by platform column
                for platform_val in df[platform_col].unique():
                    matched_platform = None
                    for p in platforms:
                        if p.lower() in str(platform_val).lower():
                            matched_platform = p
                            break
                    if not matched_platform:
                        matched_platform = str(platform_val)
                    sub_df = df[df[platform_col] == platform_val].copy()
                    sub_df = map_columns(sub_df, matched_platform)
                    platform_dfs[matched_platform] = sub_df
            else:
                # No platform column — treat entire file as first selected platform
                platform = platforms[0]
                df = map_columns(df, platform)
                platform_dfs[platform] = df

        if not platform_dfs:
            return jsonify({"error": "No valid data found in uploaded files"}), 400

        # ── Validate completeness per platform ────────────────────────
        validation_results = {}
        for platform, df in platform_dfs.items():
            tier, missing = get_completeness_tier(df)
            validation_results[platform] = {
                "tier"   : tier,
                "missing": missing,
            }
            if tier == 0:
                return jsonify({
                    "error"  : f"Insufficient data for {platform}",
                    "missing": missing,
                    "message": (
                        f"Cannot analyze {platform} data. "
                        f"Missing required columns: {', '.join(missing)}"
                    )
                }), 400

        # ── Aggregate to campaign level ───────────────────────────────
        print("PLATFORM DFS KEYS:", list(platform_dfs.keys()))
        print("COLUMNS AFTER MAPPING:", {k: list(v.columns) for k, v in platform_dfs.items()})

        unified_df = aggregate_all_platforms(platform_dfs)
        
        print("UNIFIED COLUMNS:", unified_df.columns.tolist())

        # ── Prepare features & run models ─────────────────────────────
        X, can_run, tier, missing_cols, message = prepare_features(
            unified_df.copy(), artifacts
        )

        if not can_run:
            return jsonify({
                "error"  : "Cannot run model",
                "missing": missing_cols,
                "message": message,
            }), 400

        # ── Model inference ───────────────────────────────────────────
        perf_preds  = perf_model.predict(X)
        alert_preds = alert_model.predict(X)

        # ── Build campaign results ────────────────────────────────────
        all_campaigns = []
        for idx, (_, row) in enumerate(unified_df.iterrows()):
            camp = row.to_dict()
            camp["performance_label"] = PERF_LABELS.get(int(perf_preds[idx]), "Medium")
            camp["alert_flag"]        = int(alert_preds[idx])
            # Ensure platform name is normalized
            camp["platform"] = PLATFORM_NAME_MAP.get(
                str(camp.get("platform", "")).lower(),
                camp.get("platform", "Unknown")
            )
            all_campaigns.append(clean_dict(camp))

        # ── Generate recommendations ──────────────────────────────────
        rec_output = generate_recommendations(all_campaigns)

        # ── Build KPI summary ─────────────────────────────────────────
        def safe_mean(vals):
            clean = [v for v in vals if v is not None and not np.isnan(float(v))]
            return float(np.mean(clean)) if clean else 0.0

        total_spend       = sum(c.get("acquisition_cost") or 0 for c in all_campaigns)
        total_conversions = sum(c.get("conversions") or 0 for c in all_campaigns)
        total_revenue     = sum(c.get("revenue") or 0 for c in all_campaigns)
        avg_roi           = safe_mean([c.get("roi") for c in all_campaigns])
        avg_ctr           = safe_mean([c.get("ctr") for c in all_campaigns])

        # ── Platform summary for dashboard ───────────────────────────
        platform_summary = {}
        for camp in all_campaigns:
            p = camp.get("platform", "Unknown")
            if p not in platform_summary:
                platform_summary[p] = {
                    "campaigns"  : 0,
                    "total_spend": 0,
                    "total_revenue": 0,
                    "roi_values" : [],
                    "ctr_values" : [],
                    "cvr_values" : [],
                    "high_count" : 0,
                    "alert_count": 0,
                }
            ps = platform_summary[p]
            ps["campaigns"]     += 1
            ps["total_spend"]   += camp.get("acquisition_cost") or 0
            ps["total_revenue"] += camp.get("revenue") or 0
            ps["roi_values"].append(camp.get("roi") or 0)
            ps["ctr_values"].append(camp.get("ctr") or 0)
            ps["cvr_values"].append(camp.get("conversion_rate") or 0)
            if camp.get("performance_label") == "High":
                ps["high_count"] += 1
            if camp.get("alert_flag") == 1:
                ps["alert_count"] += 1

        # Flatten platform summary
        platform_summary_clean = {}
        for p, ps in platform_summary.items():
            platform_summary_clean[p] = {
                "campaigns"    : ps["campaigns"],
                "total_spend"  : round(ps["total_spend"], 2),
                "total_revenue": round(ps["total_revenue"], 2),
                "avg_roi"      : round(safe_mean(ps["roi_values"]), 4),
                "avg_ctr"      : round(safe_mean(ps["ctr_values"]), 4),
                "avg_cvr"      : round(safe_mean(ps["cvr_values"]), 4),
                "high_pct"     : round(ps["high_count"] / max(ps["campaigns"], 1) * 100, 1),
                "alert_pct"    : round(ps["alert_count"] / max(ps["campaigns"], 1) * 100, 1),
            }

        # ── Return response ───────────────────────────────────────────
        return jsonify({
            "campaigns"       : all_campaigns,
            "recommendations" : rec_output["recommendations"],
            "rec_summary"     : rec_output["summary"],
            "kpis": {
                "total_spend"      : round(total_spend, 2),
                "total_conversions": int(total_conversions),
                "total_revenue"    : round(total_revenue, 2),
                "avg_roi"          : round(avg_roi, 4),
                "avg_ctr"          : round(avg_ctr, 4),
                "total_campaigns"  : len(all_campaigns),
                "alert_count"      : sum(1 for c in all_campaigns if c.get("alert_flag") == 1),
                "high_count"       : sum(1 for c in all_campaigns if c.get("performance_label") == "High"),
                "low_count"        : sum(1 for c in all_campaigns if c.get("performance_label") == "Low"),
            },
            "platform_summary": platform_summary_clean,
            "validation"      : validation_results,
            "data_tier"       : tier,
        })

    except Exception as e:
        import traceback
        return jsonify({
            "error"  : str(e),
            "details": traceback.format_exc()
        }), 500


@app.route("/platforms", methods=["GET"])
def get_platforms():
    """Return list of supported platforms."""
    return jsonify({
        "platforms": list(PLATFORM_NAME_MAP.values())
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)