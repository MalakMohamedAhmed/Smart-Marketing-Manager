import pandas as pd
import numpy as np
import pickle
import os

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "model_artifacts")

# Must match label encoder classes exactly
PLATFORM_NAME_MAP = {
    "facebook"    : "Facebook",
    "instagram"   : "Instagram",
    "tiktok"      : "TikTok",
    "google"      : "Google",
    "youtube"     : "YouTube",
    "twitter"     : "Twitter",
    "pinterest"   : "Pinterest",
    "whatsapp"    : "WhatsApp",
    "email"       : "Email",
    "display"     : "Display",
    "other_social": "Other_Social",
}

# Features we never impute — must be present or derived
CRITICAL_FEATURES = ["roi", "conversion_rate"]

# Features safe to impute from platform averages
IMPUTABLE_FEATURES = [
    "ctr", "cpc", "cpm", "cpr", "engagement_score",
    "duration_days", "budget", "impressions", "clicks",
    "conversions", "acquisition_cost", "revenue",
    "month", "quarter", "day_of_week"
]

def load_artifacts():
    """Load all model artifacts from disk."""
    def load_pkl(name):
        with open(os.path.join(ARTIFACTS_DIR, name), "rb") as f:
            return pickle.load(f)

    return {
        "feature_list"        : load_pkl("feature_list.pkl"),
        "label_encoders"      : load_pkl("label_encoders.pkl"),
        "categorical_cols"    : load_pkl("categorical_cols.pkl"),
        "platform_averages"   : load_pkl("platform_averages.pkl"),
        "platform_median_cost": load_pkl("platform_median_cost.pkl"),
    }

def derive_features(df):
    """Derive computed features from raw columns."""
    eps = 1e-9
    df = df.copy()

    # CTR
    if "ctr" not in df.columns or df["ctr"].isna().all():
        if "clicks" in df.columns and "impressions" in df.columns:
            df["ctr"] = df["clicks"] / (df["impressions"] + eps)

    # Conversion rate
    if "conversion_rate" not in df.columns or df["conversion_rate"].isna().all():
        if "conversions" in df.columns and "clicks" in df.columns:
            df["conversion_rate"] = df["conversions"] / (df["clicks"] + eps)

    # CPC
    if "cpc" not in df.columns or df["cpc"].isna().all():
        if "acquisition_cost" in df.columns and "clicks" in df.columns:
            df["cpc"] = df["acquisition_cost"] / (df["clicks"] + eps)

    # CPM
    if "cpm" not in df.columns or df["cpm"].isna().all():
        if "acquisition_cost" in df.columns and "impressions" in df.columns:
            df["cpm"] = (df["acquisition_cost"] / (df["impressions"] + eps)) * 1000

    # CPR
    if "cpr" not in df.columns or df["cpr"].isna().all():
        if "acquisition_cost" in df.columns and "conversions" in df.columns:
            df["cpr"] = df["acquisition_cost"] / (df["conversions"].clip(lower=1))

    # ROI
    if "roi" not in df.columns or df["roi"].isna().all():
        if "revenue" in df.columns and "acquisition_cost" in df.columns:
            df["roi"] = (
                (df["revenue"] - df["acquisition_cost"]) /
                (df["acquisition_cost"] + eps)
            )

    # Video view rate
    if "video_view_rate" not in df.columns or df["video_view_rate"].isna().all():
        if "video_views" in df.columns and "impressions" in df.columns:
            df["video_view_rate"] = df["video_views"] / (df["impressions"] + eps)

    return df

