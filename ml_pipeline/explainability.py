import torch
import cv2
import numpy as np
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

class DeepfakeExplainability:
    def __init__(self, model, target_layer, device='cpu'):
        """
        Initializes Grad-CAM for a given model and target layer.
        For EfficientNet from timm, the target layer is usually something like:
        model.encoder.conv_head or model.encoder.blocks[-1]
        """
        self.model = model
        self.device = device
        
        # Ensure model is in eval mode for Grad-CAM
        self.model.eval()
        
        # Initialize Grad-CAM
        self.cam = GradCAM(model=self.model, target_layers=[target_layer])

    def generate_heatmap(self, input_tensor, original_image):
        """
        Generates a Grad-CAM heatmap and overlays it on the original image.
        
        Args:
            input_tensor (torch.Tensor): Preprocessed image tensor (1, C, H, W).
            original_image (PIL.Image or np.ndarray): Original image (RGB) to overlay heatmap on.
            
        Returns:
            np.ndarray: Image with heatmap overlay (RGB).
        """
        # Convert PIL to numpy if needed
        if not isinstance(original_image, np.ndarray):
            original_image = np.array(original_image)
            
        # Ensure image is in float format [0, 1] for show_cam_on_image
        if original_image.dtype == np.uint8:
            rgb_img = np.float32(original_image) / 255.0
        else:
            rgb_img = original_image

        # We target the 'FAKE' class if it's binary, or just the top prediction.
        # Since we use BCEWithLogits, we can pass None to use the max activation.
        targets = None
        
        # Generate CAM
        grayscale_cam = self.cam(input_tensor=input_tensor, targets=targets)
        
        # In this case, we have batch size of 1
        grayscale_cam = grayscale_cam[0, :]
        
        # Resize grayscale_cam to match original image dimensions if necessary
        if grayscale_cam.shape != rgb_img.shape[:2]:
            grayscale_cam = cv2.resize(grayscale_cam, (rgb_img.shape[1], rgb_img.shape[0]))

        # Overlay heatmap on image
        visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
        
        return visualization
