# Deepfake Detection System Using Deep Learning
## Final Year Project Report Outline

### Abstract
With the rapid advancement of Generative AI, creating hyper-realistic manipulated images and videos (Deepfakes) has become easily accessible. This poses significant threats to privacy, security, and the integrity of digital media. This project presents an end-to-end Deepfake Detection System designed to classify uploaded media as 'REAL' or 'FAKE'. The system utilizes Multi-task Cascaded Convolutional Networks (MTCNN) for robust face extraction and an EfficientNet Convolutional Neural Network (CNN) architecture for feature extraction and classification. Furthermore, to enhance interpretability, we integrate Grad-CAM to visualize the facial regions that contributed most to the network's decision. 

### 1. Introduction
* **1.1 Background**: The rise of Generative Adversarial Networks (GANs) and diffusion models.
* **1.2 Problem Statement**: The difficulty of detecting synthetic media with the naked eye and the necessity for automated systems.
* **1.3 Objectives**: 
  * Develop a robust ML pipeline to detect deepfakes.
  * Implement an explainable AI component (Grad-CAM).
  * Build a scalable backend API (FastAPI).
  * Create a user-friendly frontend interface (Streamlit).
* **1.4 Scope**: Focus on facial manipulation in both static images and video formats.

### 2. Literature Review
* **2.1 Early Detection Methods**: Artifact detection and metadata analysis.
* **2.2 Deep Learning Approaches**: CNNs (ResNet, XceptionNet, EfficientNet) and Recurrent models for temporal sequence analysis.
* **2.3 Face Detection Technologies**: Haarcascades vs. DL-based models (MTCNN, RetinaFace).
* **2.4 Existing Datasets**: FaceForensics++, Celeb-DF, Deepfake Detection Challenge (DFDC).

### 3. Methodology
* **3.1 System Architecture**: Detailed breakdown of the ML Pipeline, Backend Server, and Frontend UI.
* **3.2 Face Extraction (MTCNN)**: How faces are localized and cropped with a margin.
* **3.3 Classification Model (EfficientNet)**: Why EfficientNet was chosen (balance of accuracy and computational efficiency) and the custom classification head.
* **3.4 Video Processing**: Frame sampling methodology to optimize processing speed while maintaining detection accuracy.
* **3.5 Explainability (Grad-CAM)**: Generating heatmaps by utilizing gradients flowing into the final convolutional layer.

### 4. Implementation Details
* **4.1 Technology Stack**: Python, PyTorch, FastAPI, Streamlit, OpenCV.
* **4.2 Data Preprocessing**: Normalization, resizing to $224 \times 224$, and tensor conversion.
* **4.3 API Design**: RESTful endpoints (`/predict/image`, `/predict/video`).
* **4.4 User Interface**: State management in Streamlit, progress feedback, and visual rendering of results.

### 5. Results and Evaluation
* **5.1 Training Metrics**: Accuracy, Loss curves over epochs.
* **5.2 Evaluation Metrics**: Precision, Recall, F1-Score on the validation set.
* **5.3 Inference Speed**: Average processing time per image and per video frame on CPU vs. GPU.
* **5.4 Qualitative Results**: Showcasing original images alongside Grad-CAM heatmaps.

### 6. Conclusion and Future Work
* **6.1 Conclusion**: Summary of achievements and system capabilities.
* **6.2 Limitations**: Challenges with heavily compressed videos or multi-person scenarios.
* **6.3 Future Work**: Integration of Vision Transformers (ViT), real-time WebRTC streaming, and federated learning for privacy-preserving model updates.

### References
* [1] Rossler, A., et al. (2019). FaceForensics++: Learning to Detect Manipulated Facial Images.
* [2] Tan, M., & Le, Q. (2019). EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks.
* [3] Selvaraju, R. R., et al. (2017). Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization.
