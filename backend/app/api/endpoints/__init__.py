from backend.app.api.endpoints.health import router as health_router
from backend.app.api.endpoints.verify import router as verify_router
from backend.app.api.endpoints.claims import router as claims_router
from backend.app.api.endpoints.search import router as search_router
from backend.app.api.endpoints.evaluate import router as evaluate_router
from backend.app.api.endpoints.reports import router as reports_router
from backend.app.api.endpoints.history import router as history_router
from backend.app.api.endpoints.stats import router as stats_router
from backend.app.api.endpoints.usage import router as usage_router
from backend.app.api.endpoints.settings import router as settings_router
from backend.app.api.endpoints.benchmark import router as benchmark_router

__all__ = [
    "health_router",
    "verify_router",
    "claims_router",
    "search_router",
    "evaluate_router",
    "reports_router",
    "history_router",
    "stats_router",
    "usage_router",
    "settings_router",
    "benchmark_router"
]
