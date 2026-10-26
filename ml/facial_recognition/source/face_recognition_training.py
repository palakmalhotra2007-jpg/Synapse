"""
Synapse Facial Recognition & Anti-Spoofing Model Training Pipeline
Executes actual deep learning training using PyTorch on CPU/GPU:
1. AntiSpoofNet: Binary liveness classification (Real vs. Spoof)
2. FaceEmbeddingNet: 512-D ArcFace feature representation across 44 identities
"""

import os
import time
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
from ml.facial_recognition.source.face_recognition_model_architectures import AntiSpoofNet, FaceEmbeddingNet

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "datasets")
MODELS_DIR = os.path.join(BASE_DIR, "models")
ANTISPOOF_DIR = os.path.join(DATA_DIR, "antispoof")
IDENTITIES_DIR = os.path.join(DATA_DIR, "identities")

os.makedirs(MODELS_DIR, exist_ok=True)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Executing training pipeline on compute device: {device}")


def train_antispoofing_model(epochs: int = 5, batch_size: int = 32):
    """
    Trains the binary AntiSpoofNet classifier (Real face vs. Spoof attacks).
    """
    print("\n" + "="*70)
    print("PHASE 5.1: TRAINING ANTI-SPOOFING / LIVENESS CLASSIFIER")
    print("="*70)

    # Data augmentation and normalization
    transform_train = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    transform_val = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    full_dataset = datasets.ImageFolder(ANTISPOOF_DIR, transform=transform_train)
    # Ensure real is class 1 and spoof is class 0
    # ImageFolder sorts alphabetically: 'real' -> 0, 'spoof' -> 1
    # We will map spoof -> 0, real -> 1
    real_idx = full_dataset.class_to_idx["real"]
    spoof_idx = full_dataset.class_to_idx["spoof"]
    print(f"Raw Classes: {full_dataset.class_to_idx}")
    print(f"Total Dataset Samples: {len(full_dataset)}")

    # 80/20 train/val split
    val_size = int(0.20 * len(full_dataset))
    train_size = len(full_dataset) - val_size
    train_ds, val_ds = random_split(
        full_dataset, 
        [train_size, val_size], 
        generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    model = AntiSpoofNet(pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=2, gamma=0.5)

    best_val_acc = 0.0
    model_save_path = os.path.join(MODELS_DIR, "antispoof_model.pt")

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for images, targets in train_loader:
            images = images.to(device)
            # Map labels: Real -> 1, Spoof -> 0
            binary_labels = torch.where(targets == real_idx, torch.tensor(1), torch.tensor(0)).to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, binary_labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1)
            train_correct += (preds == binary_labels).sum().item()
            total_train += images.size(0)

        scheduler.step()
        epoch_train_loss = train_loss / total_train
        epoch_train_acc = (train_correct / total_train) * 100.0

        # Validation loop
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for images, targets in val_loader:
                images = images.to(device)
                binary_labels = torch.where(targets == real_idx, torch.tensor(1), torch.tensor(0)).to(device)
                outputs = model(images)
                loss = criterion(outputs, binary_labels)

                val_loss += loss.item() * images.size(0)
                preds = torch.argmax(outputs, dim=1)
                val_correct += (preds == binary_labels).sum().item()
                total_val += images.size(0)

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = (val_correct / total_val) * 100.0
        elapsed = time.time() - t0

        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) | "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")

        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save({
                "model_state": model.state_dict(),
                "epoch": epoch,
                "val_acc": epoch_val_acc,
                "val_loss": epoch_val_loss,
                "classes": {"0": "spoof", "1": "real"}
            }, model_save_path)

    print(f"\n[+] AntiSpoofNet Training Completed. Peak Val Accuracy: {best_val_acc:.2f}%")
    print(f"[+] Saved weights to: {model_save_path}")


def train_face_recognition_model(epochs: int = 5, batch_size: int = 32):
    """
    Trains the FaceEmbeddingNet feature representation network with ArcFace loss across identities.
    """
    print("\n" + "="*70)
    print("PHASE 5.2: TRAINING FACIAL RECOGNITION (ARCFACE EMBEDDING MODEL)")
    print("="*70)

    transform_train = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.10, contrast=0.10),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    full_dataset = datasets.ImageFolder(IDENTITIES_DIR, transform=transform_train)
    num_classes = len(full_dataset.classes)
    print(f"Total Enrolled Identities (Classes): {num_classes}")
    print(f"Total Face Samples: {len(full_dataset)}")

    # Save class mapping
    class_map_path = os.path.join(MODELS_DIR, "identity_classes.json")
    with open(class_map_path, "w") as f:
        json.dump(full_dataset.class_to_idx, f, indent=2)

    val_size = max(40, int(0.15 * len(full_dataset)))
    train_size = len(full_dataset) - val_size
    train_ds, val_ds = random_split(
        full_dataset, 
        [train_size, val_size], 
        generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    model = FaceEmbeddingNet(embedding_dim=512, num_classes=num_classes, pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=5e-4, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=2, gamma=0.5)

    best_val_acc = 0.0
    model_save_path = os.path.join(MODELS_DIR, "face_recognition_model.pt")

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            logits, embeddings = model(images, labels)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            preds = torch.argmax(logits, dim=1)
            train_correct += (preds == labels).sum().item()
            total_train += images.size(0)

        scheduler.step()
        epoch_train_loss = train_loss / total_train
        epoch_train_acc = (train_correct / total_train) * 100.0

        # Validation loop
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)
                logits, embeddings = model(images, labels)
                loss = criterion(logits, labels)

                val_loss += loss.item() * images.size(0)
                preds = torch.argmax(logits, dim=1)
                val_correct += (preds == labels).sum().item()
                total_val += images.size(0)

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = (val_correct / total_val) * 100.0
        elapsed = time.time() - t0

        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) | "
              f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")

        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save({
                "model_state": model.state_dict(),
                "embedding_dim": 512,
                "num_classes": num_classes,
                "epoch": epoch,
                "val_acc": epoch_val_acc,
                "val_loss": epoch_val_loss
            }, model_save_path)

    print(f"\n[+] FaceEmbeddingNet Training Completed. Peak Val Accuracy: {best_val_acc:.2f}%")
    print(f"[+] Saved weights to: {model_save_path}")


if __name__ == "__main__":
    t_start = time.time()
    train_antispoofing_model(epochs=5, batch_size=32)
    train_face_recognition_model(epochs=5, batch_size=32)
    print("\n" + "="*70)
    print(f"ALL TRAINING STAGES COMPLETE IN {round(time.time() - t_start, 1)} SECONDS!")
    print("="*70)
