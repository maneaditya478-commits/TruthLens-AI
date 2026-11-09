from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.database import get_db
from backend.app.models.schema_models import VerificationRun
from backend.app.schemas.schemas import VerificationRunResponse

router = APIRouter()

@router.get("/reports/{id}", response_model=VerificationRunResponse)
def get_report(id: str, db: Session = Depends(get_db)):
    """Retrieve full verification report including claims, evidence, evaluations, and LLM telemetry."""
    report = db.query(VerificationRun).filter(VerificationRun.id == id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification report '{id}' not found."
        )
    return report