def check_completeness(df):
    """
    Check if the data has enough features to run the model.
    Returns (can_run, tier, missing_cols, message)
    
    tier 0 → cannot run, block
    tier 1 → can run, low confidence
    tier 2 → can run, full confidence
    """
    cols = df.columns.tolist()

    # Check minimum required
    tier1_required = [
        "impressions", "clicks",
        "acquisition_cost", "conversions"
    ]
    missing_tier1 = [c for c in tier1_required if c not in cols]
    if missing_tier1:
        return False, 0, missing_tier1, (
            f"Missing critical columns: {', '.join(missing_tier1)}. "
            f"These are required to run the analysis."
        )

    # Check roi derivability
    has_roi = "roi" in cols or ("revenue" in cols and "acquisition_cost" in cols)
    has_cvr = "conversion_rate" in cols or ("conversions" in cols and "clicks" in cols)

    if not has_roi:
        return False, 0, ["roi or revenue"], (
            "Cannot compute ROI. Please include revenue or ROI column."
        )
    if not has_cvr:
        return False, 0, ["conversion_rate"], (
            "Cannot compute conversion rate. Please include conversions and clicks."
        )

    # Tier 2 check
    tier2_cols = ["budget", "date", "engagement_score", "target_audience"]
    missing_tier2 = [c for c in tier2_cols if c not in cols]
    if missing_tier2:
        return True, 1, missing_tier2, "Tier 1 — some features missing, confidence may be lower."

    return True, 2, [], "Tier 2 — full confidence."

def impute_missing(df, platform_averages, platform_median_cost):
    """
    Impute missing features using platform-level averages.
    Never imputes roi or conversion_rate.
    """
    df = df.copy()

    for _, row in df.iterrows():
        platform = row.get("platform", "Facebook")
        # Handle encoded platform (int) — skip imputation per-row in that case
        if not isinstance(platform, str):
            platform = "Facebook"

        idx = df.index[df["platform"] == platform] if isinstance(platform, str) else df.index

        for feature in IMPUTABLE_FEATURES:
            if feature in CRITICAL_FEATURES:
                continue
            if feature not in df.columns or df[feature].isna().all():
                avg_val = platform_averages.get(feature, {}).get(platform, 0)
                df.loc[idx, feature] = avg_val
            elif df[feature].isna().any():
                avg_val = platform_averages.get(feature, {}).get(platform, 0)
                df[feature] = df[feature].fillna(avg_val)

    return df

def normalize_platform(df):
    """Ensure platform column matches label encoder classes exactly."""
    if "platform" in df.columns:
        df["platform"] = df["platform"].astype(str).str.strip()
        df["platform"] = df["platform"].apply(
            lambda x: PLATFORM_NAME_MAP.get(x.lower(), x)
        )
    return df

def encode_categoricals(df, label_encoders, categorical_cols):
    """Encode categorical columns using saved label encoders."""
    df = df.copy()

    for col in categorical_cols:
        le = label_encoders[col]
        known_classes = set(le.classes_)

        if col in df.columns:
            df[col] = df[col].astype(str).fillna("Unknown")
            # Map unknown values to most common known class
            fallback = le.classes_[0]
            df[col] = df[col].apply(
                lambda x: x if x in known_classes else fallback
            )
            df[col] = le.transform(df[col])
        else:
            df[col] = 0

    return df

def prepare_features(df, artifacts):
    """
    Full feature preparation pipeline.
    Returns (feature_df, can_run, tier, missing_cols, message)
    """
    feature_list     = artifacts["feature_list"]
    label_encoders   = artifacts["label_encoders"]
    categorical_cols = artifacts["categorical_cols"]
    platform_averages     = artifacts["platform_averages"]
    platform_median_cost  = artifacts["platform_median_cost"]

    # Step 1 — normalize platform names
    df = normalize_platform(df)

    # Step 2 — derive computable features
    df = derive_features(df)

    # Step 3 — check completeness
    can_run, tier, missing_cols, message = check_completeness(df)
    if not can_run:
        return None, False, tier, missing_cols, message

    # Step 4 — impute missing non-critical features
    df = impute_missing(df, platform_averages, platform_median_cost)

    # Step 5 — encode categoricals
    df = encode_categoricals(df, label_encoders, categorical_cols)

    # Step 6 — ensure all model features exist
    for col in feature_list:
        if col not in df.columns:
            df[col] = 0

    # Step 7 — fill any remaining nulls with 0 except critical features
    non_critical = [f for f in feature_list if f not in CRITICAL_FEATURES]
    df[non_critical] = df[non_critical].fillna(0)

    return df[feature_list], True, tier, missing_cols, message