from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.config import settings

router = APIRouter()

@router.get("/health")
def check_health(db: Session = Depends(get_db)):
    """Health check for service, database, and integration status."""
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "online" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "integrations": {
            "bifrost": {
                "base_url": settings.BIFROST_BASE_URL,
                "model": settings.BIFROST_MODEL,
                "configured": bool(settings.BIFROST_API_KEY)
            },
            "tavily": {
                "configured": bool(settings.TAVILY_API_KEY)
            }
        },
        "environment": settings.ENVIRONMENT
    }
