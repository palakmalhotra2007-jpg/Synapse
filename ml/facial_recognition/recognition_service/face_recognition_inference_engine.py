"""
Synapse Facial Recognition & Anti-Spoofing Inference Engine
Provides high-speed biometric enrollment, verification, and liveness auditing.
"""

import os
import io
import json
import base64
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

from ml.facial_recognition.recognition_service.face_detection_preprocessing import FacePreprocessor
from ml.facial_recognition.recognition_service.face_recognition_model_architectures import AntiSpoofNet, FaceEmbeddingNet

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "trained_models")
ANTISPOOF_WEIGHTS = os.path.join(MODELS_DIR, "antispoof_model.pt")
FACERECOG_WEIGHTS = os.path.join(MODELS_DIR, "face_recognition_model.pt")
CLASSES_PATH = os.path.join(MODELS_DIR, "identity_classes.json")


class FaceBiometricEngine:
    def __init__(self, device: str = None):
        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        self.preprocessor = FacePreprocessor(target_size=(112, 112))
        self.antispoof_model = None
        self.facerecog_model = None
        self.class_map = {}

        self.load_models()

    def load_models(self):
        """Loads trained weights into evaluation mode."""
        print(f"Loading biometric models onto {self.device}...")

        # 1. Anti-Spoofing Model
        if os.path.exists(ANTISPOOF_WEIGHTS):
            self.antispoof_model = AntiSpoofNet(pretrained=False).to(self.device)
            ckpt = torch.load(ANTISPOOF_WEIGHTS, map_location=self.device)
            state = ckpt.get("model_state", ckpt)
            self.antispoof_model.load_state_dict(state)
            self.antispoof_model.eval()
            print(f"Loaded AntiSpoofNet (Val Acc: {ckpt.get('val_acc', 'N/A')}%)")
        else:
            print("Warning: antispoof_model.pt not found yet.")

        # 2. Face Recognition Embedding Model
        if os.path.exists(CLASSES_PATH):
            with open(CLASSES_PATH, "r") as f:
                self.class_map = json.load(f)

        num_classes = len(self.class_map) if self.class_map else 44
        if os.path.exists(FACERECOG_WEIGHTS):
            self.facerecog_model = FaceEmbeddingNet(
                embedding_dim=512, 
                num_classes=num_classes, 
                pretrained=False
            ).to(self.device)
            ckpt = torch.load(FACERECOG_WEIGHTS, map_location=self.device)
            state = ckpt.get("model_state", ckpt)
            self.facerecog_model.load_state_dict(state)
            self.facerecog_model.eval()
            print(f"Loaded FaceEmbeddingNet 512-D (Val Acc: {ckpt.get('val_acc', 'N/A')}%)")
        else:
            print("Warning: face_recognition_model.pt not found yet.")

    def parse_input_image(self, image_data):
        """
        Parses base64 string, bytes, or file path into PIL Image.
        """
        if isinstance(image_data, Image.Image):
            return image_data.convert("RGB")
        elif isinstance(image_data, np.ndarray):
            return Image.fromarray(image_data).convert("RGB")
        elif isinstance(image_data, bytes):
            return Image.open(io.BytesIO(image_data)).convert("RGB")
        elif isinstance(image_data, str):
            if image_data.startswith("data:image"):
                # Data URL
                header, encoded = image_data.split(",", 1)
                img_bytes = base64.b64decode(encoded)
                return Image.open(io.BytesIO(img_bytes)).convert("RGB")
            elif os.path.isfile(image_data):
                return Image.open(image_data).convert("RGB")
            else:
                # Raw base64 string
                img_bytes = base64.b64decode(image_data)
                return Image.open(io.BytesIO(img_bytes)).convert("RGB")
        raise ValueError(f"Unsupported image input type: {type(image_data)}")

    def extract_features(self, image_input):
        """
        Processes image through face detection, quality check, anti-spoofing, and embedding.
        Returns:
            dict containing:
                - quality: dict of sharpness, illumination, bbox
                - liveness: float score [0, 1]
                - is_live: bool
                - embedding: list of 512 floats (L2 normalized)
        """
        pil_img = self.parse_input_image(image_input)
        tensor, pil_crop, quality = self.preprocessor.preprocess_for_model(pil_img)
        tensor = tensor.to(self.device)

        # 1. Anti-Spoofing check
        liveness_score = 0.5
        is_live = True
        if self.antispoof_model is not None:
            with torch.no_grad():
                logits = self.antispoof_model(tensor)
                probs = F.softmax(logits, dim=1)
                # Class 1 is Real, Class 0 is Spoof
                liveness_score = float(probs[0, 1].item())
                is_live = liveness_score >= 0.50

        # 2. 512-D Face Embedding Extraction
        embedding = None
        if self.facerecog_model is not None:
            with torch.no_grad():
                emb = self.facerecog_model.extract_embedding(tensor)
                embedding = emb.squeeze(0).cpu().numpy().tolist()

        return {
            "quality": quality,
            "liveness_score": round(liveness_score, 4),
            "is_live": is_live,
            "embedding": embedding,
            "bbox": quality.get("bbox", [])
        }

    def verify(self, live_image, enrolled_embedding: list[float], threshold: float = 0.65) -> dict:
        """
        1:1 Face Verification comparing live face with enrolled embedding.
        """
        features = self.extract_features(live_image)
        live_emb = np.array(features["embedding"], dtype=np.float32)
        stored_emb = np.array(enrolled_embedding, dtype=np.float32)

        # Normalize
        live_norm = np.linalg.norm(live_emb)
        stored_norm = np.linalg.norm(stored_emb)
        if live_norm > 0:
            live_emb /= live_norm
        if stored_norm > 0:
            stored_emb /= stored_norm

        # Cosine Similarity
        cosine_sim = float(np.dot(live_emb, stored_emb))
        cosine_dist = float(1.0 - cosine_sim)

        # Verdict logic
        is_live = features["is_live"]
        matched = False
        verdict = "REJECTED"

        if not is_live:
            verdict = "SPOOF_ATTACK_DETECTED"
        elif cosine_sim >= threshold:
            matched = True
            verdict = "VERIFIED"
        elif cosine_sim >= (threshold - 0.15):
            verdict = "MANUAL_REVIEW"
        else:
            verdict = "IDENTITY_MISMATCH"

        return {
            "verified": matched,
            "verdict": verdict,
            "confidence": round(max(0.0, min(1.0, cosine_sim)), 4),
            "similarity": round(cosine_sim, 4),
            "distance": round(cosine_dist, 4),
            "liveness_score": features["liveness_score"],
            "is_live": is_live,
            "quality": features["quality"],
            "bbox": features["bbox"]
        }

    def identify(self, live_image, gallery: dict[str, list[float]], threshold: float = 0.60) -> dict:
        """
        1:N Face Identification matching live face against multiple enrolled candidate embeddings.
        gallery: { "EMP-ENG-001": [512-d list], ... }
        """
        features = self.extract_features(live_image)
        live_emb = np.array(features["embedding"], dtype=np.float32)
        live_norm = np.linalg.norm(live_emb)
        if live_norm > 0:
            live_emb /= live_norm

        best_id = None
        best_sim = -1.0

        for cand_id, stored_emb_list in gallery.items():
            stored_emb = np.array(stored_emb_list, dtype=np.float32)
            s_norm = np.linalg.norm(stored_emb)
            if s_norm > 0:
                stored_emb /= s_norm
            sim = float(np.dot(live_emb, stored_emb))
            if sim > best_sim:
                best_sim = sim
                best_id = cand_id

        is_match = best_sim >= threshold and features["is_live"]
        return {
            "identified": is_match,
            "best_match_id": best_id if is_match else None,
            "confidence": round(max(0.0, min(1.0, best_sim)), 4) if best_id else 0.0,
            "liveness_score": features["liveness_score"],
            "is_live": features["is_live"],
            "quality": features["quality"]
        }


# Global singleton instance for high-throughput reuse
_engine = None

def get_biometric_engine() -> FaceBiometricEngine:
    global _engine
    if _engine is None:
        _engine = FaceBiometricEngine()
    return _engine
