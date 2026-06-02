import cv2
import torch
import numpy as np
from facenet_pytorch import MTCNN
from PIL import Image

class FaceDetector:
    def __init__(self, device='cpu'):
        self.device = device
        # Initialize MTCNN for face detection
        self.mtcnn = MTCNN(
            keep_all=False,       # Only keep the most prominent face
            device=self.device,
            margin=20,            # Add some margin around the face
            min_face_size=40,
            post_process=False    # We'll handle post-processing
        )

    def extract_face(self, image_np):
        """
        Extracts a face from an image (NumPy array).
        Returns the cropped face as a PIL Image and the bounding box.
        """
        try:
            # Convert OpenCV BGR to RGB
            image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
            img_pil = Image.fromarray(image_rgb)
            
            # Detect faces
            boxes, probs = self.mtcnn.detect(img_pil)
            
            if boxes is not None and len(boxes) > 0:
                # Use the face with highest probability
                box = boxes[0]
                prob = probs[0]
                
                if prob > 0.90:  # Confidence threshold
                    # Ensure coordinates are within image boundaries
                    x1, y1, x2, y2 = [int(b) for b in box]
                    x1 = max(0, x1)
                    y1 = max(0, y1)
                    x2 = min(image_np.shape[1], x2)
                    y2 = min(image_np.shape[0], y2)
                    
                    # Crop face
                    face_crop = image_rgb[y1:y2, x1:x2]
                    
                    if face_crop.size > 0:
                        return Image.fromarray(face_crop), (x1, y1, x2, y2)
            
            return None, None
            
        except Exception as e:
            print(f"Error in face detection: {str(e)}")
            return None, None

    def process_video(self, video_path, num_frames=10):
        """
        Extracts faces from evenly spaced frames in a video.
        """
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if total_frames == 0:
            return []

        # Calculate interval to get exactly num_frames
        interval = max(1, total_frames // num_frames)
        
        faces = []
        boxes = []
        frame_indices = []
        
        frame_idx = 0
        extracted = 0
        
        while cap.isOpened() and extracted < num_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_idx % interval == 0:
                face, box = self.extract_face(frame)
                if face is not None:
                    faces.append(face)
                    boxes.append(box)
                    frame_indices.append(frame_idx)
                    extracted += 1
            
            frame_idx += 1
            
        cap.release()
        return faces, boxes, frame_indices
