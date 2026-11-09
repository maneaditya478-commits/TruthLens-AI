from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.schemas import EvaluateRequest, EvaluationResponse
from backend.app.services.evidence_comparator import evidence_comparator

router = APIRouter()

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_endpoint(payload: EvaluateRequest):
    """
    Evaluate a claim against retrieved web evidence.
    Routes through Bifrost AI Gateway and executes Freshness Formula.
    """
    try:
        evidence_dicts = [ev.model_dump() for ev in payload.evidence]
        evaluation, usage = await evidence_comparator.evaluate_claim(
            claim_text=payload.claim_text,
            category=payload.category or "General",
            risk_level=payload.risk_level or "MEDIUM",
            time_sensitive=bool(payload.time_sensitive),
            evidence_list=evidence_dicts
        )
        return evaluation
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Evaluation failed: {str(exc)}")
