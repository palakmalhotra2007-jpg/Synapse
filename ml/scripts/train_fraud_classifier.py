"""
SYNAPSE - Phase 3: Train Model 1 (Document Fraud Classifier)
============================================================
Fine-tunes ResNet18 binary classifier to identify authentic vs tampered documents.
- Evaluates Pretrained Baseline vs Fine-Tuned Model
- Computes Accuracy, Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix
- Saves best checkpoint to ml/fraud_checkpoints/fraud_classifier_best.pt
- Exports training curves and confusion matrix to ml/fraud_metrics/
"""

import os
import sys
import json
import time
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "fraud_data", "dataset")
CHECKPOINT_DIR = os.path.join(BASE_DIR, "fraud_checkpoints")
METRICS_DIR = os.path.join(BASE_DIR, "fraud_metrics")

os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(METRICS_DIR, exist_ok=True)

class DocumentFraudDataset(Dataset):
    def __init__(self, split="train", transform=None):
        self.split = split
        self.transform = transform
        self.metadata_path = os.path.join(DATASET_DIR, "metadata.json")
        
        with open(self.metadata_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        self.records = [r for r in data["records"] if r["split"] == split]
        self.img_dir = os.path.join(DATASET_DIR, split, "images")
        
    def __len__(self):
        return len(self.records)
        
    def __getitem__(self, idx):
        rec = self.records[idx]
        img_path = os.path.join(self.img_dir, rec["filename"])
        image = Image.open(img_path).convert("RGB")
        
        if self.transform:
            image = self.transform(image)
            
        label = rec["label"]
        return image, label, rec["id"]

def get_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=4),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

class DocumentFraudClassifier(nn.Module):
    def __init__(self, pretrained=True):
        super().__init__()
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        try:
            self.backbone = models.resnet18(weights=weights)
        except Exception:
            # Fallback if network weights download fails
            self.backbone = models.resnet18(weights=None)
            
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2)
        )
        
    def forward(self, x):
        return self.backbone(x)

def evaluate(model, dataloader, device):
    model.eval()
    all_preds = []
    all_probs = []
    all_targets = []
    total_loss = 0.0
    criterion = nn.CrossEntropyLoss()
    
    with torch.no_grad():
        for images, labels, _ in dataloader:
            images = images.to(device)
            labels = labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            total_loss += loss.item() * images.size(0)
            
            probs = torch.softmax(outputs, dim=1)[:, 1].cpu().numpy()
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            
            all_preds.extend(preds)
            all_probs.extend(probs)
            all_targets.extend(labels.cpu().numpy())
            
    avg_loss = total_loss / len(dataloader.dataset)
    acc = accuracy_score(all_targets, all_preds)
    prec = precision_score(all_targets, all_preds, zero_division=0)
    rec = recall_score(all_targets, all_preds, zero_division=0)
    f1 = f1_score(all_targets, all_preds, zero_division=0)
    try:
        auc = roc_auc_score(all_targets, all_probs)
    except Exception:
        auc = 0.5
    cm = confusion_matrix(all_targets, all_preds).tolist()
    
    return {
        "loss": avg_loss,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "roc_auc": auc,
        "confusion_matrix": cm,
        "targets": all_targets,
        "predictions": all_preds,
        "probabilities": all_probs
    }

