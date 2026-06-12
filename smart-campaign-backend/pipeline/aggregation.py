import pandas as pd
import numpy as np

SUM_COLS = [
    "impressions", "clicks", "conversions", "acquisition_cost",
    "budget", "revenue", "video_views", "purchases", "leads", "reach"
]

MEAN_COLS = [
    "ctr", "cpc", "cpm", "cpr", "roi", "engagement_score",
    "conversion_rate", "frequency", "video_view_rate"
]

FIRST_COLS = [
    "campaign_type", "target_audience", "customer_segment", "language"
]

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

def normalize_platform_name(platform):
    """Normalize platform name to match label encoder classes exactly."""
    return PLATFORM_NAME_MAP.get(platform.strip().lower(), platform.strip().capitalize())

def aggregate_campaigns(df, platform):
    """
    Aggregate daily/ad-level rows into one row per campaign.
    Returns a DataFrame with one row per unique campaign.
    """
    # Normalize platform name
    platform_clean = normalize_platform_name(platform)
    df = df.copy()

    # Normalize column names to lowercase
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    # Map known aliases to expected names
    col_aliases = {
        "amount_spent"      : "acquisition_cost",
        "spend"             : "acquisition_cost",
        "cost"              : "acquisition_cost",
        "objective"         : "campaign_type",
        "ad_objective"      : "campaign_type",
        "target_audience"   : "target_audience",
        "audience"          : "target_audience",
    }
    df.rename(columns=col_aliases, inplace=True)

    df["platform"] = platform_clean

    # Parse dates
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # Detect and normalize campaign name column
    for col in ["campaign_name", "Campaign Name", "Campaign", "campaign"]:
        if col in df.columns:
            df = df.rename(columns={col: "campaign_name"})
            break
    if "campaign_name" not in df.columns:
        df["campaign_name"] = f"{platform_clean} Campaign 1"

    # Fill missing campaign names
    df["campaign_name"] = df["campaign_name"].fillna(f"{platform_clean} Campaign")

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    # Build aggregation dictionary
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

    # Rename aggregated columns back to clean names
    rename_map = {}
    for col in grouped.columns:
        if col.endswith("_sum") or col.endswith("_mean") or col.endswith("_first"):
            clean = col.rsplit("_", 1)[0]
            rename_map[col] = clean
    grouped.rename(columns=rename_map, inplace=True)

    # Compute duration and keep campaign start date
    if "date_min" in grouped.columns and "date_max" in grouped.columns:
        grouped["date_min"] = pd.to_datetime(grouped["date_min"])
        grouped["date_max"] = pd.to_datetime(grouped["date_max"])
        grouped["duration_days"] = (
            grouped["date_max"] - grouped["date_min"]
        ).dt.days + 1
        grouped["date"] = grouped["date_min"]  # keep start date for dashboard
        grouped.drop(columns=["date_min", "date_max"], inplace=True)
    elif "date" in df.columns and not df["date"].isna().all():
        grouped["date"] = df["date"].dropna().max()
        grouped["duration_days"] = 30
    else:
        grouped["date"] = pd.NaT
        grouped["duration_days"] = 30

    # Time features from campaign start date
    if "date" in grouped.columns and not grouped["date"].isna().all():
        ref = grouped["date"].ffill().fillna(pd.Timestamp("2023-01-01"))
        grouped["month"]       = ref.dt.month
        grouped["quarter"]     = ref.dt.quarter
        grouped["day_of_week"] = ref.dt.dayofweek
    else:
        grouped["month"]       = 6
        grouped["quarter"]     = 2
        grouped["day_of_week"] = 0

    return grouped


def aggregate_all_platforms(platform_dfs: dict) -> pd.DataFrame:
    """
    Aggregate multiple platform DataFrames and combine into one.
    
    Args:
        platform_dfs: dict of {platform_name: dataframe}
    
    Returns:
        Single unified DataFrame with all campaigns
    """
    aggregated = []
    for platform, df in platform_dfs.items():
        try:
            agg_df = aggregate_campaigns(df, platform)
            aggregated.append(agg_df)
        except Exception as e:
            import traceback
            print(f"Error aggregating {platform}: {e}")
            print(traceback.format_exc())
            continue

    if not aggregated:
        raise ValueError("No data could be aggregated from the provided files")

    unified = pd.concat(aggregated, ignore_index=True)
    return unified