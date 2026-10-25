"""
Synapse Facial Recognition & Anti-Spoofing Neural Network Architectures
Implements:
1. FaceEmbeddingNet: 512-D L2-normalized feature representation network.
2. AntiSpoofNet: Binary liveness classifier (real face vs photo print vs digital screen).
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models


class ArcMarginProduct(nn.Module):
    """
    ArcFace: Additive Angular Margin Loss for Deep Face Recognition (Deng et al., CVPR 2019).
    Enforces intra-class compactness and inter-class discrepancy on the hypersphere.
    """
    def __init__(self, in_features: int, out_features: int, s: float = 30.0, m: float = 0.50):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.s = s
        self.m = m
        self.weight = nn.Parameter(torch.FloatTensor(out_features, in_features))
        nn.init.xavier_uniform_(self.weight)

        self.cos_m = math.cos(m)
        self.sin_m = math.sin(m)
        self.th = math.cos(math.pi - m)
        self.mm = math.sin(math.pi - m) * m

    def forward(self, input_features: torch.Tensor, labels: torch.Tensor = None) -> torch.Tensor:
        # Normalize weights and features
        cosine = F.linear(F.normalize(input_features), F.normalize(self.weight))
        if labels is None:
            return cosine * self.s

        sine = torch.sqrt(1.0 - torch.clamp(cosine ** 2, 0.0, 1.0))
        phi = cosine * self.cos_m - sine * self.sin_m
        phi = torch.where(cosine > self.th, phi, cosine - self.mm)

        one_hot = torch.zeros(cosine.size(), device=input_features.device)
        one_hot.scatter_(1, labels.view(-1, 1).long(), 1)
        output = (one_hot * phi) + ((1.0 - one_hot) * cosine)
        output *= self.s
        return output


class FaceEmbeddingNet(nn.Module):
    """
    Deep Residual Face Feature Extractor producing 512-D L2-normalized identity embeddings.
    """
    def __init__(self, embedding_dim: int = 512, num_classes: int = 50, pretrained: bool = True):
        super().__init__()
        self.embedding_dim = embedding_dim
        
        # ResNet-18 Backbone
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        backbone = models.resnet18(weights=weights)
        
        self.conv1 = backbone.conv1
        self.bn1 = backbone.bn1
        self.relu = backbone.relu
        self.maxpool = backbone.maxpool
        self.layer1 = backbone.layer1
        self.layer2 = backbone.layer2
        self.layer3 = backbone.layer3
        self.layer4 = backbone.layer4
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))

        # 512-D Projection Bottleneck
        self.fc_embedding = nn.Sequential(
            nn.Linear(512, embedding_dim),
            nn.BatchNorm1d(embedding_dim)
        )
        
        # ArcFace / Classification head for training
        self.num_classes = num_classes
        if num_classes > 0:
            self.arcface = ArcMarginProduct(embedding_dim, num_classes)
        else:
            self.arcface = None

    def extract_embedding(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass up to normalized 512-D embedding."""
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        emb = self.fc_embedding(x)
        emb = F.normalize(emb, p=2, dim=1)
        return emb

    def forward(self, x: torch.Tensor, labels: torch.Tensor = None) -> torch.Tensor:
        emb = self.extract_embedding(x)
        if self.arcface is not None and labels is not None:
            return self.arcface(emb, labels), emb
        return emb


class AntiSpoofNet(nn.Module):
    """
    Binary liveness neural network discriminating authentic faces vs spoofing attacks
    (photo prints, digital screen replays, paper cutouts).
    Outputs 2 class logits: [Class 0: Spoof, Class 1: Real].
    """
    def __init__(self, pretrained: bool = True):
        super().__init__()
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        backbone = models.resnet18(weights=weights)

        # Retain feature extraction layers
        self.features = nn.Sequential(
            backbone.conv1,
            backbone.bn1,
            backbone.relu,
            backbone.maxpool,
            backbone.layer1,
            backbone.layer2,
            backbone.layer3,
            backbone.layer4,
            nn.AdaptiveAvgPool2d((1, 1))
        )

        # Classification Head with strong regularization against spoof artifacts
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.4),
            nn.Linear(128, 2) # [0: Spoof, 1: Real]
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        f = self.features(x)
        logits = self.classifier(f)
        return logits

    def predict_liveness(self, x: torch.Tensor) -> tuple[float, bool]:
        """
        Inference helper returning (liveness_probability, is_real)
        """
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            probs = F.softmax(logits, dim=1)
            real_prob = float(probs[0, 1].item())
            is_real = real_prob >= 0.60
            return real_prob, is_real
