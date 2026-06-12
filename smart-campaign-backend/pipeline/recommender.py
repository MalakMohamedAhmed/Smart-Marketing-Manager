def generate_recommendations(campaigns):
    recommendations = []

    for camp in campaigns:
        name = camp.get("campaign_name", "Campaign")
        platform = camp.get("platform", "").capitalize()
        perf = camp.get("performance_label", "Medium")
        alert = camp.get("alert_flag", 0)
        roi = camp.get("roi", 0)
        ctr = camp.get("ctr", 0)
        cpr = camp.get("cpr", 0)
        acquisition_cost = camp.get("acquisition_cost", 0)
        conversions = camp.get("conversions", 0)
        budget = camp.get("budget", 0)

        if perf == "High" and alert == 0:
            recommendations.append({
                "priority": "high",
                "platform": platform,
                "campaign": name,
                "action": "Scale Budget",
                "title": f"Increase {platform} budget for '{name}'",
                "reason": f"This campaign is performing well with strong ROI of {roi:.1%}. Scaling budget will maximize returns.",
                "impact": f"+{int(conversions * 0.3)} estimated additional conversions/month",
                "color": "#4ade80"
            })

        elif perf == "Low" or alert == 1:
            recommendations.append({
                "priority": "high",
                "platform": platform,
                "campaign": name,
                "action": "Pause Campaign",
                "title": f"Pause underperforming '{name}' on {platform}",
                "reason": f"This campaign has low performance with high cost per result (CPR: ${cpr:.2f}). Budget should be reallocated.",
                "impact": f"${acquisition_cost:.0f}/month saved",
                "color": "#f87171"
            })

        elif perf == "Medium":
            if ctr and ctr < 0.02:
                recommendations.append({
                    "priority": "medium",
                    "platform": platform,
                    "campaign": name,
                    "action": "Improve Creative",
                    "title": f"Refresh ad creative for '{name}' on {platform}",
                    "reason": f"CTR is below average at {ctr:.2%}. New visuals or copy could significantly improve engagement.",
                    "impact": "Estimated +15-25% CTR improvement",
                    "color": "#fbbf24"
                })
            else:
                recommendations.append({
                    "priority": "medium",
                    "platform": platform,
                    "campaign": name,
                    "action": "Optimize Targeting",
                    "title": f"Refine audience targeting for '{name}' on {platform}",
                    "reason": f"Campaign is performing at medium level. Better audience segmentation could improve conversion rate.",
                    "impact": "Estimated -10% CPA improvement",
                    "color": "#fbbf24"
                })

    return recommendations