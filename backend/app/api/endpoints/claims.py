from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.schemas import ExtractClaimsRequest
from backend.app.services.claim_extractor import claim_extractor

router = APIRouter()

@router.post("/claims/extract")
async def extract_claims_endpoint(payload: ExtractClaimsRequest):
    """
    Extract atomic factual claims and classify freshness risk.
    Routes directly through Bifrost AI Gateway.
    """
    try:
        claims, usage = await claim_extractor.extract_claims(
            input_text=payload.input_text,
            category_hint=payload.category or "Technology"
        )
        return {
            "claims": claims,
            "total_extracted": len(claims),
            "model_usage": usage
        }
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Claim extraction failed: {str(exc)}")
