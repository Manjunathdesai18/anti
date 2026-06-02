import os
import torch
import sys

# Ensure ml_pipeline is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_pipeline.models import DeepfakeDetector

def generate_demo_weights():
    print("Generating demo weights to allow the inference API to run out-of-the-box...")
    
    # Initialize the model with pre-trained weights from timm (ImageNet)
    # The custom classifier head will be randomly initialized.
    # This provides a structurally complete model that will predict random values (for demo purposes).
    model = DeepfakeDetector(pretrained=True)
    
    os.makedirs("weights", exist_ok=True)
    weight_path = os.path.join("weights", "best_deepfake_model.pth")
    
    torch.save(model.state_dict(), weight_path)
    print(f"Demo weights saved successfully at: {weight_path}")
    print("You can now start the FastAPI backend and Streamlit frontend!")

if __name__ == "__main__":
    generate_demo_weights()
