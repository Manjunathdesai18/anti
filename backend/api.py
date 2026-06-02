import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Assuming inference_service is imported in main and passed or singleton
from .inference_service import InferenceService

router = APIRouter()
inference_service = InferenceService()

class PredictionResponse(BaseModel):
    status: str
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    box: Optional[List[int]] = None
    heatmap_base64: Optional[str] = None
    error: Optional[str] = None

class FrameResult(BaseModel):
    frame_idx: int
    prediction: str
    confidence: float
    box: List[int]

class VideoPredictionResponse(BaseModel):
    status: str
    overall_prediction: Optional[str] = None
    overall_confidence: Optional[float] = None
    frame_results: Optional[List[FrameResult]] = None
    error: Optional[str] = None

@router.post("/predict/image", response_model=PredictionResponse)
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    contents = await file.read()
    result = inference_service.predict_image(contents)
    
    if "error" in result:
        return PredictionResponse(status="failed", error=result["error"])
        
    return PredictionResponse(
        status=result["status"],
        prediction=result["prediction"],
        confidence=result["confidence"],
        box=result["box"],
        heatmap_base64=result["heatmap_base64"]
    )

@router.post("/predict/video", response_model=VideoPredictionResponse)
async def predict_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File provided is not a video.")
        
    # Save video to temporary file for OpenCV to read
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        result = inference_service.predict_video(tmp_path)
        
    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)
            
    if "error" in result:
        return VideoPredictionResponse(status="failed", error=result["error"])
        
    return VideoPredictionResponse(
        status=result["status"],
        overall_prediction=result["overall_prediction"],
        overall_confidence=result["overall_confidence"],
        frame_results=result["frame_results"]
    )
