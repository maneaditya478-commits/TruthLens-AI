import os
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api.endpoints import (
    health_router,
    verify_router,
    claims_router,
    search_router,
    evaluate_router,
    reports_router,
    history_router,
    stats_router,
    usage_router,
    settings_router,
    benchmark_router
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("truthlens.main")

# Initialize database
init_db()
logger.info("TruthLens AI Backend initialized successfully.")

app = FastAPI(
    title="TruthLens AI Backend",
    description="Intelligent AI verification and information freshness platform powered by Bifrost & Tavily.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(verify_router, prefix="/api", tags=["Verification"])
app.include_router(claims_router, prefix="/api", tags=["Claims"])
app.include_router(search_router, prefix="/api", tags=["Search"])
app.include_router(evaluate_router, prefix="/api", tags=["Evaluation"])
app.include_router(reports_router, prefix="/api", tags=["Reports"])
app.include_router(history_router, prefix="/api", tags=["History"])
app.include_router(stats_router, prefix="/api", tags=["Stats"])
app.include_router(usage_router, prefix="/api", tags=["Usage"])
app.include_router(settings_router, prefix="/api", tags=["Settings"])
app.include_router(benchmark_router, prefix="/api", tags=["Benchmark"])

# Check for compiled frontend in frontend/dist
DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Do not intercept /api or /docs or /openapi.json
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = DIST_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(DIST_DIR / "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "TruthLens AI",
            "tagline": "Don't Just Trust AI. Verify It.",
            "status": "operational",
            "docs_url": "/docs"
        }
