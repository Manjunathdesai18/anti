"""
upload_router.py — Protected upload, history, dashboard, and report endpoints.
"""

import os
import time
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models_db import User, Upload, Result
from ..auth import get_current_user
from ..schemas import (
    UploadOut, HistoryResponse, DashboardStats,
    ApiKeyResponse, ProfileUpdate, UserOut
)
from ..inference_service import InferenceService
from ..pdf_report import generate_pdf_report

router = APIRouter(prefix="/api", tags=["Uploads & Results"])

# Singleton inference service — loaded once at startup
_inference_service: Optional[InferenceService] = None

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/avi", "video/quicktime", "video/x-msvideo", "video/webm"}


def get_inference_service() -> InferenceService:
    global _inference_service
    if _inference_service is None:
        _inference_service = InferenceService()
    return _inference_service


def _build_explanation(prediction: str, confidence: float, file_type: str) -> str:
    """Generate a human-readable explanation of the prediction."""
    pct = confidence * 100
    if prediction == "FAKE":
        return (
            f"The {file_type} was classified as AI-GENERATED with {pct:.1f}% confidence. "
            "The model detected inconsistencies in facial texture, unnatural blending artifacts, "
            "and frequency-domain patterns typically introduced by generative AI models (GANs/Diffusion). "
            "The Grad-CAM heatmap highlights the specific facial regions that triggered this classification."
        )
    else:
        return (
            f"The {file_type} appears to be AUTHENTIC with {pct:.1f}% confidence. "
            "No significant deepfake artifacts were detected. The facial regions showed "
            "natural texture, consistent lighting, and organic frequency patterns consistent "
            "with real camera-captured media."
        )


# ── Upload Endpoint ────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadOut, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    svc: InferenceService = Depends(get_inference_service),
):
    """
    Upload an image or video for deepfake detection.
    Requires Bearer token or X-API-Key header.
    """
    content_type = file.content_type or ""

    if content_type in ALLOWED_IMAGE_TYPES:
        file_type = "image"
    elif content_type in ALLOWED_VIDEO_TYPES:
        file_type = "video"
    else:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {content_type}. Use JPEG/PNG/MP4/AVI."
        )

    # Save file to disk
    ext = os.path.splitext(file.filename)[1] or (".jpg" if file_type == "image" else ".mp4")
    safe_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    contents = await file.read()
    file_size = len(contents)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Create DB upload record (processing)
    db_upload = Upload(
        user_id=current_user.id,
        filename=file.filename,
        file_type=file_type,
        file_size=file_size,
        file_path=file_path,
        status="processing",
    )
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)

    # Run inference
    start_time = time.perf_counter()
    try:
        if file_type == "image":
            inference_result = svc.predict_image(contents)
        else:
            inference_result = svc.predict_video(file_path)

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        if "error" in inference_result:
            db_upload.status = "failed"
            db.commit()
            raise HTTPException(status_code=422, detail=inference_result["error"])

        # Build result
        prediction = inference_result.get("prediction") or inference_result.get("overall_prediction")
        confidence = inference_result.get("confidence") or inference_result.get("overall_confidence", 0.0)
        frame_results = inference_result.get("frame_results")
        bounding_box = inference_result.get("box")
        heatmap = inference_result.get("heatmap_base64")
        explanation = _build_explanation(prediction, confidence, file_type)

        db_result = Result(
            upload_id=db_upload.id,
            prediction=prediction,
            confidence=confidence,
            heatmap_base64=heatmap,
            frame_results=frame_results,
            bounding_box=list(bounding_box) if bounding_box else None,
            explanation=explanation,
            inference_time_ms=elapsed_ms,
        )
        db.add(db_result)
        db_upload.status = "success"
        db.commit()
        db.refresh(db_upload)

    except HTTPException:
        raise
    except Exception as e:
        db_upload.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    return UploadOut.model_validate(db_upload)


# ── History Endpoint ───────────────────────────────────────────────────

@router.get("/history", response_model=HistoryResponse)
def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return paginated upload history for the current user."""
    query = db.query(Upload).filter(Upload.user_id == current_user.id).order_by(Upload.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return HistoryResponse(
        items=[UploadOut.model_validate(i) for i in items],
        total=total,
        page=page,
        per_page=per_page,
    )


# ── Single Result Endpoint ─────────────────────────────────────────────

@router.get("/upload/{upload_id}", response_model=UploadOut)
def get_upload(
    upload_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a single upload with its result."""
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return UploadOut.model_validate(upload)


# ── Dashboard Stats ────────────────────────────────────────────────────

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregate stats for the current user's dashboard."""
    uploads = db.query(Upload).filter(Upload.user_id == current_user.id)

    total = uploads.count()
    processing = uploads.filter(Upload.status == "processing").count()

    results = (
        db.query(Result)
        .join(Upload)
        .filter(Upload.user_id == current_user.id)
    )
    fake_count = results.filter(Result.prediction == "FAKE").count()
    real_count = results.filter(Result.prediction == "REAL").count()

    recent = (
        uploads.filter(Upload.status == "success")
        .order_by(Upload.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardStats(
        total_uploads=total,
        fake_detected=fake_count,
        real_detected=real_count,
        processing=processing,
        recent_uploads=[UploadOut.model_validate(u) for u in recent],
    )


# ── PDF Report ─────────────────────────────────────────────────────────

@router.get("/report/{upload_id}")
def download_report(
    upload_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and download a PDF report for a completed analysis."""
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    if not upload.result:
        raise HTTPException(status_code=422, detail="No result available for this upload")

    upload_data = {
        "filename": upload.filename,
        "file_type": upload.file_type,
        "created_at": upload.created_at,
    }
    result_data = {
        "prediction": upload.result.prediction,
        "confidence": upload.result.confidence,
        "frame_results": upload.result.frame_results,
        "heatmap_base64": upload.result.heatmap_base64,
        "explanation": upload.result.explanation,
    }

    pdf_bytes = generate_pdf_report(upload_data, result_data, current_user.username)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="report_{upload_id[:8]}.pdf"'
        },
    )


# ── API Key Management ─────────────────────────────────────────────────

@router.post("/auth/regenerate-key", response_model=ApiKeyResponse)
def regenerate_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a new API key for the current user."""
    from ..auth import generate_api_key
    current_user.api_key = generate_api_key()
    db.commit()
    db.refresh(current_user)
    return ApiKeyResponse(api_key=current_user.api_key)


# ── Profile Update ─────────────────────────────────────────────────────

@router.patch("/auth/profile", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.email is not None:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=409, detail="Email already in use")
        current_user.email = payload.email
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)
