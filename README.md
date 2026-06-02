# Deepfake Detection System

A complete, production-ready AI project to detect deepfake images and videos. 

## Features
- **Core**: Uses **MTCNN** for robust face extraction and **EfficientNet** for image classification.
- **Backend**: Built with **FastAPI** for high-performance API endpoints.
- **Frontend**: Interactive dashboard built with **Streamlit** (supports drag & drop, webcam, analytics).
- **Explainability**: Generates **Grad-CAM heatmaps** to visualize manipulated facial regions.
- **Video Analysis**: Frame-by-frame extraction and temporal prediction aggregation.

## Project Structure
```text
project/
│
├── ml_pipeline/          # Deep Learning Code
│   ├── models.py         # EfficientNet architecture
│   ├── face_detector.py  # MTCNN wrapper
│   ├── dataset.py        # PyTorch Dataset
│   ├── train.py          # Training script
│   └── explainability.py # Grad-CAM implementation
│
├── backend/              # FastAPI Application
│   ├── main.py           # App entry point
│   ├── api.py            # API Routes
│   └── inference_service.py # Inference logic
│
├── frontend/             # Streamlit Dashboard
│   ├── app.py            # Main UI
│   └── components.py     # UI Helpers
│
├── docs/                 # University Deliverables
│   ├── Project_Report.md
│   └── Presentation_Slides.md
│
└── requirements.txt
```

## Quick Start (Local Setup)

### 1. Install Dependencies
Ensure you have Python 3.9+ installed.
```bash
pip install -r requirements.txt
```

### 2. Generate Demo Weights (Optional)
To test the pipeline without training a model from scratch, you can generate a set of random initial weights so the inference service doesn't complain:
```bash
python setup_demo.py
```

### 3. Start the Backend API
In a new terminal window, start the FastAPI server:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
You can view the API documentation at `http://localhost:8000/docs`.

### 4. Start the Frontend Dashboard
In a separate terminal window, launch the Streamlit app:
```bash
streamlit run frontend/app.py
```
Open `http://localhost:8501` in your browser.

## Training the Model
To train the model on a dataset like FaceForensics++:
1. Organize your dataset into `train/` and `val/` directories, with `real/` and `fake/` subdirectories inside them.
2. Run the training script:
```bash
python ml_pipeline/train.py --data_dir /path/to/dataset --epochs 20 --batch_size 32
```
This will save the best model weights to the `weights/` directory.
