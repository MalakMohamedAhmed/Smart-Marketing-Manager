import numpy as np

# Platform-specific CTR benchmarks (realistic industry averages)
PLATFORM_CTR_BENCHMARKS = {
    "Facebook"    : 0.09,
    "Instagram"   : 0.08,
    "TikTok"      : 0.03,
    "Google"      : 0.06,
    "YouTube"     : 0.05,
    "Twitter"     : 0.08,
    "Pinterest"   : 0.05,
    "WhatsApp"    : 0.04,
    "Email"       : 0.03,
}

PLATFORM_CVR_BENCHMARKS = {
    "Facebook"    : 0.09,
    "Instagram"   : 0.08,
    "TikTok"      : 0.03,
    "Google"      : 0.08,
    "YouTube"     : 0.05,
    "Twitter"     : 0.05,
    "Pinterest"   : 0.04,
    "WhatsApp"    : 0.06,
    "Email"       : 0.08,
}

def safe_get(camp, key, default=0):
    val = camp.get(key, default)
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return default
    return val

def generate_recommendations(campaigns):
    """
    Generate recommendations at three levels:
    1. Per campaign
    2. Per platform (aggregate)
    3. Cross-platform comparison (if 2+ platforms)
    """
    recommendations = []
    available_features = _detect_available_features(campaigns)

    # ── Per-campaign recommendations ──────────────────────────────────
    for camp in campaigns:
        recs = _campaign_recommendations(camp, available_features)
        recommendations.extend(recs)

    # ── Platform-level recommendations ────────────────────────────────
    platform_recs = _platform_recommendations(campaigns, available_features)
    recommendations.extend(platform_recs)

    # ── Cross-platform recommendations ────────────────────────────────
    platforms = list(set(c.get("platform", "") for c in campaigns))
    if len(platforms) >= 2:
        cross_recs = _cross_platform_recommendations(campaigns, available_features)
        recommendations.extend(cross_recs)

    # Sort by priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))

    # Compute estimated monthly savings
    total_savings = sum(
        r.get("savings_amount", 0) for r in recommendations
    )

    return {
        "recommendations": recommendations,
        "summary": {
            "total":          len(recommendations),
            "high_priority":  sum(1 for r in recommendations if r["priority"] == "high"),
            "medium_priority": sum(1 for r in recommendations if r["priority"] == "medium"),
            "low_priority":   sum(1 for r in recommendations if r["priority"] == "low"),
            "est_monthly_savings": round(total_savings, 2),
        }
    }


def _detect_available_features(campaigns):
    """Detect which features are available across all campaigns."""
    if not campaigns:
        return set()
    all_keys = set()
    for camp in campaigns:
        all_keys.update(camp.keys())
    return all_keys


