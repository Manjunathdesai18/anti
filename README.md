# DeepShield — AI Deepfake Detection & Forensic Analysis System

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.9%20%7C%203.10%20%7C%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2.1-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Image%20Processing-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An end-to-end deep learning platform designed to detect facial manipulation and synthetic media across images and video feeds with Explainable AI (Grad-CAM) heatmaps and forensic PDF reporting.

</div>

---

## 📌 Overview

With the rapid emergence of hyper-realistic generative models, distinguishing genuine media from synthetic deepfakes has become a critical challenge in cybersecurity and digital forensics. 

**DeepShield** provides an automated, production-ready pipeline that extracts facial regions using **MTCNN**, performs feature classification via **EfficientNet-B4**, and generates pixel-level spatial explanations with **Grad-CAM**. It includes both a high-throughput **FastAPI backend** and an intuitive **Streamlit user dashboard**.

---

## ✨ Key Features

- 🔍 **Automated Facial Extraction**: Leverages `facenet-pytorch` (MTCNN) to isolate and align facial regions from high-resolution imagery and video frames.
- 🧠 **High-Accuracy Classification**: Backbone powered by deep convolutional feature extractors (`EfficientNet-B4` / `timm`) trained on manipulation artifacts.
- 💡 **Explainable AI (Grad-CAM)**: Visual heatmaps highlighting the exact spatial zones (eyes, mouth, facial boundaries) that triggered detection confidence.
- 🎥 **Video Stream Analysis**: Frame-by-frame temporal sampling and confidence aggregation for full video media verification.
- 📄 **Forensic PDF Export**: Automated generation of cryptographic and diagnostic verification reports via `ReportLab`.
- 🔐 **Secure REST API**: Token-based authentication with `passlib`, `bcrypt`, and `python-jose` for enterprise integration.

---

## 🏗️ System Architecture

```text
┌─────────────────┐       ┌──────────────────┐       ┌────────────────────────┐
│  Streamlit UI   │ ────> │  FastAPI Server  │ ────> │ MTCNN Face Detection   │
│ (Webcam/Upload) │ <──── │ (JWT / Routing)  │ <──── │   & Alignment Engine   │
└─────────────────┘       └──────────────────┘       └───────────┬────────────┘
                                                                 │
                                                                 ▼
┌─────────────────┐       ┌──────────────────┐       ┌────────────────────────┐
│ Forensic PDF    │ <──── │ Grad-CAM Engine  │ <──── │ EfficientNet-B4 Model  │
│  Export Report  │       │ (Heatmap Render) │       │ (Real vs Fake Scoring) │
└─────────────────┘       └──────────────────┘       └────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+ (Python 3.10 recommended)
- CUDA-enabled GPU (optional, CPU supported by default)

### 1. Clone the Repository
```bash
git clone https://github.com/Manjunathdesai18/anti.git
cd anti
```

### 2. Set Up Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Setup Initial Weights (Demo Mode)
```bash
python setup_demo.py
```

### 5. Start the Services

**Terminal 1 — FastAPI Backend:**
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*API documentation available at `http://localhost:8000/docs`.*

**Terminal 2 — Streamlit Dashboard:**
```bash
streamlit run frontend/app.py
```
*Dashboard available at `http://localhost:8501`.*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/v1/auth/login` | Authenticate user & issue Bearer JWT | No |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/detect/image` | Upload image for real/fake classification | Yes |
| `POST` | `/api/v1/detect/video` | Upload video for temporal deepfake analysis | Yes |
| `GET` | `/api/v1/report/{scan_id}` | Generate downloadable forensic PDF report | Yes |

---

## 👨‍💻 Author

**Manjunath Desai**
- GitHub: [@Manjunathdesai18](https://github.com/Manjunathdesai18)
- Email: manjunathdesai920@gmail.com

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
