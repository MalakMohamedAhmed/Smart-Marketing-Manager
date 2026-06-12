# pipeline/column_mapping.py

PLATFORM_COLUMN_MAPS = {
    "facebook": {
        # Identity
        "Campaign name":                "campaign_name",
        "Campaign Name":                "campaign_name",
        # Spend
        "Amount Spent":                 "acquisition_cost",
        "Amount spent (USD)":           "acquisition_cost",
        "Spend":                        "acquisition_cost",
        "Budget":                       "budget",
        "Daily Budget":                 "budget",
        "Lifetime Budget":              "budget",
        # Reach & delivery
        "Impressions":                  "impressions",
        "Reach":                        "reach",
        "Frequency":                    "frequency",
        "CPM (cost per 1,000 impressions)": "cpm",
        "CPM":                          "cpm",
        # Engagement
        "Clicks (all)":                 "clicks",
        "Clicks":                       "clicks",
        "CTR (all)":                    "ctr",
        "CTR":                          "ctr",
        "CPC (all)":                    "cpc",
        "CPC (Cost per click)":         "cpc",
        "CPC":                          "cpc",
        "Engagement Score":             "engagement_score",
        # Video
        "Video plays":                  "video_views",
        "Video Views":                  "video_views",
        "3-Second Video Plays":         "video_views",
        # Conversion
        "Results":                      "conversions",
        "Conversions":                  "conversions",
        "Conversion rate":              "conversion_rate",
        "Cost per result":              "cpr",
        "Cost per conversion":          "cpr",
        "Purchases":                    "purchases",
        "Leads":                        "leads",
        # Revenue
        "Revenue":                      "revenue",
        "Purchase ROAS (return on ad spend)": "roi",
        "ROAS":                         "roi",
        "ROI":                          "roi",
        # Setup
        "Objective":                    "campaign_type",
        "Campaign objective":           "campaign_type",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
        "Duration":                     "duration_days",
        # Date
        "Date":                         "date",
        "Day":                          "date",
        "Reporting starts":             "date",
    },

    "instagram": {
        "Campaign name":                "campaign_name",
        "Campaign Name":                "campaign_name",
        "Amount Spent":                 "acquisition_cost",
        "Amount spent (USD)":           "acquisition_cost",
        "Spend":                        "acquisition_cost",
        "Budget":                       "budget",
        "Impressions":                  "impressions",
        "Reach":                        "reach",
        "Frequency":                    "frequency",
        "CPM":                          "cpm",
        "Clicks":                       "clicks",
        "Clicks (all)":                 "clicks",
        "CTR":                          "ctr",
        "CTR (all)":                    "ctr",
        "CPC":                          "cpc",
        "Video Views":                  "video_views",
        "Video plays":                  "video_views",
        "Results":                      "conversions",
        "Conversions":                  "conversions",
        "Conversion rate":              "conversion_rate",
        "Cost per result":              "cpr",
        "Purchases":                    "purchases",
        "Leads":                        "leads",
        "Revenue":                      "revenue",
        "ROAS":                         "roi",
        "ROI":                          "roi",
        "Objective":                    "campaign_type",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
        "Date":                         "date",
        "Day":                          "date",
        "Engagement Score":             "engagement_score",
    },

    "tiktok": {
        "Campaign name":                "campaign_name",
        "Campaign Name":                "campaign_name",
        "Cost":                         "acquisition_cost",
        "Total cost":                   "acquisition_cost",
        "Spend":                        "acquisition_cost",
        "Budget":                       "budget",
        "Impressions":                  "impressions",
        "Reach":                        "reach",
        "Frequency":                    "frequency",
        "CPM":                          "cpm",
        "Clicks":                       "clicks",
        "CTR":                          "ctr",
        "CPC":                          "cpc",
        "Video views":                  "video_views",
        "Video Views":                  "video_views",
        "2-second video views":         "video_views",
        "Video view rate":              "video_view_rate",
        "Conversions":                  "conversions",
        "Conversion rate":              "conversion_rate",
        "Cost per conversion":          "cpr",
        "Cost Per Conversion":          "cpr",
        "Purchases":                    "purchases",
        "Leads":                        "leads",
        "Revenue":                      "revenue",
        "ROAS":                         "roi",
        "ROI":                          "roi",
        "Campaign objective":           "campaign_type",
        "Campaign Type":                "campaign_type",
        "Objective":                    "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
        "Date":                         "date",
        "Engagement Score":             "engagement_score",
    },

    "google": {
        "Campaign":                     "campaign_name",
        "Campaign name":                "campaign_name",
        "Cost":                         "acquisition_cost",
        "Avg. cost":                    "acquisition_cost",
        "Budget":                       "budget",
        "Impressions":                  "impressions",
        "CPM":                          "cpm",
        "Clicks":                       "clicks",
        "CTR":                          "ctr",
        "Avg. CPC":                     "cpc",
        "Conversions":                  "conversions",
        "Conv. rate":                   "conversion_rate",
        "Conversion rate":              "conversion_rate",
        "Cost / conv.":                 "cpr",
        "Cost per conversion":          "cpr",
        "Purchases":                    "purchases",
        "Leads":                        "leads",
        "Revenue":                      "revenue",
        "Conv. value / cost":           "roi",
        "ROAS":                         "roi",
        "ROI":                          "roi",
        "Campaign type":                "campaign_type",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
        "Date":                         "date",
        "Day":                          "date",
        "Engagement Score":             "engagement_score",
    },

    "youtube": {
        "Campaign":                     "campaign_name",
        "Campaign name":                "campaign_name",
        "Cost":                         "acquisition_cost",
        "Budget":                       "budget",
        "Impressions":                  "impressions",
        "Views":                        "video_views",
        "Video views":                  "video_views",
        "View rate":                    "video_view_rate",
        "Clicks":                       "clicks",
        "CTR":                          "ctr",
        "Avg. CPC":                     "cpc",
        "CPM":                          "cpm",
        "Conversions":                  "conversions",
        "Conv. rate":                   "conversion_rate",
        "Cost / conv.":                 "cpr",
        "Revenue":                      "revenue",
        "ROAS":                         "roi",
        "ROI":                          "roi",
        "Campaign type":                "campaign_type",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
        "Date":                         "date",
        "Day":                          "date",
        "Engagement Score":             "engagement_score",
    },

    "twitter": {
        "Campaign":                     "campaign_name",
        "Campaign name":                "campaign_name",
        "Spend":                        "acquisition_cost",
        "Budget":                       "budget",
        "Impressions":                  "impressions",
        "CPM":                          "cpm",
        "Clicks":                       "clicks",
        "CTR":                          "ctr",
        "CPC":                          "cpc",
        "Engagements":                  "clicks",
        "Engagement rate":              "engagement_score",
        "Conversions":                  "conversions",
        "Cost per conversion":          "cpr",
        "Conversion rate":              "conversion_rate",
        "Revenue":                      "revenue",
        "ROI":                          "roi",
        "Date":                         "date",
        "Start time":                   "date",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
        "Budget":                       "budget",
    },

    "pinterest": {
        "Campaign name":                "campaign_name",
        "Campaign":                     "campaign_name",
        "Spend":                        "acquisition_cost",
        "Budget":                       "budget",
        "Impressions":                  "impressions",
        "Reach":                        "reach",
        "Frequency":                    "frequency",
        "CPM":                          "cpm",
        "Clicks":                       "clicks",
        "CTR":                          "ctr",
        "CPC":                          "cpc",
        "Engagements":                  "engagement_score",
        "Engagement rate":              "engagement_score",
        "Saves":                        "leads",
        "Conversions":                  "conversions",
        "Conversion rate":              "conversion_rate",
        "Cost per conversion":          "cpr",
        "Revenue":                      "revenue",
        "ROAS":                         "roi",
        "ROI":                          "roi",
        "Date":                         "date",
        "Campaign objective":           "campaign_type",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
    },

    "whatsapp": {
        "Campaign Name":                "campaign_name",
        "Campaign name":                "campaign_name",
        "Cost":                         "acquisition_cost",
        "Spend":                        "acquisition_cost",
        "Budget":                       "budget",
        "Impressions":                  "impressions",
        "Delivered":                    "impressions",
        "Clicks":                       "clicks",
        "CTR":                          "ctr",
        "Click rate":                   "ctr",
        "Conversions":                  "conversions",
        "Conversion rate":              "conversion_rate",
        "Revenue":                      "revenue",
        "ROI":                          "roi",
        "Date":                         "date",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
    },

    "email": {
        "Campaign Name":                "campaign_name",
        "Campaign name":                "campaign_name",
        "Cost":                         "acquisition_cost",
        "Spend":                        "acquisition_cost",
        "Budget":                       "budget",
        "Emails Sent":                  "impressions",
        "Delivered":                    "impressions",
        "Sends":                        "impressions",
        "Clicks":                       "clicks",
        "Total Clicks":                 "clicks",
        "Unique Clicks":                "clicks",
        "Open Rate":                    "ctr",
        "Click Rate":                   "ctr",
        "CTR":                          "ctr",
        "Conversions":                  "conversions",
        "Conversion rate":              "conversion_rate",
        "Revenue":                      "revenue",
        "ROI":                          "roi",
        "Date":                         "date",
        "Send Date":                    "date",
        "Campaign Type":                "campaign_type",
        "Target Audience":              "target_audience",
        "Customer Segment":             "customer_segment",
        "Language":                     "language",
    },
}

