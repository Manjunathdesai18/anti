import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, f1_score
from dataset import DeepfakeDataset
from models import DeepfakeDetector, get_transforms

def train_model(data_dir, epochs=10, batch_size=32, lr=1e-4, device='cuda'):
    """
    Main training loop for the deepfake detector.
    """
    if not torch.cuda.is_available() and device == 'cuda':
        print("CUDA not available. Falling back to CPU.")
        device = 'cpu'
        
    print(f"Using device: {device}")
    
    # 1. Setup DataLoaders
    train_dir = os.path.join(data_dir, 'train')
    val_dir = os.path.join(data_dir, 'val')
    
    transforms = get_transforms()
    
    train_dataset = DeepfakeDataset(train_dir, transform=transforms)
    val_dataset = DeepfakeDataset(val_dir, transform=transforms)
    
    if len(train_dataset) == 0:
        print("No training data found. Please check data directory structure.")
        return
        
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4)
    
    # 2. Setup Model, Loss, and Optimizer
    model = DeepfakeDetector(pretrained=True).to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr)
    
    best_f1 = 0.0
    
    # 3. Training Loop
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        
        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * images.size(0)
            
        train_loss /= len(train_loader.dataset)
        
        # 4. Validation Loop
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)
                
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                
                # Sigmoid + Threshold for binary classification
                preds = torch.sigmoid(outputs) >= 0.5
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
                
        val_loss /= len(val_loader.dataset)
        acc = accuracy_score(all_labels, all_preds)
        f1 = f1_score(all_labels, all_preds)
        
        print(f"Epoch {epoch+1}/{epochs} - Train Loss: {train_loss:.4f} - Val Loss: {val_loss:.4f} - Val Acc: {acc:.4f} - Val F1: {f1:.4f}")
        
        # Save best model
        if f1 > best_f1:
            best_f1 = f1
            os.makedirs("weights", exist_ok=True)
            torch.save(model.state_dict(), "weights/best_deepfake_model.pth")
            print("Saved new best model.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train Deepfake Detector")
    parser.add_argument("--data_dir", type=str, required=True, help="Path to dataset with 'train' and 'val' subdirs")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    args = parser.parse_args()
    
    train_model(args.data_dir, epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
