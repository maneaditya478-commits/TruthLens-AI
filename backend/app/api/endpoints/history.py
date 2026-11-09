from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models.schema_models import VerificationRun
from backend.app.schemas.schemas import VerificationRunListItem

router = APIRouter()

@router.get("/history", response_model=List[VerificationRunListItem])
def get_history(
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve history of previous verification runs."""
    query = db.query(VerificationRun).order_by(desc(VerificationRun.created_at))
    if category and category != "All":
        query = query.filter(VerificationRun.category == category)

    runs = query.limit(limit).all()

    items = []
    for r in runs:
        snippet = r.input_text[:120] + "..." if len(r.input_text) > 120 else r.input_text
        items.append(
            VerificationRunListItem(
                id=r.id,
                original_question=r.original_question,
                category=r.category,
                verification_mode=r.verification_mode,
                overall_score=r.overall_score,
                total_claims=r.total_claims,
                created_at=r.created_at,
                input_snippet=snippet
            )
        )
    return items