# Minimum required columns after mapping to run the model
TIER_1_REQUIRED = [
    "campaign_name",
    "impressions",
    "clicks",
    "acquisition_cost",
    "conversions",
]

# Additional columns needed for Tier 2
TIER_2_REQUIRED = TIER_1_REQUIRED + [
    "roi",
    "budget",
    "date",
    "duration_days",
    "engagement_score",
    "target_audience",
]

def map_columns(df, platform):
    """Map platform-native column names to unified schema."""
    platform_key = platform.lower()
    mapping = PLATFORM_COLUMN_MAPS.get(platform_key, {})
    df = df.rename(columns=mapping)
    df["platform"] = platform.capitalize()
    return df

def get_completeness_tier(df):
    """
    Check which completeness tier the uploaded data falls into.
    Returns tier number (1, 2, 3) and list of missing critical columns.
    """
    cols = df.columns.tolist()

    # Check Tier 1
    missing_tier1 = [c for c in TIER_1_REQUIRED if c not in cols]
    if missing_tier1:
        return 0, missing_tier1

    # Check if roi and conversion_rate are present or derivable
    has_roi = "roi" in cols or ("revenue" in cols and "acquisition_cost" in cols)
    has_cvr = "conversion_rate" in cols or ("conversions" in cols and "clicks" in cols)

    if not has_roi or not has_cvr:
        return 0, ["roi or revenue", "conversion_rate or conversions+clicks"]

    # Check Tier 2
    missing_tier2 = [c for c in TIER_2_REQUIRED if c not in cols]
    if missing_tier2:
        return 1, missing_tier2

    # Tier 3 — everything present
    return 2, []

def get_detected_columns(df):
    """Return list of unified column names detected in the uploaded file."""
    all_unified = set()
    for mapping in PLATFORM_COLUMN_MAPS.values():
        all_unified.update(mapping.values())
    return [c for c in df.columns if c in all_unified]