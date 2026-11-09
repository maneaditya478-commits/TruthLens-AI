from typing import List, Dict, Any
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema_models import VerificationRun, Claim, Evaluation, ModelUsage
from backend.app.schemas.schemas import DashboardStatsResponse

router = APIRouter()

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes comprehensive dashboard analytics from database records."""

    # 1. Total Runs & Average Freshness
    all_runs = db.query(VerificationRun).all()
    total_runs = len(all_runs)
    avg_freshness = (
        round(sum(r.overall_score for r in all_runs) / total_runs, 1)
        if total_runs > 0 else 0.0
    )

    # 2. Claims & Status Breakdown
    all_evals = db.query(Evaluation).all()
    total_claims = len(all_evals)

    status_counts = {
        "VERIFIED": 0,
        "POTENTIALLY_STALE": 0,
        "CONTRADICTED": 0,
        "UNVERIFIED": 0,
        "CONFLICTING_EVIDENCE": 0
    }
    for ev in all_evals:
        status_key = ev.status.upper()
        if status_key in status_counts:
            status_counts[status_key] += 1
        else:
            status_counts["UNVERIFIED"] += 1

    # 3. Model Usages, Tokens & Latency
    all_usages = db.query(ModelUsage).all()
    total_tokens = sum(u.input_tokens + u.output_tokens for u in all_usages)
    avg_latency = (
        round(sum(u.latency_ms for u in all_usages) / len(all_usages), 1)
        if all_usages else 0.0
    )

    # 4. Status Distribution for Recharts Pie
    status_colors = {
        "VERIFIED": "#10B981",            # Emerald
        "POTENTIALLY_STALE": "#F59E0B",   # Amber
        "CONTRADICTED": "#EF4444",       # Red
        "UNVERIFIED": "#6B7280",         # Gray
        "CONFLICTING_EVIDENCE": "#8B5CF6" # Violet
    }
    status_distribution = [
        {"name": "Verified", "value": status_counts["VERIFIED"], "color": status_colors["VERIFIED"]},
        {"name": "Potentially Stale", "value": status_counts["POTENTIALLY_STALE"], "color": status_colors["POTENTIALLY_STALE"]},
        {"name": "Contradicted", "value": status_counts["CONTRADICTED"], "color": status_colors["CONTRADICTED"]},
        {"name": "Unverified", "value": status_counts["UNVERIFIED"], "color": status_colors["UNVERIFIED"]},
        {"name": "Conflicting", "value": status_counts["CONFLICTING_EVIDENCE"], "color": status_colors["CONFLICTING_EVIDENCE"]}
    ]

    # 5. Score Distribution Histogram (0-20, 21-40, 41-60, 61-80, 81-100)
    score_buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for ev in all_evals:
        s = ev.freshness_score
        if s <= 20:
            score_buckets["0-20"] += 1
        elif s <= 40:
            score_buckets["21-40"] += 1
        elif s <= 60:
            score_buckets["41-60"] += 1
        elif s <= 80:
            score_buckets["61-80"] += 1
        else:
            score_buckets["81-100"] += 1

    score_distribution = [
        {"range": k, "count": v} for k, v in score_buckets.items()
    ]

    # 6. Category Freshness Average
    category_scores = defaultdict(list)
    for r in all_runs:
        category_scores[r.category].append(r.overall_score)

    category_freshness = [
        {
            "category": cat,
            "avg_score": round(sum(scores) / len(scores), 1),
            "runs": len(scores)
        }
        for cat, scores in category_scores.items()
    ]

    # 7. Activity Timeline
    timeline_map = defaultdict(lambda: {"runs": 0, "claims": 0})
    for r in all_runs:
        day_str = r.created_at.strftime("%b %d")
        timeline_map[day_str]["runs"] += 1
        timeline_map[day_str]["claims"] += r.total_claims

    activity_timeline = [
        {"date": day, "runs": data["runs"], "claims": data["claims"]}
        for day, data in timeline_map.items()
    ]

    # 8. Token Usage History
    token_usage_history = [
        {
            "id": u.id[:8],
            "model": u.model_name,
            "tokens": u.input_tokens + u.output_tokens,
            "latency": u.latency_ms,
            "time": u.created_at.strftime("%H:%M:%S")
        }
        for u in all_usages[-10:]
    ]

    return DashboardStatsResponse(
        total_runs=total_runs,
        total_claims=total_claims,
        verified_claims=status_counts["VERIFIED"],
        potentially_stale_claims=status_counts["POTENTIALLY_STALE"],
        contradicted_claims=status_counts["CONTRADICTED"],
        unverified_claims=status_counts["UNVERIFIED"],
        conflicting_claims=status_counts["CONFLICTING_EVIDENCE"],
        avg_freshness_score=avg_freshness,
        avg_latency_ms=avg_latency,
        total_tokens_consumed=total_tokens,
        status_distribution=status_distribution,
        score_distribution=score_distribution,
        activity_timeline=activity_timeline,
        category_freshness=category_freshness,
        token_usage_history=token_usage_history
    )
