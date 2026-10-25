"""
SYNAPSE - Phase 4: Train Model 2 (Tampered Region Localization U-Net)
=====================================================================
Trains a U-Net semantic segmentation network to localize tampered pixel regions.
- Computes Intersection over Union (IoU), Dice Coefficient, Pixel Precision, Pixel Recall
- Saves visual comparisons (Original Image, Ground Truth Mask, Predicted Mask, Heatmap Overlay)
- Saves best checkpoint to ml/fraud_checkpoints/tamper_localizer_best.pt
- Exports metrics to ml/fraud_metrics/localizer_metrics.json
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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "fraud_data", "dataset")
CHECKPOINT_DIR = os.path.join(BASE_DIR, "fraud_checkpoints")
METRICS_DIR = os.path.join(BASE_DIR, "fraud_metrics")
SAMPLES_DIR = os.path.join(METRICS_DIR, "localization_samples")

os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(METRICS_DIR, exist_ok=True)
os.makedirs(SAMPLES_DIR, exist_ok=True)

class TamperSegmentationDataset(Dataset):
    def __init__(self, split="train", img_size=(256, 256)):
        self.split = split
        self.img_size = img_size
        self.metadata_path = os.path.join(DATASET_DIR, "metadata.json")
        
        with open(self.metadata_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # We focus on tampered records (label=1) for learning localization, plus authentic controls
        self.records = [r for r in data["records"] if r["split"] == split]
        self.img_dir = os.path.join(DATASET_DIR, split, "images")
        self.mask_dir = os.path.join(DATASET_DIR, split, "masks")
        
        self.img_transform = transforms.Compose([
            transforms.Resize(img_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
    def __len__(self):
        return len(self.records)
        
    def __getitem__(self, idx):
        rec = self.records[idx]
        img_path = os.path.join(self.img_dir, rec["filename"])
        mask_path = os.path.join(self.mask_dir, rec["mask_filename"])
        
        image = Image.open(img_path).convert("RGB")
        mask = Image.open(mask_path).convert("L")
        
        img_t = self.img_transform(image)
        
        # Mask tensor: binary {0, 1}
        mask_resized = mask.resize(self.img_size, Image.Resampling.NEAREST)
        mask_arr = (np.array(mask_resized, dtype=np.float32) > 128).astype(np.float32)
        mask_t = torch.from_numpy(mask_arr).unsqueeze(0) # [1, H, W]
        
        return img_t, mask_t, rec["id"], rec["filename"], rec["label"]

class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )
    def forward(self, x):
        return self.net(x)

class TamperLocalizationUNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Encoder
        self.inc = DoubleConv(3, 32)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))
        
        # Bottleneck
        self.bottleneck = nn.Sequential(nn.MaxPool2d(2), DoubleConv(256, 256))
        
        # Decoder with skip connections
        self.up1 = nn.ConvTranspose2d(256, 256, kernel_size=2, stride=2)
        self.conv_up1 = DoubleConv(512, 128)
        
        self.up2 = nn.ConvTranspose2d(128, 128, kernel_size=2, stride=2)
        self.conv_up2 = DoubleConv(256, 64)
        
        self.up3 = nn.ConvTranspose2d(64, 64, kernel_size=2, stride=2)
        self.conv_up3 = DoubleConv(128, 32)
        
        self.up4 = nn.ConvTranspose2d(32, 32, kernel_size=2, stride=2)
        self.conv_up4 = DoubleConv(64, 32)
        
        self.outc = nn.Conv2d(32, 1, kernel_size=1)
        
    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        b = self.bottleneck(x4)
        
        u1 = self.up1(b)
        d1 = self.conv_up1(torch.cat([u1, x4], dim=1))
        
        u2 = self.up2(d1)
        d2 = self.conv_up2(torch.cat([u2, x3], dim=1))
        
        u3 = self.up3(d2)
        d3 = self.conv_up3(torch.cat([u3, x2], dim=1))
        
        u4 = self.up4(d3)
        d4 = self.conv_up4(torch.cat([u4, x1], dim=1))
        
        logits = self.outc(d4)
        return torch.sigmoid(logits)

class BCEDiceLoss(nn.Module):
    def __init__(self, smooth=1e-5):
        super().__init__()
        self.bce = nn.BCELoss()
        self.smooth = smooth
        
    def forward(self, preds, targets):
        bce_loss = self.bce(preds, targets)
        
        p_flat = preds.view(-1)
        t_flat = targets.view(-1)
        intersection = (p_flat * t_flat).sum()
        dice = (2.0 * intersection + self.smooth) / (p_flat.sum() + t_flat.sum() + self.smooth)
        dice_loss = 1.0 - dice
        
        return bce_loss + dice_loss

def compute_segmentation_metrics(preds, targets, threshold=0.35, smooth=1e-6):
    bin_preds = (preds > threshold).astype(np.float32)
    bin_targets = (targets > 0.5).astype(np.float32)
    
    intersection = np.logical_and(bin_preds, bin_targets).sum()
    union = np.logical_or(bin_preds, bin_targets).sum()
    iou = (intersection + smooth) / (union + smooth) if union > 0 else 1.0
    
    total_pos = bin_preds.sum() + bin_targets.sum()
    dice = (2.0 * intersection + smooth) / (total_pos + smooth) if total_pos > 0 else 1.0
    
    true_pos = intersection
    pred_pos = bin_preds.sum()
    gt_pos = bin_targets.sum()
    
    prec = (true_pos + smooth) / (pred_pos + smooth) if pred_pos > 0 else 1.0
    rec = (true_pos + smooth) / (gt_pos + smooth) if gt_pos > 0 else 1.0
    
    return float(iou), float(dice), float(prec), float(rec)

def evaluate_segmentation(model, dataloader, device):
    model.eval()
    criterion = BCEDiceLoss()
    total_loss = 0.0
    
    all_iou = []
    all_dice = []
    all_prec = []
    all_rec = []
    
    with torch.no_grad():
        for images, masks, _, _, _ in dataloader:
            images = images.to(device)
            masks = masks.to(device)
            
            preds = model(images)
            loss = criterion(preds, masks)
            total_loss += loss.item() * images.size(0)
            
            p_np = preds.cpu().numpy()
            m_np = masks.cpu().numpy()
            
            for i in range(images.size(0)):
                # If target has tampering, compute metrics
                if m_np[i].sum() > 0:
                    iou, dice, prec, rec = compute_segmentation_metrics(p_np[i, 0], m_np[i, 0])
                    all_iou.append(iou)
                    all_dice.append(dice)
                    all_prec.append(prec)
                    all_rec.append(rec)
                    
    avg_loss = total_loss / len(dataloader.dataset)
    mean_iou = np.mean(all_iou) if all_iou else 0.0
    mean_dice = np.mean(all_dice) if all_dice else 0.0
    mean_prec = np.mean(all_prec) if all_prec else 0.0
    mean_rec = np.mean(all_rec) if all_rec else 0.0
    
    return {
        "loss": avg_loss,
        "mean_iou": round(float(mean_iou), 4),
        "mean_dice": round(float(mean_dice), 4),
        "pixel_precision": round(float(mean_prec), 4),
        "pixel_recall": round(float(mean_rec), 4)
    }

def main():
    print("=" * 70)
    print("SYNAPSE: TRAINING MODEL 2 - TAMPERED REGION LOCALIZATION U-NET")
    print("=" * 70)
    
    device = torch.device("cpu")
    print(f"Executing on device: {device}")
    
    train_dataset = TamperSegmentationDataset("train")
    val_dataset = TamperSegmentationDataset("val")
    test_dataset = TamperSegmentationDataset("test")
    
    print(f"Dataset Loaded: {len(train_dataset)} Train | {len(val_dataset)} Val | {len(test_dataset)} Test")
    
    batch_size = 4
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    model = TamperLocalizationUNet().to(device)
    criterion = BCEDiceLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)
    
    epochs = 8
    best_dice = -1.0
    best_checkpoint_path = os.path.join(CHECKPOINT_DIR, "tamper_localizer_best.pt")
    
    history = {"train_loss": [], "val_loss": [], "val_dice": [], "val_iou": []}
    
    start_time = time.time()
    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        
        for images, masks, _, _, _ in train_loader:
            images = images.to(device)
            masks = masks.to(device)
            
            optimizer.zero_grad()
            preds = model(images)
            loss = criterion(preds, masks)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            
        train_loss = running_loss / len(train_dataset)
        val_metrics = evaluate_segmentation(model, val_loader, device)
        val_loss = val_metrics["loss"]
        val_dice = val_metrics["mean_dice"]
        val_iou = val_metrics["mean_iou"]
        
        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["val_dice"].append(val_dice)
        history["val_iou"].append(val_iou)
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] "
              f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | "
              f"Val Dice: {val_dice*100:5.2f}% | Val IoU: {val_iou*100:5.2f}%")
              
        if val_dice > best_dice:
            best_dice = val_dice
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_dice": val_dice,
                "val_iou": val_iou,
                "architecture": "U-Net-TamperLocalization"
            }, best_checkpoint_path)
            print(f"  --> Saved new best U-Net checkpoint to {best_checkpoint_path}")
            
    train_time = time.time() - start_time
    print(f"\nU-Net Training completed in {train_time:.1f} seconds.")
    
    # Evaluate on Test Set
    print("\n--- Evaluating Model 2 on Held-Out Test Set ---")
    best_ckpt = torch.load(best_checkpoint_path, map_location=device)
    model.load_state_dict(best_ckpt["model_state_dict"])
    
    test_metrics = evaluate_segmentation(model, test_loader, device)
    print(f"Test Mean IoU:          {test_metrics['mean_iou']*100:.2f}%")
    print(f"Test Dice Coefficient:  {test_metrics['mean_dice']*100:.2f}%")
    print(f"Test Pixel Precision:   {test_metrics['pixel_precision']*100:.2f}%")
    print(f"Test Pixel Recall:      {test_metrics['pixel_recall']*100:.2f}%")
    
    # Save Metrics JSON
    metrics_report = {
        "model": "Model 2: Tampered Region Localization (U-Net)",
        "training_epochs": epochs,
        "training_time_seconds": round(train_time, 2),
        "best_epoch": best_ckpt["epoch"],
        "test_metrics": {
            "mean_iou_pct": round(test_metrics["mean_iou"] * 100, 2),
            "dice_coefficient_pct": round(test_metrics["mean_dice"] * 100, 2),
            "pixel_precision_pct": round(test_metrics["pixel_precision"] * 100, 2),
            "pixel_recall_pct": round(test_metrics["pixel_recall"] * 100, 2),
            "evaluation_loss": round(test_metrics["loss"], 4)
        },
        "history": history
    }
    
    json_path = os.path.join(METRICS_DIR, "localizer_metrics.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)
    print(f"Saved metrics JSON to: {json_path}")
    
    # Generate Visual Comparisons of Original, Ground Truth, Predicted Mask, and Overlay
    print("\n--- Generating Visual Localization Comparisons ---")
    model.eval()
    sample_count = 0
    with torch.no_grad():
        for images, masks, ids, filenames, labels in test_loader:
            images = images.to(device)
            preds = model(images).cpu().numpy()
            
            for i in range(images.size(0)):
                if labels[i].item() == 1 and sample_count < 4:
                    sample_count += 1
                    doc_id = ids[i]
                    raw_filename = filenames[i]
                    
                    # Load original image for visualization
                    orig_img = Image.open(os.path.join(DATASET_DIR, "test", "images", raw_filename)).convert("RGB")
                    orig_arr = np.array(orig_img)
                    gt_mask = masks[i, 0].numpy()
                    pred_mask = preds[i, 0]
                    
                    # Create 4-panel figure
                    fig, axes = plt.subplots(1, 4, figsize=(16, 4))
                    
                    axes[0].imshow(orig_arr)
                    axes[0].set_title(f"Original Document\n({raw_filename})", fontsize=10)
                    axes[0].axis("off")
                    
                    axes[1].imshow(gt_mask, cmap="Reds")
                    axes[1].set_title("Ground-Truth Mask", fontsize=10)
                    axes[1].axis("off")
                    
                    axes[2].imshow(pred_mask, cmap="jet", vmin=0, vmax=1)
                    axes[2].set_title(f"Predicted Heatmap\n(Max: {pred_mask.max():.2f})", fontsize=10)
                    axes[2].axis("off")
                    
                    # Overlay
                    overlay = orig_arr.copy()
                    highlight = (pred_mask > 0.35)
                    overlay[highlight, 0] = np.clip(overlay[highlight, 0] * 0.4 + 180, 0, 255)
                    overlay[highlight, 1] = np.clip(overlay[highlight, 1] * 0.4, 0, 255)
                    axes[3].imshow(overlay)
                    axes[3].set_title("Suspicious Region Overlay", fontsize=10)
                    axes[3].axis("off")
                    
                    plt.tight_layout()
                    out_fig = os.path.join(SAMPLES_DIR, f"localization_comparison_{sample_count}.png")
                    plt.savefig(out_fig, dpi=180)
                    plt.close()
                    print(f"Saved visual localization comparison #{sample_count} to: {out_fig}")
                    
    # Generate U-Net Training Curves
    plt.figure(figsize=(10, 4))
    plt.subplot(1, 2, 1)
    plt.plot(range(1, epochs + 1), history["train_loss"], label="Train Loss", marker="o", color="#3b82f6")
    plt.plot(range(1, epochs + 1), history["val_loss"], label="Val Loss", marker="s", color="#ef4444")
    plt.title("U-Net Localization: Loss Curves")
    plt.xlabel("Epoch")
    plt.ylabel("BCE + Dice Loss")
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.6)
    
    plt.subplot(1, 2, 2)
    plt.plot(range(1, epochs + 1), [d*100 for d in history["val_dice"]], label="Val Dice (%)", marker="o", color="#10b981")
    plt.plot(range(1, epochs + 1), [i*100 for i in history["val_iou"]], label="Val IoU (%)", marker="s", color="#f59e0b")
    plt.title("U-Net Localization: Dice & IoU Curves")
    plt.xlabel("Epoch")
    plt.ylabel("Score (%)")
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.6)
    
    plt.tight_layout()
    unet_curves = os.path.join(METRICS_DIR, "localizer_training_curves.png")
    plt.savefig(unet_curves, dpi=180)
    plt.close()
    print(f"Saved U-Net training curves to: {unet_curves}")

if __name__ == "__main__":
    main()
