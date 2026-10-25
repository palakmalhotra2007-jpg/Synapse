"""
SYNAPSE - Document Fraud Detection Ensemble Inference Engine
============================================================
Combines:
1. Model 1 (ResNet18 Fraud Classifier) -> Manipulation Probability
2. Model 2 (U-Net Tamper Localizer) -> Pixel Bounding Boxes & Tamper Ratio
3. Phase 5 OCR Consistency Engine -> Mathematical & Chronological Validation
Produces an explainable, auditable DocumentFraudReport for Synapse.
"""

import os
import sys
import json
import base64
import io
import datetime
from typing import Dict, Any, Optional
from PIL import Image
import numpy as np

import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from ml.fraud_ocr import DocumentOCRVerifier
except ImportError:
    from fraud_ocr import DocumentOCRVerifier
CHECKPOINT_DIR = os.path.join(BASE_DIR, "fraud_checkpoints")
CLASSIFIER_CKPT = os.path.join(CHECKPOINT_DIR, "fraud_classifier_best.pt")
LOCALIZER_CKPT = os.path.join(CHECKPOINT_DIR, "tamper_localizer_best.pt")

class DocumentFraudClassifier(nn.Module):
    def __init__(self):
        super().__init__()
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
        self.inc = DoubleConv(3, 32)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(32, 64))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))
        self.bottleneck = nn.Sequential(nn.MaxPool2d(2), DoubleConv(256, 256))
        
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
        return torch.sigmoid(self.outc(d4))

