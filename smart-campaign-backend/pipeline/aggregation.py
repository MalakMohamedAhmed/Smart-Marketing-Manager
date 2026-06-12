import pandas as pd
import numpy as np

SUM_COLS = ["impressions", "clicks", "conversions", "acquisition_cost",
            "budget", "revenue", "video_views", "purchases", "leads", "reach"]

MEAN_COLS = ["ctr", "cpc", "cpm", "cpr", "roi", "engagement_score",
             "conversion_rate", "frequency", "video_view_rate"]

FIRST_COLS = ["campaign_type", "target_audience", "customer_segment", "language"]

def aggregate_campaigns(df, platform):
    # Match label encoder classes exactly
    platform_clean = platform.strip().capitalize()
    df["platform"] = platform_clean

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Detect campaign name column
    for col in ["campaign_name", "Campaign Name", "Campaign", "campaign"]:
        if col in df.columns:
            df = df.rename(columns={col: "campaign_name"})
            break
    if "campaign_name" not in df.columns:
        df["campaign_name"] = f"{platform_clean} Campaign 1"

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    agg_dict = {"platform": "first"}
    for col in SUM_COLS:
        if col in numeric_cols:
            agg_dict[col] = "sum"
    for col in MEAN_COLS:
        if col in numeric_cols:
            agg_dict[col] = "mean"
    for col in FIRST_COLS:
        if col in df.columns:
            agg_dict[col] = "first"

    if "date" in df.columns:
        agg_dict["date"] = ["min", "max"]

    grouped = df.groupby("campaign_name").agg(agg_dict).reset_index()

    # Flatten multi-level columns
    new_cols = []
    for col in grouped.columns:
        if isinstance(col, tuple):
            new_cols.append("_".join([c for c in col if c]).strip("_"))
        else:
            new_cols.append(col)
    grouped.columns = new_cols

    # Compute duration
    if "date_min" in grouped.columns and "date_max" in grouped.columns:
        grouped["duration_days"] = (
            pd.to_datetime(grouped["date_max"]) - pd.to_datetime(grouped["date_min"])
        ).dt.days + 1
        grouped = grouped.drop(columns=["date_min", "date_max"], errors="ignore")
    else:
        grouped["duration_days"] = 30

    # Time features
    if "date" in df.columns and not df["date"].isna().all():
        ref_date = df["date"].dropna().max()
        grouped["month"] = ref_date.month
        grouped["quarter"] = ref_date.quarter
        grouped["day_of_week"] = ref_date.dayofweek
    else:
        grouped["month"] = 6
        grouped["quarter"] = 2
        grouped["day_of_week"] = 0

    return grouped