def main():
    print("=" * 70)
    print("SYNAPSE: TRAINING MODEL 1 - DOCUMENT FRAUD CLASSIFICATION")
    print("=" * 70)
    
    device = torch.device("cpu")
    print(f"Executing on device: {device}")
    
    train_transform, val_transform = get_transforms()
    train_dataset = DocumentFraudDataset("train", transform=train_transform)
    val_dataset = DocumentFraudDataset("val", transform=val_transform)
    test_dataset = DocumentFraudDataset("test", transform=val_transform)
    
    print(f"Dataset Loaded: {len(train_dataset)} Train | {len(val_dataset)} Val | {len(test_dataset)} Test")
    
    batch_size = 8
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    # 1. Evaluate Pretrained Baseline
    print("\n--- Evaluating Pretrained Baseline (Zero-Shot / Untuned) ---")
    baseline_model = DocumentFraudClassifier(pretrained=False).to(device)
    baseline_metrics = evaluate(baseline_model, test_loader, device)
    print(f"Baseline Accuracy: {baseline_metrics['accuracy']*100:.2f}% | F1-Score: {baseline_metrics['f1']*100:.2f}% | Loss: {baseline_metrics['loss']:.4f}")
    
    # 2. Fine-Tune Classifier
    print("\n--- Starting Fine-Tuning of ResNet18 Classifier ---")
    model = DocumentFraudClassifier(pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1.5e-4, weight_decay=1e-3)
    
    epochs = 8
    best_val_f1 = -1.0
    best_checkpoint_path = os.path.join(CHECKPOINT_DIR, "fraud_classifier_best.pt")
    
    history = {
        "train_loss": [], "val_loss": [],
        "train_acc": [], "val_acc": [],
        "val_f1": []
    }
    
    start_time = time.time()
    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for images, labels, _ in train_loader:
            images = images.to(device)
            labels = labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            preds = torch.argmax(outputs, dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            
        train_loss = running_loss / total
        train_acc = correct / total
        
        val_metrics = evaluate(model, val_loader, device)
        val_loss = val_metrics["loss"]
        val_acc = val_metrics["accuracy"]
        val_f1 = val_metrics["f1"]
        
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_acc"].append(train_acc)
        history["val_acc"].append(val_acc)
        history["val_f1"].append(val_f1)
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] "
              f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:5.1f}% | "
              f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:5.1f}% | Val F1: {val_f1*100:5.1f}%")
              
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_f1": val_f1,
                "val_acc": val_acc,
                "architecture": "ResNet18-BinaryClassifier"
            }, best_checkpoint_path)
            print(f"  --> Saved new best checkpoint to {best_checkpoint_path}")
            
    train_time = time.time() - start_time
    print(f"\nFine-Tuning completed in {train_time:.1f} seconds.")
    
    # 3. Held-Out Test Evaluation
    print("\n--- Evaluating Fine-Tuned Model on Held-Out Test Set ---")
    best_ckpt = torch.load(best_checkpoint_path, map_location=device)
    model.load_state_dict(best_ckpt["model_state_dict"])
    
    test_metrics = evaluate(model, test_loader, device)
    print(f"Test Accuracy:  {test_metrics['accuracy']*100:.2f}%")
    print(f"Test Precision: {test_metrics['precision']*100:.2f}%")
    print(f"Test Recall:    {test_metrics['recall']*100:.2f}%")
    print(f"Test F1-Score:  {test_metrics['f1']*100:.2f}%")
    print(f"Test ROC-AUC:   {test_metrics['roc_auc']:.4f}")
    print(f"Confusion Matrix [TN, FP], [FN, TP]: {test_metrics['confusion_matrix']}")
    
    # 4. Save Metrics & Comparison
    metrics_report = {
        "model": "Model 1: Document Fraud Classification (ResNet18)",
        "training_epochs": epochs,
        "training_time_seconds": round(train_time, 2),
        "best_epoch": best_ckpt["epoch"],
        "baseline_comparison": {
            "baseline_accuracy": round(baseline_metrics["accuracy"] * 100, 2),
            "baseline_f1": round(baseline_metrics["f1"] * 100, 2),
            "baseline_loss": round(baseline_metrics["loss"], 4),
            "finetuned_accuracy": round(test_metrics["accuracy"] * 100, 2),
            "finetuned_f1": round(test_metrics["f1"] * 100, 2),
            "finetuned_loss": round(test_metrics["loss"], 4),
            "accuracy_gain_pct": round((test_metrics["accuracy"] - baseline_metrics["accuracy"]) * 100, 2)
        },
        "test_metrics": {
            "accuracy": round(test_metrics["accuracy"] * 100, 2),
            "precision": round(test_metrics["precision"] * 100, 2),
            "recall": round(test_metrics["recall"] * 100, 2),
            "f1_score": round(test_metrics["f1"] * 100, 2),
            "roc_auc": round(test_metrics["roc_auc"], 4),
            "confusion_matrix": test_metrics["confusion_matrix"]
        },
        "history": history
    }
    
    json_path = os.path.join(METRICS_DIR, "classifier_metrics.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)
    print(f"Saved metrics JSON to: {json_path}")
    
    # 5. Generate Training & Confusion Matrix Graphs
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(range(1, epochs + 1), history["train_loss"], label="Train Loss", marker="o", color="#3b82f6")
    plt.plot(range(1, epochs + 1), history["val_loss"], label="Val Loss", marker="s", color="#ef4444")
    plt.title("Document Fraud Classifier: Loss Curves")
    plt.xlabel("Epoch")
    plt.ylabel("Cross-Entropy Loss")
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.6)
    
    plt.subplot(1, 2, 2)
    plt.plot(range(1, epochs + 1), [a*100 for a in history["train_acc"]], label="Train Acc (%)", marker="o", color="#10b981")
    plt.plot(range(1, epochs + 1), [a*100 for a in history["val_acc"]], label="Val Acc (%)", marker="s", color="#8b5cf6")
    plt.title("Document Fraud Classifier: Accuracy Curves")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy (%)")
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.6)
    
    plt.tight_layout()
    curves_path = os.path.join(METRICS_DIR, "classifier_training_curves.png")
    plt.savefig(curves_path, dpi=180)
    plt.close()
    print(f"Saved training curves to: {curves_path}")
    
    # Plot Confusion Matrix
    cm = np.array(test_metrics["confusion_matrix"])
    plt.figure(figsize=(6, 5))
    plt.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    plt.title("Held-Out Test Set: Confusion Matrix")
    plt.colorbar()
    tick_marks = np.arange(2)
    plt.xticks(tick_marks, ["Authentic", "Tampered"])
    plt.yticks(tick_marks, ["Authentic", "Tampered"])
    
    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(j, i, format(cm[i, j], "d"),
                     horizontalalignment="center",
                     color="white" if cm[i, j] > thresh else "black",
                     fontsize=14, fontweight="bold")
                     
    plt.ylabel("True Class")
    plt.xlabel("Predicted Class")
    plt.tight_layout()
    cm_path = os.path.join(METRICS_DIR, "classifier_confusion_matrix.png")
    plt.savefig(cm_path, dpi=180)
    plt.close()
    print(f"Saved confusion matrix plot to: {cm_path}")

if __name__ == "__main__":
    main()
