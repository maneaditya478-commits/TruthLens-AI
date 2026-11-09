from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.schemas import SearchRequest
from backend.app.services.tavily_service import tavily_service

router = APIRouter()

@router.post("/search")
async def search_endpoint(payload: SearchRequest):
    """
    Search the live web for evidence supporting or refuting a claim.
    Powered by Tavily Live Search API.
    """
    try:
        evidence = await tavily_service.search_claim(
            claim_text=payload.claim_text,
            search_depth=payload.depth or "standard"
        )
        return {
            "query": payload.claim_text,
            "evidence": evidence,
            "count": len(evidence)
        }
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Search failed: {str(exc)}")
