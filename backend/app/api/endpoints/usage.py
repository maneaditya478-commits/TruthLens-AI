from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models.schema_models import ModelUsage
from backend.app.config import settings
from backend.app.schemas.schemas import UsageStatsResponse

router = APIRouter()

@router.get("/usage", response_model=UsageStatsResponse)
def get_usage_metrics(db: Session = Depends(get_db)):
    """Retrieve Bifrost AI Gateway usage, latency, and token consumption statistics."""
    usages = db.query(ModelUsage).order_by(desc(ModelUsage.created_at)).limit(50).all()

    total_calls = len(usages)
    total_in = sum(u.input_tokens for u in usages)
    total_out = sum(u.output_tokens for u in usages)
    avg_latency = round(sum(u.latency_ms for u in usages) / total_calls, 1) if total_calls > 0 else 0.0

    recent_calls = [
        {
            "id": u.id,
            "model_name": u.model_name,
            "input_tokens": u.input_tokens,
            "output_tokens": u.output_tokens,
            "latency_ms": u.latency_ms,
            "provider": u.provider,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in usages[:15]
    ]

    return UsageStatsResponse(
        total_calls=total_calls,
        total_input_tokens=total_in,
        total_output_tokens=total_out,
        avg_latency_ms=avg_latency,
        active_model=settings.BIFROST_MODEL,
        provider="Maxim AI Bifrost",
        gateway_status="Active" if settings.BIFROST_API_KEY else "Awaiting API Key",
        recent_calls=recent_calls
    )
