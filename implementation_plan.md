# Deepfake Detection End-to-End System

This document outlines the architecture and implementation plan for a complete, production-level AI project designed to detect whether uploaded images and videos are AI-generated (deepfakes) or real. 

The system will feature a PyTorch-based ML pipeline, a FastAPI backend, and a modern Streamlit frontend. It will also include necessary deliverables like a project report outline, a presentation structure, and training scripts.

## User Review Required

> [!IMPORTANT]
> **Model Selection**: We propose using **MTCNN** (via `facenet-pytorch`) for face extraction and **EfficientNet** for classification. For videos, we will extract frames and aggregate the predictions. Do you approve this architecture, or would you prefer XceptionNet or a 3D CNN?
>
> **Frontend Framework**: We propose using **Streamlit** because it is the industry standard for ML dashboards, supports drag-and-drop, provides excellent caching/progress bars, and integrates seamlessly with Python for displaying images, heatmaps, and dataframes. If you strictly need a separate React frontend, let us know, though Streamlit usually yields the best interactive ML experience for a final-year project.
>
> **Hardware Constraints**: The training scripts will be designed for PyTorch with CUDA support. Do you have a GPU available for running this, or should we ensure it falls back gracefully to CPU (which will be slower for video processing)?

## Open Questions

> [!TIP]
> 1. Do you have a specific dataset (like FaceForensics++ or Celeb-DF) already downloaded, or should I provide a script to generate a small synthetic dataset for immediate testing?
> 2. Do you want the Grad-CAM (Explainability) to be generated on the fly for every uploaded image/video frame, or only upon specific user request in the UI?

## Proposed Architecture

### 1. ML/DL Pipeline (`/ml_pipeline`)
- **Face Detection**: Use MTCNN to extract cropped faces from images and video frames.
- **Classification Model**: PyTorch-based EfficientNet-b4 architecture with a custom classification head.
- **Explainability**: Implement Grad-CAM to generate heatmaps highlighting manipulated regions.
- **Training**: Script to train the model on standard datasets with validation, checkpoints, and metrics logging (accuracy, F1-score).

### 2. Backend (`/backend`)
- **Framework**: FastAPI for high-performance async REST API endpoints.
- **Endpoints**:
  - `POST /predict/image`: Handles image uploads, runs MTCNN + EfficientNet, returns REAL/FAKE score and heatmap.
  - `POST /predict/video`: Handles video uploads, samples frames, runs inference, aggregates scores, returns frame-by-frame analysis.
- **Architecture**: Separated into routers, services (ML inference), and schemas (Pydantic models).

### 3. Frontend (`/frontend`)
- **Framework**: Streamlit.
- **Features**:
  - Drag-and-drop file uploader (Image/Video).
  - Real-time progress bar and status updates.
  - Interactive dashboard showing confidence scores, individual frame analysis, and Grad-CAM visual overlays.
  - Real-time webcam processing demo mode.

### 4. Deliverables & Documentation (`/docs`)
- **Report Outline**: Final year project report structure in Markdown.
- **Presentation Outline**: Slide-by-slide structure for the PPT.
- **README**: Comprehensive setup and execution instructions.

## Proposed Changes

---

### Machine Learning Core
The core deep learning and computer vision logic.

#### [NEW] `ml_pipeline/models.py`
PyTorch model definitions (EfficientNet classifier).
#### [NEW] `ml_pipeline/face_detector.py`
MTCNN wrapper for robust face extraction.
#### [NEW] `ml_pipeline/explainability.py`
Grad-CAM implementation to generate heatmaps over detected faces.
#### [NEW] `ml_pipeline/train.py`
Training loop with data loaders, loss functions, optimizer, and metrics evaluation.
#### [NEW] `ml_pipeline/dataset.py`
PyTorch Dataset class for handling generic Deepfake datasets.

---

### Backend Service
FastAPI REST application to serve the models.

#### [NEW] `backend/main.py`
FastAPI application entry point and configuration.
#### [NEW] `backend/api.py`
API route definitions for `/predict/image` and `/predict/video`.
#### [NEW] `backend/inference_service.py`
Bridge between the API routes and the `ml_pipeline` models. Handles file saving, preprocessing, batching, and cleanup.

---

### Frontend Dashboard
Streamlit application for user interaction.

#### [NEW] `frontend/app.py`
Main Streamlit app with sidebar navigation (Image, Video, Webcam, Analytics).
#### [NEW] `frontend/components.py`
UI helper functions for rendering metrics, confidence gauges, and heatmaps.

---

### Project Deliverables
Files for university submission.

#### [NEW] `docs/Project_Report.md`
Detailed report covering abstract, introduction, literature review, methodology, results, and conclusion.
#### [NEW] `docs/Presentation_Slides.md`
Content for presentation slides.
#### [NEW] `README.md`
Installation guide, environment setup, and execution steps.
#### [NEW] `requirements.txt`
Python dependencies (torch, torchvision, fastapi, streamlit, opencv-python, facenet-pytorch, etc.).

## Verification Plan

### Automated Tests
- Run PyTorch model forward pass with dummy tensors to verify architecture.
- Start FastAPI backend and send a test image via `curl`/`requests` to verify inference pipeline and response schema.

### Manual Verification
- Start the Streamlit app.
- Upload a test image and verify the face is detected, Grad-CAM is displayed, and a prediction is rendered.
- Upload a short test video and verify frame-by-frame analysis progress.
- Turn on webcam mode and verify real-time processing capability.
