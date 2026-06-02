"""
main.py — FastAPI application entry point.
Initializes DB, registers all routers, configures CORS and static file serving.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from .database import init_db
from .routers.auth_router import router as auth_router
from .routers.upload_router import router as upload_router
from .api import router as legacy_router  # keep /predict/* endpoints

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle handler."""
    print("[STARTUP] Deepfake Detective API starting...")
    init_db()
    yield
    print("[SHUTDOWN] Deepfake Detective API stopped.")


app = FastAPI(
    title="Deepfake Detective API",
    description=(
        "Production-grade REST API for AI-generated media detection. "
        "Supports JWT auth, image/video upload, Grad-CAM heatmaps, "
        "PDF reports, and an API-key system for external integrations."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(legacy_router)  # /predict/image, /predict/video

# ── Static file serving for uploaded files ────────────────────────────
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": "Deepfake Detective API",
        "version": "2.0.0",
        "docs": "/api/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
