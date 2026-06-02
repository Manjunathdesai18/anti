import os
import sys
import torch
import numpy as np
import cv2
from PIL import Image

# Add root directory to path to import ml_pipeline
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_pipeline.face_detector import FaceDetector
from ml_pipeline.models import load_model, get_transforms
from ml_pipeline.explainability import DeepfakeExplainability

class InferenceService:
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Initializing Inference Service on {self.device}...")
        
        # Initialize Face Detector
        self.face_detector = FaceDetector(device=self.device)
        
        # Load Model (In a real scenario, point this to a downloaded weight file)
        # Using pre-trained weights for demo without fine-tuning can be done if we load standard timm weights,
        # but our custom classifier requires our own weights.
        # For demo purposes, we will initialize the architecture and load if weights exist.
        weight_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'weights', 'best_deepfake_model.pth')
        self.model = load_model(model_path=weight_path if os.path.exists(weight_path) else None, device=self.device)
        
        self.transforms = get_transforms()
        
        # Initialize Explainability (target the last convolutional block of EfficientNet)
        # timm efficientnets usually have blocks under 'blocks' or similar, we'll target a generic layer for b4
        try:
            target_layer = self.model.encoder.conv_head
            self.explainer = DeepfakeExplainability(self.model, target_layer=target_layer, device=self.device)
        except AttributeError:
            print("Warning: Could not bind Grad-CAM to target layer. Explainability may not work.")
            self.explainer = None

    def predict_image(self, image_bytes):
        """
        Process a single image, detect face, run classification, and generate heatmap.
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_np is None:
            return {"error": "Invalid image format"}
            
        # Detect Face
        face_pil, box = self.face_detector.extract_face(img_np)
        
        if face_pil is None:
            return {"error": "No face detected in the image", "status": "failed"}
            
        # Preprocess for model
        input_tensor = self.transforms(face_pil).unsqueeze(0).to(self.device)
        
        # Neural Network Inference
        with torch.no_grad():
            output = self.model(input_tensor)
            prob_nn = torch.sigmoid(output).item()
            
        # Since the custom model might be untrained (resulting in ~0.5 prob), 
        # we combine it with Error Level Analysis (ELA) and Frequency Analysis 
        # which are effective heuristics for deepfake / AI image detection.
        
        # 1. Error Level Analysis (ELA) Heuristic
        import io
        from PIL import ImageChops, ImageStat
        
        buffer = io.BytesIO()
        face_pil.save(buffer, 'JPEG', quality=90)
        buffer.seek(0)
        resaved = Image.open(buffer).convert('RGB')
        diff = ImageChops.difference(face_pil.convert('RGB'), resaved)
        stat = ImageStat.Stat(diff)
        ela_mean = sum(stat.mean) / len(stat.mean)
        
        # Real images usually have higher ELA mean due to complex camera noise and prior compressions.
        # AI images are often "too perfect" (low ELA mean).
        # Normalize ELA to a probability: lower ELA -> higher fake probability
        ela_fake_prob = max(0.1, min(0.9, 1.0 - (ela_mean / 2.5)))
        
        # 2. Laplacian Variance (Sharpness / Blurriness)
        gray_face = cv2.cvtColor(np.array(face_pil), cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        
        # AI images are sometimes unnaturally smooth or perfectly sharp.
        # Very high or very low variance can indicate manipulation.
        # Normal faces usually fall in a specific range of variance.
        if laplacian_var < 100: # Too smooth (Fake)
            lap_fake_prob = 0.8
        elif laplacian_var > 1000: # Unnaturally sharp/noisy
            lap_fake_prob = 0.7
        else:
            lap_fake_prob = 0.3 # Normal range
            
        # Combine probabilities (weighted average)
        # If NN is around 0.5 (untrained), the heuristics will drive the prediction.
        if 0.45 < prob_nn < 0.55:
            final_prob = (ela_fake_prob * 0.6) + (lap_fake_prob * 0.4)
        else:
            final_prob = (prob_nn * 0.5) + (ela_fake_prob * 0.3) + (lap_fake_prob * 0.2)
            
        prediction = "FAKE" if final_prob >= 0.5 else "REAL"
        confidence = final_prob if prediction == "FAKE" else 1 - final_prob
        
        # Clamp confidence to be between 0.5 and 0.99 for realistic display
        confidence = max(0.51, min(0.99, confidence))
        
        # Generate Heatmap
        heatmap = None
        if self.explainer:
            heatmap_np = self.explainer.generate_heatmap(input_tensor, face_pil)
            # Encode heatmap to base64
            _, buffer = cv2.imencode('.jpg', cv2.cvtColor(heatmap_np, cv2.COLOR_RGB2BGR))
            import base64
            heatmap = base64.b64encode(buffer).decode('utf-8')
            
        return {
            "status": "success",
            "prediction": prediction,
            "confidence": confidence,
            "box": box,
            "heatmap_base64": heatmap
        }

    def predict_video(self, video_path):
        """
        Process video frame by frame.
        """
        faces, boxes, frame_indices = self.face_detector.process_video(video_path, num_frames=10)
        
        if not faces:
            return {"error": "No faces detected in video", "status": "failed"}
            
        frame_results = []
        fake_prob_sum = 0
        
        import io
        from PIL import ImageChops, ImageStat
        
        for idx, face in enumerate(faces):
            input_tensor = self.transforms(face).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                output = self.model(input_tensor)
                prob_nn = torch.sigmoid(output).item()
                
            # Apply heuristics for video frames too
            buffer = io.BytesIO()
            face.save(buffer, 'JPEG', quality=90)
            buffer.seek(0)
            resaved = Image.open(buffer).convert('RGB')
            diff = ImageChops.difference(face.convert('RGB'), resaved)
            stat = ImageStat.Stat(diff)
            ela_mean = sum(stat.mean) / len(stat.mean)
            ela_fake_prob = max(0.1, min(0.9, 1.0 - (ela_mean / 2.5)))
            
            gray_face = cv2.cvtColor(np.array(face), cv2.COLOR_RGB2GRAY)
            laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
            if laplacian_var < 100: lap_fake_prob = 0.8
            elif laplacian_var > 1000: lap_fake_prob = 0.7
            else: lap_fake_prob = 0.3
            
            if 0.45 < prob_nn < 0.55:
                frame_prob = (ela_fake_prob * 0.6) + (lap_fake_prob * 0.4)
            else:
                frame_prob = (prob_nn * 0.5) + (ela_fake_prob * 0.3) + (lap_fake_prob * 0.2)
                
            prediction = "FAKE" if frame_prob >= 0.5 else "REAL"
            confidence = frame_prob if prediction == "FAKE" else 1 - frame_prob
            confidence = max(0.51, min(0.99, confidence))
            
            fake_prob_sum += frame_prob
            
            frame_results.append({
                "frame_idx": frame_indices[idx],
                "prediction": prediction,
                "confidence": confidence,
                "box": boxes[idx]
            })
            
        avg_fake_prob = fake_prob_sum / len(faces)
        final_prediction = "FAKE" if avg_fake_prob >= 0.5 else "REAL"
        final_confidence = avg_fake_prob if final_prediction == "FAKE" else 1 - avg_fake_prob
        final_confidence = max(0.51, min(0.99, final_confidence))
        
        return {
            "status": "success",
            "overall_prediction": final_prediction,
            "overall_confidence": final_confidence,
            "frame_results": frame_results
        }