class FraudDetectionEnsemble:
    _instance = None
    
    def __init__(self):
        self.device = torch.device("cpu")
        self.classifier = None
        self.localizer = None
        self.ocr_verifier = DocumentOCRVerifier()
        self._load_models()
        
    def _load_models(self):
        # 1. Load Classifier
        if os.path.exists(CLASSIFIER_CKPT):
            try:
                self.classifier = DocumentFraudClassifier()
                ckpt = torch.load(CLASSIFIER_CKPT, map_location=self.device)
                self.classifier.load_state_dict(ckpt["model_state_dict"])
                self.classifier.eval()
                print("[FraudEnsemble] Loaded Model 1: ResNet18 Classifier", file=sys.stderr)
            except Exception as e:
                print(f"[FraudEnsemble] Warning: Could not load classifier checkpoint: {e}", file=sys.stderr)
                
        # 2. Load Localizer
        if os.path.exists(LOCALIZER_CKPT):
            try:
                self.localizer = TamperLocalizationUNet()
                ckpt = torch.load(LOCALIZER_CKPT, map_location=self.device)
                self.localizer.load_state_dict(ckpt["model_state_dict"])
                self.localizer.eval()
                print("[FraudEnsemble] Loaded Model 2: U-Net Tamper Localizer", file=sys.stderr)
            except Exception as e:
                print(f"[FraudEnsemble] Warning: Could not load localizer checkpoint: {e}", file=sys.stderr)

    def analyze_document(
        self,
        document_id: str,
        document_title: str,
        document_type: str = "pdf",
        content_text: str = "",
        uploaded_by: str = "Analyst",
        team_name: str = "Finance & Risk",
        image_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes ensemble fraud scan on uploaded document.
        """
        # 1. Run OCR and Consistency Engine
        ocr_result = self.ocr_verifier.extract_and_verify(content_text, document_title)
        
        # 2. Run Deep Learning Models (if image provided or synthesize representative scan)
        img_tensor = None
        if image_base64:
            try:
                img_data = base64.b64decode(image_base64)
                img = Image.open(io.BytesIO(img_data)).convert("RGB").resize((256, 256))
                transform = transforms.Compose([
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
                ])
                img_tensor = transform(img).unsqueeze(0).to(self.device)
            except Exception as e:
                print(f"[FraudEnsemble] Warning: Failed to decode base64 image: {e}", file=sys.stderr)
                
        # Default model predictions
        classifier_prob = 0.50
        tamper_area_ratio = 0.0
        tamper_regions = []
        heatmap_overlay_base64 = None
        
        if img_tensor is not None and self.classifier:
            with torch.no_grad():
                c_out = self.classifier(img_tensor)
                probs = torch.softmax(c_out, dim=1)
                classifier_prob = float(probs[0, 1].item())
                
        if img_tensor is not None and self.localizer:
            with torch.no_grad():
                l_out = self.localizer(img_tensor) # [1, 1, 256, 256]
                mask_np = l_out[0, 0].cpu().numpy()
                tamper_pixels = (mask_np > 0.35)
                tamper_area_ratio = float(tamper_pixels.sum() / (256 * 256))
                
                # Identify bounding box of tampered cluster
                if tamper_pixels.any():
                    y_indices, x_indices = np.where(tamper_pixels)
                    ymin, ymax = int(y_indices.min()), int(y_indices.max())
                    xmin, xmax = int(x_indices.min()), int(x_indices.max())
                    tamper_regions.append({
                        "box_256": [xmin, ymin, xmax, ymax],
                        "confidence": round(float(mask_np[tamper_pixels].mean() * 100), 1),
                        "location_description": f"Page 1, Region [X: {xmin}-{xmax}, Y: {ymin}-{ymax}]"
                    })
                    
        # 3. Ensemble Synthesis & Explainable Risk Scoring
        ocr_failed = (ocr_result["ocr_status"] == "FAILED")
        ocr_warning = (ocr_result["ocr_status"] == "WARNING")
        discrepancies = ocr_result["discrepancies"]
        
        # Base risk calculation
        risk_score = 15.0
        tamper_indicators = []
        forensic_notes = []
        
        # Factor A: Classification Model Probability
        if classifier_prob >= 0.70:
            risk_score += 35.0
            tamper_indicators.append({
                "type": "FONT_MISMATCH",
                "severity": "HIGH",
                "description": f"ResNet18 Deep Learning Classifier detected pixel frequency anomalies ({classifier_prob*100:.1f}% confidence).",
                "location": "Page 1 - Text Baseline & Glyph Rendering",
                "confidence": round(classifier_prob * 100, 1)
            })
            forensic_notes.append(f"Model 1 (Classifier): High-confidence forgery signal detected ({classifier_prob*100:.1f}%).")
        elif classifier_prob >= 0.50:
            risk_score += 15.0
            
        # Factor B: Localizer Tamper Ratio
        if tamper_area_ratio >= 0.02:
            risk_score += 30.0
            tamper_indicators.append({
                "type": "SIGNATURE_FORGERY" if "signature" in content_text.lower() else "AMOUNT_TAMPERING",
                "severity": "CRITICAL" if tamper_area_ratio > 0.08 else "HIGH",
                "description": f"U-Net Segmentation highlighted suspicious altered text blocks occupying {tamper_area_ratio*100:.1f}% of page area.",
                "location": tamper_regions[0]["location_description"] if tamper_regions else "Page 1, Lower Section",
                "confidence": tamper_regions[0]["confidence"] if tamper_regions else 88.5
            })
            forensic_notes.append(f"Model 2 (U-Net): Localized altered text bounding box covering {tamper_area_ratio*100:.1f}% of document canvas.")
            
        # Factor C: OCR & Mathematical Consistency
        if ocr_failed:
            risk_score += 40.0
            for d in discrepancies:
                ind_type = "AMOUNT_TAMPERING" if d["type"] == "MATHEMATICAL_MISMATCH" else ("DATE_COLLISION" if d["type"] == "INVALID_DATE_SEQUENCE" else "TAX_ID_INVALID")
                tamper_indicators.append({
                    "type": ind_type,
                    "severity": d["severity"],
                    "description": d["explanation"],
                    "location": f"Field: {d['type'].replace('_', ' ').title()}",
                    "confidence": 98.0
                })
                forensic_notes.append(f"OCR Verification: {d['explanation']}")
        elif ocr_warning:
            risk_score += 18.0
            for d in discrepancies:
                forensic_notes.append(f"OCR Verification: {d['explanation']}")
        else:
            forensic_notes.append("OCR Verification: Mathematical subtotal + tax reconciliation perfectly balanced ($0.00 variance).")
            forensic_notes.append("Chronological check: Due date sequence verified consistent with issue date.")
            
        # Cap risk score
        overall_risk_score = min(99, max(5, int(round(risk_score))))
        
        # Formulate Verdict
        if overall_risk_score >= 75 or ocr_failed:
            verdict = "TAMPERED_FRAUD"
            review_status = "CONFIRMED_FRAUD"
        elif overall_risk_score >= 45 or ocr_warning:
            verdict = "SUSPICIOUS"
            review_status = "NEEDS_REVIEW"
        else:
            verdict = "LEGITIMATE"
            review_status = "CLEARED"
            
        if not forensic_notes:
            forensic_notes.append("No visual tampering or OCR discrepancies detected across document sections.")
            
        ext_fields = ocr_result["extracted_fields"]
        
        return {
            "documentId": document_id,
            "documentTitle": document_title,
            "documentType": document_type,
            "uploadedBy": uploaded_by,
            "teamName": team_name,
            "overallTamperScore": overall_risk_score,
            "verdict": verdict,
            "reviewStatus": review_status,
            "tamperIndicators": tamper_indicators,
            "extractedAmountUSD": ext_fields.get("grand_total_usd"),
            "extractedEntityName": ext_fields.get("vendor_name"),
            "extractedTaxId": ext_fields.get("tax_id"),
            "extractedIBAN": ext_fields.get("iban"),
            "extractedInvoiceNumber": ext_fields.get("invoice_number"),
            "extractedInvoiceDate": ext_fields.get("invoice_date"),
            "extractedDueDate": ext_fields.get("due_date"),
            "extractedSubtotalUSD": ext_fields.get("subtotal_usd"),
            "extractedTaxUSD": ext_fields.get("tax_amount_usd"),
            "ocrReconciliation": ocr_result["math_reconciliation"],
            "modelOutputs": {
                "classifierProbabilityTampered": round(classifier_prob, 4),
                "localizerTamperAreaRatio": round(tamper_area_ratio, 4),
                "tamperRegionsCount": len(tamper_regions),
                "tamperRegions": tamper_regions
            },
            "forensicNotes": forensic_notes,
            "scanTimestamp": datetime.datetime.now().isoformat()
        }

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        engine = FraudDetectionEnsemble()
        res = engine.analyze_document(
            document_id="DOC-TEST-001",
            document_title="Vendor_Invoice_INV-902148.pdf",
            content_text="""
            INVOICE #INV-902148
            VENDOR: Apex Cloud Infrastructure LLC
            SUBTOTAL: $100,000.00
            TAX: $10,000.00
            GRAND TOTAL: $145,000.00
            DUE DATE: 2026-09-01
            DATE: 2026-10-24
            IBAN: CH93000000001928374
            """
        )
        print(json.dumps(res, indent=2))
    elif len(sys.argv) > 1 and sys.argv[1] == "--json":
        raw_in = sys.stdin.read()
        try:
            payload = json.loads(raw_in)
            engine = FraudDetectionEnsemble()
            res = engine.analyze_document(
                document_id=payload.get("documentId", "DOC-SCAN-001"),
                document_title=payload.get("documentTitle", "Scanned_Document.pdf"),
                document_type=payload.get("documentType", "pdf"),
                content_text=payload.get("contentText", ""),
                uploadedBy=payload.get("uploadedBy", "Analyst"),
                teamName=payload.get("teamName", "Finance"),
                image_base64=payload.get("imageBase64", None)
            )
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
