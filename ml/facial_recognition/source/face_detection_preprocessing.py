"""
Synapse Facial Recognition - Preprocessing & Quality Assessment Engine
Provides face detection, landmark alignment, and multi-attribute quality auditing.
"""

import os
try:
    import cv2
except ImportError:
    cv2 = None
import numpy as np
try:
    import torch
    from torchvision import transforms
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    torch = None
    transforms = None
from PIL import Image

CASCADE_PATH = os.path.join(os.path.dirname(__file__), "models", "haarcascade_frontalface_default.xml")


class FacePreprocessor:
    def __init__(self, target_size=(112, 112)):
        self.target_size = target_size
        self.cascade = None
        if cv2 is not None and hasattr(cv2, "CascadeClassifier") and os.path.exists(CASCADE_PATH):
            try:
                self.cascade = cv2.CascadeClassifier(CASCADE_PATH)
            except Exception:
                self.cascade = None

        if HAS_TORCH and transforms is not None:
            # PyTorch standard transformation for Face Models
            self.transform = transforms.Compose([
                transforms.Resize(self.target_size),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        else:
            def _pil_transform(img: Image.Image):
                resized = img.resize(self.target_size)
                arr = np.array(resized, dtype=np.float32) / 255.0
                mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
                norm = (arr - mean) / std
                return np.transpose(norm, (2, 0, 1))
            self.transform = _pil_transform

    def detect_face_bbox(self, image_np: np.ndarray):
        """
        Detects primary face bounding box (x, y, w, h).
        Falls back to center crop if no face detector found or detection misses.
        """
        h, w = image_np.shape[:2]
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY) if len(image_np.shape) == 3 else image_np

        if self.cascade is not None:
            try:
                faces = self.cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=4,
                    minSize=(50, 50),
                    flags=getattr(cv2, "CASCADE_SCALE_IMAGE", 0)
                )
                if len(faces) > 0:
                    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                    return tuple(int(v) for v in faces[0])
            except Exception:
                pass

        # Standard face-centered framing fallback (80% central region with 1:1 aspect)
        box_size = int(min(h, w) * 0.85)
        x = max(0, (w - box_size) // 2)
        y = max(0, (h - box_size) // 2)
        return (x, y, box_size, box_size)

    def crop_and_align_face(self, image_np: np.ndarray, bbox=None, margin=0.15):
        """
        Crops face with contextual margin and resizes to target dimension.
        """
        h, w = image_np.shape[:2]
        if bbox is None:
            bbox = self.detect_face_bbox(image_np)

        x, y, bw, bh = bbox
        
        # Add margin
        mx = int(bw * margin)
        my = int(bh * margin)
        x1 = max(0, x - mx)
        y1 = max(0, y - my)
        x2 = min(w, x + bw + mx)
        y2 = min(h, y + bh + my)

        cropped = image_np[y1:y2, x1:x2]
        if cropped.size == 0:
            cropped = image_np

        pil_img = Image.fromarray(cropped)
        return pil_img, (x, y, bw, bh)

    def assess_quality(self, image_np: np.ndarray, bbox=None):
        """
        Evaluates face quality across:
        1. Blur / Sharpness: Laplacian variance
        2. Illumination: Mean and variance of brightness channel (HSV)
        3. Size / Resolution: Bounding box pixel density
        """
        if bbox is None:
            bbox = self.detect_face_bbox(image_np)

        x, y, bw, bh = bbox
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY) if len(image_np.shape) == 3 else image_np
        face_roi = gray[y:y+bh, x:x+bw] if y+bh <= gray.shape[0] and x+bw <= gray.shape[1] else gray

        # 1. Sharpness via Laplacian variance
        laplacian_var = float(cv2.Laplacian(face_roi, cv2.CV_64F).var())
        is_sharp = laplacian_var >= 45.0
        sharpness_score = min(1.0, laplacian_var / 150.0)

        # 2. Illumination check
        if len(image_np.shape) == 3:
            hsv = cv2.cvtColor(image_np[y:y+bh, x:x+bw] if y+bh <= image_np.shape[0] and x+bw <= image_np.shape[1] else image_np, cv2.COLOR_RGB2HSV)
            v_channel = hsv[:, :, 2]
            mean_brightness = float(np.mean(v_channel))
        else:
            mean_brightness = float(np.mean(face_roi))

        is_well_lit = 35.0 <= mean_brightness <= 225.0
        illumination_score = 1.0 - abs(mean_brightness - 128.0) / 128.0

        # 3. Resolution score
        resolution_score = min(1.0, (bw * bh) / (120.0 * 120.0))

        # Overall composite quality index
        quality_score = 0.40 * sharpness_score + 0.35 * illumination_score + 0.25 * resolution_score
        is_acceptable = quality_score >= 0.40 and is_sharp and is_well_lit

        return {
            "acceptable": is_acceptable,
            "quality_score": round(quality_score, 4),
            "sharpness": {
                "laplacian_var": round(laplacian_var, 2),
                "is_sharp": is_sharp,
                "score": round(sharpness_score, 4)
            },
            "illumination": {
                "mean_brightness": round(mean_brightness, 2),
                "is_well_lit": is_well_lit,
                "score": round(illumination_score, 4)
            },
            "bbox": [int(x), int(y), int(bw), int(bh)]
        }

    def preprocess_for_model(self, image_input):
        """
        Accepts PIL Image, numpy array, or file path.
        Returns:
            tensor: (1, 3, H, W) normalized tensor
            pil_crop: cropped PIL image
            quality: quality assessment dict
        """
        if isinstance(image_input, str):
            image_np = np.array(Image.open(image_input).convert("RGB"))
        elif isinstance(image_input, Image.Image):
            image_np = np.array(image_input.convert("RGB"))
        elif isinstance(image_input, np.ndarray):
            image_np = image_input if len(image_input.shape) == 3 else cv2.cvtColor(image_input, cv2.COLOR_GRAY2RGB)
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        quality = self.assess_quality(image_np)
        pil_crop, bbox = self.crop_and_align_face(image_np, bbox=quality["bbox"])
        tensor = self.transform(pil_crop).unsqueeze(0)
        
        return tensor, pil_crop, quality