def _campaign_recommendations(camp, available_features):
    """Generate recommendations for a single campaign."""
    recs = []

    name     = camp.get("campaign_name", "Campaign")
    platform = camp.get("platform", "Unknown")
    perf     = camp.get("performance_label", "Medium")
    alert    = safe_get(camp, "alert_flag", 0)
    roi      = safe_get(camp, "roi", 0)
    ctr      = safe_get(camp, "ctr", 0)
    cvr      = safe_get(camp, "conversion_rate", 0)
    cpr      = safe_get(camp, "cpr", 0)
    cost     = safe_get(camp, "acquisition_cost", 0)
    budget   = safe_get(camp, "budget", 0)
    conversions = safe_get(camp, "conversions", 0)
    engagement  = safe_get(camp, "engagement_score", 0)

    ctr_benchmark = PLATFORM_CTR_BENCHMARKS.get(platform, 0.05)
    cvr_benchmark = PLATFORM_CVR_BENCHMARKS.get(platform, 0.05)

    # ── High performing — scale it ────────────────────────────────────
    if perf == "High" and alert == 0:
        savings = 0
        if "budget" in available_features and budget > 0:
            impact = f"+{int(conversions * 0.3)} estimated conversions/month"
        else:
            impact = "Estimated +20-30% more conversions"

        recs.append(_rec(
            priority="high",
            platform=platform,
            campaign=name,
            action="Scale Budget",
            title=f"Scale up '{name}' on {platform}",
            reason=(
                f"{platform} campaign is delivering strong ROI of {roi:.2f}x "
                f"with a conversion rate of {cvr:.1%}. "
                f"Increasing budget will maximize returns while performance is high."
            ),
            impact=impact,
            savings_amount=savings,
        ))

    # ── Alert flagged — pause or fix ──────────────────────────────────
    if alert == 1:
        if roi < 0:
            recs.append(_rec(
                priority="high",
                platform=platform,
                campaign=name,
                action="Pause Campaign",
                title=f"Pause '{name}' on {platform} — negative ROI",
                reason=(
                    f"This campaign is losing money with ROI of {roi:.2f}x. "
                    f"Every dollar spent is generating less than a dollar back. "
                    f"Pause immediately and review targeting, creative, and landing page."
                ),
                impact=f"${cost:.0f}/month saved",
                savings_amount=cost,
            ))
        else:
            recs.append(_rec(
                priority="high",
                platform=platform,
                campaign=name,
                action="Review Campaign",
                title=f"Review '{name}' on {platform} — underperforming",
                reason=(
                    f"Campaign ROI of {roi:.2f}x is below breakeven threshold "
                    f"with above-average spend. "
                    f"Review audience targeting and ad creative to improve efficiency."
                ),
                impact=f"Potential ${cost * 0.3:.0f}/month savings",
                savings_amount=cost * 0.3,
            ))

    # ── Low CTR — creative issue ──────────────────────────────────────
    if "ctr" in available_features and ctr < ctr_benchmark * 0.5 and perf != "High":
        recs.append(_rec(
            priority="medium",
            platform=platform,
            campaign=name,
            action="Refresh Creative",
            title=f"Refresh ad creative for '{name}' on {platform}",
            reason=(
                f"CTR of {ctr:.2%} is well below the {platform} benchmark "
                f"of {ctr_benchmark:.2%}. "
                f"Low CTR suggests the ad creative or copy is not resonating "
                f"with your audience. Try new visuals or messaging."
            ),
            impact="Estimated +15-30% CTR improvement",
            savings_amount=0,
        ))

    # ── Low CVR — targeting or landing page issue ─────────────────────
    if "conversion_rate" in available_features and cvr < cvr_benchmark * 0.5 and perf != "High":
        recs.append(_rec(
            priority="medium",
            platform=platform,
            campaign=name,
            action="Optimize Targeting",
            title=f"Improve conversion funnel for '{name}' on {platform}",
            reason=(
                f"Conversion rate of {cvr:.2%} is significantly below "
                f"the {platform} benchmark of {cvr_benchmark:.2%}. "
                f"People are clicking but not converting — review your "
                f"landing page, offer, or audience targeting."
            ),
            impact="Estimated -20% CPA improvement",
            savings_amount=0,
        ))

    # ── Medium performance — optimization opportunity ─────────────────
    if perf == "Medium" and alert == 0:
        if "target_audience" in available_features:
            recs.append(_rec(
                priority="low",
                platform=platform,
                campaign=name,
                action="Adjust Targeting",
                title=f"Refine audience targeting for '{name}' on {platform}",
                reason=(
                    f"Campaign is delivering moderate results with ROI of {roi:.2f}x. "
                    f"Better audience segmentation could push this into high performance. "
                    f"Test narrower audience segments or lookalike audiences."
                ),
                impact="Estimated +10-20% conversion improvement",
                savings_amount=0,
            ))

    return recs


def _platform_recommendations(campaigns, available_features):
    """Generate aggregate recommendations per platform."""
    recs = []

    # Group campaigns by platform
    platform_groups = {}
    for camp in campaigns:
        p = camp.get("platform", "Unknown")
        if p not in platform_groups:
            platform_groups[p] = []
        platform_groups[p].append(camp)

    for platform, camps in platform_groups.items():
        if not camps:
            continue

        avg_roi = np.mean([safe_get(c, "roi", 0) for c in camps])
        avg_ctr = np.mean([safe_get(c, "ctr", 0) for c in camps])
        avg_cvr = np.mean([safe_get(c, "conversion_rate", 0) for c in camps])
        total_cost = sum(safe_get(c, "acquisition_cost", 0) for c in camps)
        alert_count = sum(safe_get(c, "alert_flag", 0) for c in camps)
        high_count = sum(1 for c in camps if c.get("performance_label") == "High")
        low_count  = sum(1 for c in camps if c.get("performance_label") == "Low")

        # Many alerts on this platform
        if alert_count > len(camps) * 0.5:
            recs.append(_rec(
                priority="high",
                platform=platform,
                campaign="All campaigns",
                action="Platform Review",
                title=f"Review your {platform} strategy",
                reason=(
                    f"{alert_count} out of {len(camps)} {platform} campaigns "
                    f"are flagged for underperformance. "
                    f"This suggests a systematic issue with your {platform} "
                    f"strategy — targeting, creative, or budget allocation."
                ),
                impact=f"${total_cost * 0.2:.0f}/month potential savings",
                savings_amount=total_cost * 0.2,
            ))

        # Many high performers — invest more
        if high_count > len(camps) * 0.6 and avg_roi > 3.0:
            recs.append(_rec(
                priority="medium",
                platform=platform,
                campaign="All campaigns",
                action="Increase Investment",
                title=f"Increase overall {platform} investment",
                reason=(
                    f"{high_count} out of {len(camps)} {platform} campaigns "
                    f"are high performers with average ROI of {avg_roi:.2f}x. "
                    f"This platform is working well for you — consider "
                    f"increasing overall budget allocation."
                ),
                impact="Proportional increase in conversions",
                savings_amount=0,
            ))

    return recs


