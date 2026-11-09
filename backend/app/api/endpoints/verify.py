import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pypdf import PdfReader

from backend.app.database import get_db
from backend.app.models.schema_models import VerificationRun
from backend.app.schemas.schemas import VerifyRequest, VerificationRunResponse
from backend.app.services.pipeline_coordinator import pipeline_coordinator

router = APIRouter()

@router.post("/verify", response_model=VerificationRunResponse)
async def verify_text(
    payload: VerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Run full verification on an AI-generated answer.
    Accepts text input, original question, category, and mode.
    """
    try:
        run = await pipeline_coordinator.run_verification(
            db=db,
            input_text=payload.input_text,
            original_question=payload.original_question,
            category=payload.category,
            verification_mode=payload.verification_mode
        )
        return run
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Verification failed: {str(exc)}")


@router.post("/verify/upload", response_model=VerificationRunResponse)
async def verify_file_upload(
    file: UploadFile = File(...),
    original_question: Optional[str] = Form(None),
    category: str = Form("Technology"),
    verification_mode: str = Form("standard"),
    db: Session = Depends(get_db)
):
    """
    Upload a TXT or PDF document containing an AI answer to verify.
    """
    filename = file.filename.lower() if file.filename else ""
    if not (filename.endswith(".txt") or filename.endswith(".pdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a .txt or .pdf file."
        )

    content_bytes = await file.read()
    if len(content_bytes) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File size exceeds 5MB limit.")

    extracted_text = ""
    if filename.endswith(".txt"):
        try:
            extracted_text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = content_bytes.decode("latin-1")
    elif filename.endswith(".pdf"):
        try:
            pdf_file = io.BytesIO(content_bytes)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read PDF: {str(e)}")

    extracted_text = extracted_text.strip()
    if not extracted_text or len(extracted_text) < 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded document contains insufficient text to verify.")

    try:
        run = await pipeline_coordinator.run_verification(
            db=db,
            input_text=extracted_text,
            original_question=original_question,
            category=category,
            verification_mode=verification_mode
        )
        return run
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"File verification failed: {str(exc)}")
