"""
models_db.py — SQLAlchemy ORM models for Users, Uploads, and Results.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean,
    DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from .database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    """Registered user account."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar_url = Column(String, nullable=True)
    api_key = Column(String(64), unique=True, nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    uploads = relationship("Upload", back_populates="user", cascade="all, delete-orphan")


class Upload(Base):
    """Record of each file uploaded by a user."""
    __tablename__ = "uploads"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String(256), nullable=False)
    file_type = Column(String(10), nullable=False)   # 'image' | 'video'
    file_size = Column(Integer, nullable=True)        # bytes
    file_path = Column(String, nullable=True)         # local storage path
    status = Column(String(20), default="processing") # processing|success|failed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="uploads")
    result = relationship("Result", back_populates="upload", uselist=False, cascade="all, delete-orphan")


class Result(Base):
    """AI inference result linked to an Upload."""
    __tablename__ = "results"

    id = Column(String, primary_key=True, default=generate_uuid)
    upload_id = Column(String, ForeignKey("uploads.id"), nullable=False)
    prediction = Column(String(10), nullable=False)     # 'FAKE' | 'REAL'
    confidence = Column(Float, nullable=False)
    heatmap_base64 = Column(Text, nullable=True)        # Grad-CAM image
    frame_results = Column(JSON, nullable=True)         # video frame data
    bounding_box = Column(JSON, nullable=True)          # [x1,y1,x2,y2]
    explanation = Column(Text, nullable=True)           # text explanation
    inference_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    upload = relationship("Upload", back_populates="result")
