import os
from PIL import Image
import torch
from torch.utils.data import Dataset

class DeepfakeDataset(Dataset):
    def __init__(self, data_dir, transform=None):
        """
        Custom Dataset for loading REAL and FAKE images.
        Assumes directory structure:
        data_dir/
            real/
                img1.jpg
                ...
            fake/
                img1.jpg
                ...
        """
        self.data_dir = data_dir
        self.transform = transform
        self.samples = []
        
        # Load REAL samples (Label 0)
        real_dir = os.path.join(data_dir, 'real')
        if os.path.exists(real_dir):
            for fname in os.listdir(real_dir):
                if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.samples.append((os.path.join(real_dir, fname), 0))
                    
        # Load FAKE samples (Label 1)
        fake_dir = os.path.join(data_dir, 'fake')
        if os.path.exists(fake_dir):
            for fname in os.listdir(fake_dir):
                if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.samples.append((os.path.join(fake_dir, fname), 1))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        
        try:
            image = Image.open(img_path).convert('RGB')
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            # Return a dummy image and label in case of error (or handle better depending on need)
            image = Image.new('RGB', (224, 224))
            label = 0
            
        if self.transform:
            image = self.transform(image)
            
        # BCEWithLogitsLoss expects float targets
        label_tensor = torch.tensor([label], dtype=torch.float32)
        
        return image, label_tensor
