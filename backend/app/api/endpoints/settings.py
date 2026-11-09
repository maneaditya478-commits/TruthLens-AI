from fastapi import APIRouter
from backend.app.config import settings, update_runtime_settings
from backend.app.schemas.schemas import SettingsResponse, UpdateSettingsRequest
from backend.app.services.bifrost_service import bifrost_service
from backend.app.services.tavily_service import tavily_service

router = APIRouter()

@router.get("/settings", response_model=SettingsResponse)
async def get_current_settings():
    """Retrieve non-sensitive configuration settings."""
    return SettingsResponse(
        bifrost_base_url=settings.BIFROST_BASE_URL,
        bifrost_model=settings.BIFROST_MODEL,
        bifrost_fallback_model=settings.BIFROST_FALLBACK_MODEL,
        bifrost_key_configured=bool(settings.BIFROST_API_KEY),
        tavily_key_configured=bool(settings.TAVILY_API_KEY),
        environment=settings.ENVIRONMENT
    )

@router.post("/settings", response_model=SettingsResponse)
async def update_settings(payload: UpdateSettingsRequest):
    """Update API keys and Bifrost endpoint configuration at runtime."""
    update_runtime_settings(
        bifrost_base_url=payload.bifrost_base_url,
        bifrost_api_key=payload.bifrost_api_key,
        bifrost_model=payload.bifrost_model,
        tavily_api_key=payload.tavily_api_key
    )
    return SettingsResponse(
        bifrost_base_url=settings.BIFROST_BASE_URL,
        bifrost_model=settings.BIFROST_MODEL,
        bifrost_fallback_model=settings.BIFROST_FALLBACK_MODEL,
        bifrost_key_configured=bool(settings.BIFROST_API_KEY),
        tavily_key_configured=bool(settings.TAVILY_API_KEY),
        environment=settings.ENVIRONMENT
    )

@router.post("/settings/test-bifrost")
async def test_bifrost_connection():
    """Test connection to Maxim AI Bifrost Gateway."""
    return await bifrost_service.test_connection()

@router.post("/settings/test-tavily")
async def test_tavily_connection():
    """Test connection to Tavily Search API."""
    return await tavily_service.test_connection()
