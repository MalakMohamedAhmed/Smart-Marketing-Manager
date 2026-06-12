import pandas as pd
import numpy as np
import joblib
import os

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "model_artifacts")

def load_artifacts():
    with open(os.path.join(ARTIFACTS_DIR, "feature_list.pkl"), "rb") as f:
        import pickle
        feature_list = pickle.load(f)
    with open(os.path.join(ARTIFACTS_DIR, "label_encoders.pkl"), "rb") as f:
        label_encoders = pickle.load(f)
    with open(os.path.join(ARTIFACTS_DIR, "categorical_cols.pkl"), "rb") as f:
        categorical_cols = pickle.load(f)
    with open(os.path.join(ARTIFACTS_DIR, "platform_averages.pkl"), "rb") as f:
        platform_averages = pickle.load(f)
    with open(os.path.join(ARTIFACTS_DIR, "platform_median_cost.pkl"), "rb") as f:
        platform_median_cost = pickle.load(f)
    return feature_list, label_encoders, categorical_cols, platform_averages, platform_median_cost

def derive_features(df):
    eps = 1e-9
    if "clicks" in df.columns and "impressions" in df.columns:
        if "ctr" not in df.columns or df["ctr"].isna().all():
            df["ctr"] = df["clicks"] / (df["impressions"] + eps)
    if "conversions" in df.columns and "clicks" in df.columns:
        if "conversion_rate" not in df.columns or df["conversion_rate"].isna().all():
            df["conversion_rate"] = df["conversions"] / (df["clicks"] + eps)
    if "acquisition_cost" in df.columns and "clicks" in df.columns:
        if "cpc" not in df.columns or df["cpc"].isna().all():
            df["cpc"] = df["acquisition_cost"] / (df["clicks"] + eps)
    if "acquisition_cost" in df.columns and "impressions" in df.columns:
        if "cpm" not in df.columns or df["cpm"].isna().all():
            df["cpm"] = (df["acquisition_cost"] / (df["impressions"] + eps)) * 1000
    if "acquisition_cost" in df.columns and "conversions" in df.columns:
        if "cpr" not in df.columns or df["cpr"].isna().all():
            df["cpr"] = df["acquisition_cost"] / (df["conversions"] + eps)
    if "revenue" in df.columns and "acquisition_cost" in df.columns:
        if "roi" not in df.columns or df["roi"].isna().all():
            df["roi"] = (df["revenue"] - df["acquisition_cost"]) / (df["acquisition_cost"] + eps)
    if "video_views" in df.columns and "impressions" in df.columns:
        if "video_view_rate" not in df.columns or df["video_view_rate"].isna().all():
            df["video_view_rate"] = df["video_views"] / (df["impressions"] + eps)
    return df

def impute_missing(df, platform_averages, platform_median_cost):
    # platform_averages structure: {feature_name: {platform_name: value}}
    platform = df["platform"].iloc[0] if "platform" in df.columns else "Facebook"

    for feature, platform_vals in platform_averages.items():
        if feature in df.columns:
            fill_val = platform_vals.get(platform, np.mean(list(platform_vals.values())))
            df[feature] = df[feature].fillna(fill_val)
        else:
            fill_val = platform_vals.get(platform, 0)
            df[feature] = fill_val

    # Handle acquisition_cost separately
    if "acquisition_cost" in df.columns:
        median_cost = platform_median_cost.get(platform, 100)
        df["acquisition_cost"] = df["acquisition_cost"].fillna(median_cost)

    return df

def encode_categoricals(df, label_encoders, categorical_cols):
    for col in categorical_cols:
        le = label_encoders[col]
        known_classes = set(le.classes_)

        if col == "platform":
            # Must match exactly — capitalize first letter
            if col in df.columns:
                df[col] = df[col].astype(str).str.capitalize()
                # Map unknown to first known class
                df[col] = df[col].apply(lambda x: x if x in known_classes else le.classes_[0])
                df[col] = le.transform(df[col])
            else:
                df[col] = 0
        else:
            if col in df.columns:
                df[col] = df[col].astype(str).fillna("Unknown")
                df[col] = df[col].apply(lambda x: x if x in known_classes else le.classes_[0])
                df[col] = le.transform(df[col])
            else:
                df[col] = 0

    return df

def prepare_features(df, feature_list, label_encoders, categorical_cols, platform_averages, platform_median_cost):
    df = derive_features(df)
    df = impute_missing(df, platform_averages, platform_median_cost)
    df = encode_categoricals(df, label_encoders, categorical_cols)

    for col in feature_list:
        if col not in df.columns:
            df[col] = 0

    df[feature_list] = df[feature_list].fillna(0)
    return df[feature_list]