def _cross_platform_recommendations(campaigns, available_features):
    """Generate cross-platform comparison recommendations."""
    recs = []

    # Aggregate metrics per platform
    platform_metrics = {}
    for camp in campaigns:
        p = camp.get("platform", "Unknown")
        if p not in platform_metrics:
            platform_metrics[p] = {
                "roi": [], "ctr": [], "cvr": [],
                "cost": [], "conversions": []
            }
        platform_metrics[p]["roi"].append(safe_get(camp, "roi", 0))
        platform_metrics[p]["ctr"].append(safe_get(camp, "ctr", 0))
        platform_metrics[p]["cvr"].append(safe_get(camp, "conversion_rate", 0))
        platform_metrics[p]["cost"].append(safe_get(camp, "acquisition_cost", 0))
        platform_metrics[p]["conversions"].append(safe_get(camp, "conversions", 0))

    platform_avg = {
        p: {
            "roi"        : np.mean(m["roi"]),
            "ctr"        : np.mean(m["ctr"]),
            "cvr"        : np.mean(m["cvr"]),
            "total_cost" : sum(m["cost"]),
            "total_conv" : sum(m["conversions"]),
        }
        for p, m in platform_metrics.items()
    }

    if not platform_avg:
        return recs

    # Best and worst platform by ROI
    best_platform  = max(platform_avg, key=lambda p: platform_avg[p]["roi"])
    worst_platform = min(platform_avg, key=lambda p: platform_avg[p]["roi"])
    best_roi   = platform_avg[best_platform]["roi"]
    worst_roi  = platform_avg[worst_platform]["roi"]
    worst_cost = platform_avg[worst_platform]["total_cost"]

    if best_platform != worst_platform:
        # Recommend shifting budget from worst to best
        if worst_roi < 1.0 and best_roi > 3.0:
            recs.append(_rec(
                priority="high",
                platform=f"{worst_platform} → {best_platform}",
                campaign="Cross-platform",
                action="Reallocate Budget",
                title=f"Shift budget from {worst_platform} to {best_platform}",
                reason=(
                    f"{best_platform} is your best performing platform "
                    f"with average ROI of {best_roi:.2f}x, while "
                    f"{worst_platform} is underperforming at {worst_roi:.2f}x ROI. "
                    f"Reallocating budget will significantly improve overall returns."
                ),
                impact=f"Estimated ${worst_cost * 0.3:.0f}/month better returns",
                savings_amount=worst_cost * 0.3,
            ))
        elif best_roi > worst_roi * 1.5:
            recs.append(_rec(
                priority="medium",
                platform=f"{best_platform} vs {worst_platform}",
                campaign="Cross-platform",
                action="Optimize Mix",
                title=f"{best_platform} outperforming {worst_platform} by {(best_roi/max(worst_roi,0.1)):.1f}x",
                reason=(
                    f"{best_platform} delivers {best_roi:.2f}x ROI vs "
                    f"{worst_platform}'s {worst_roi:.2f}x. "
                    f"Consider gradually shifting more budget toward "
                    f"{best_platform} while testing improvements on {worst_platform}."
                ),
                impact="Estimated +15% overall ROI improvement",
                savings_amount=0,
            ))

    # Best platform by CVR
    if "conversion_rate" in available_features:
        best_cvr_platform = max(platform_avg, key=lambda p: platform_avg[p]["cvr"])
        best_cvr = platform_avg[best_cvr_platform]["cvr"]
        recs.append(_rec(
            priority="low",
            platform=best_cvr_platform,
            campaign="Cross-platform",
            action="Focus Conversions",
            title=f"{best_cvr_platform} has your highest conversion rate at {best_cvr:.1%}",
            reason=(
                f"If your goal is maximizing conversions, "
                f"{best_cvr_platform} is your most efficient platform. "
                f"Prioritize conversion-focused campaigns here."
            ),
            impact="Better conversion efficiency per dollar spent",
            savings_amount=0,
        ))

    return recs


def _rec(priority, platform, campaign, action,
         title, reason, impact, savings_amount=0):
    """Helper to build a recommendation dict."""
    return {
        "priority"       : priority,
        "platform"       : platform,
        "campaign"       : campaign,
        "action"         : action,
        "title"          : title,
        "reason"         : reason,
        "impact"         : impact,
        "savings_amount" : savings_amount,
    }