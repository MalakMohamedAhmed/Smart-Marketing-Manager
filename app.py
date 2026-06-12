from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import io

from pipeline.column_mapping import map_columns
from pipeline.aggregation import aggregate_campaigns
from pipeline.feature_pipeline import load_artifacts, prepare_features
from pipeline.recommender import generate_recommendations

app = Flask(__name__)
CORS(app)

# Load artifacts once at startup
feature_list, label_encoders, categorical_cols, platform_averages, platform_median_cost = load_artifacts()
perf_model = joblib.load(os.path.join("model_artifacts", "perf_model.pkl"))
alert_model = joblib.load(os.path.join("model_artifacts", "alert_model.pkl"))

PERF_LABELS = {0: "Low", 1: "Medium", 2: "High"}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        files = request.files
        platforms = request.form.getlist("platforms")

        if not files or not platforms:
            return jsonify({"error": "No files or platforms provided"}), 400

        all_campaigns = []

        for platform in platforms:
            file_key = f"file_{platform.lower()}"
            if file_key not in files:
                continue

            file = files[file_key]
            content = file.read().decode("utf-8")
            df = pd.read_csv(io.StringIO(content))

            # Map columns to unified schema
            df = map_columns(df, platform)

            # Aggregate to campaign level
            df_agg = aggregate_campaigns(df, platform)

            # Prepare features for model
            X = prepare_features(
                df_agg.copy(),
                feature_list,
                label_encoders,
                categorical_cols,
                platform_averages,
                platform_median_cost
            )

            # Predict
            perf_preds = perf_model.predict(X)
            alert_preds = alert_model.predict(X)

            # Build campaign results
            for i, row in df_agg.iterrows():
                camp = row.to_dict()
                camp["performance_label"] = PERF_LABELS.get(int(perf_preds[i]), "Medium")
                camp["alert_flag"] = int(alert_preds[i])
                camp["platform"] = platform.lower()
                all_campaigns.append(camp)

        # Generate recommendations
        recommendations = generate_recommendations(all_campaigns)

        # Build KPI summary
        total_spend = sum(c.get("acquisition_cost", 0) for c in all_campaigns)
        total_conversions = sum(c.get("conversions", 0) for c in all_campaigns)
        total_revenue = sum(c.get("revenue", 0) for c in all_campaigns)
        avg_roi = np.mean([c.get("roi", 0) for c in all_campaigns]) if all_campaigns else 0
        avg_ctr = np.mean([c.get("ctr", 0) for c in all_campaigns]) if all_campaigns else 0

        # Clean NaN values for JSON
        def clean(val):
            if isinstance(val, float) and np.isnan(val):
                return 0
            return val

        cleaned_campaigns = [
            {k: clean(v) for k, v in c.items()}
            for c in all_campaigns
        ]

        return jsonify({
            "campaigns": cleaned_campaigns,
            "recommendations": recommendations,
            "kpis": {
                "total_spend": round(total_spend, 2),
                "total_conversions": int(total_conversions),
                "total_revenue": round(total_revenue, 2),
                "avg_roi": round(avg_roi * 100, 2),
                "avg_ctr": round(avg_ctr * 100, 2),
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)