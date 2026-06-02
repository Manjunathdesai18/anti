import torch
import torch.nn as nn
import timm

class DeepfakeDetector(nn.Module):
    def __init__(self, model_name='efficientnet_b4', pretrained=True):
        super(DeepfakeDetector, self).__init__()
        
        # Load pre-trained EfficientNet from timm
        self.encoder = timm.create_model(model_name, pretrained=pretrained)
        
        # Get the number of input features for the final fully connected layer
        num_features = self.encoder.get_classifier().in_features
        
        # Replace the classifier with a custom one for binary classification (REAL vs FAKE)
        self.encoder.classifier = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 1) # Single output for binary classification with BCEWithLogitsLoss
        )

    def forward(self, x):
        return self.encoder(x)

def get_transforms():
    """
    Returns standard torchvision transforms for EfficientNet.
    """
    from torchvision import transforms
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                             std=[0.229, 0.224, 0.225])
    ])

def load_model(model_path=None, device='cpu'):
    """
    Instantiates the model and optionally loads pre-trained weights.
    """
    model = DeepfakeDetector(pretrained=False)
    if model_path:
        try:
            model.load_state_dict(torch.load(model_path, map_location=device))
            print(f"Loaded weights from {model_path}")
        except Exception as e:
            print(f"Error loading model weights: {e}. Using random weights.")
    
    model = model.to(device)
    model.eval()
    return model
