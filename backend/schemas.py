"""
schemas.py — Pydantic v2 request/response schemas.
"""

from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field


# ────────────────────────────────────────────────
# Auth Schemas
# ────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    api_key: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenWithUser(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ────────────────────────────────────────────────
# Upload / Result Schemas
# ────────────────────────────────────────────────

class FrameResult(BaseModel):
    frame_idx: int
    prediction: str
    confidence: float
    box: Optional[List[int]] = None


class ResultOut(BaseModel):
    id: str
    prediction: str
    confidence: float
    heatmap_base64: Optional[str] = None
    frame_results: Optional[List[FrameResult]] = None
    bounding_box: Optional[List[int]] = None
    explanation: Optional[str] = None
    inference_time_ms: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UploadOut(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: Optional[int] = None
    status: str
    created_at: datetime
    result: Optional[ResultOut] = None

    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    items: List[UploadOut]
    total: int
    page: int
    per_page: int


# ────────────────────────────────────────────────
# Dashboard Schemas
# ────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_uploads: int
    fake_detected: int
    real_detected: int
    processing: int
    recent_uploads: List[UploadOut]


# ────────────────────────────────────────────────
# API Key Schemas
# ────────────────────────────────────────────────

class ApiKeyResponse(BaseModel):
    api_key: str


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
