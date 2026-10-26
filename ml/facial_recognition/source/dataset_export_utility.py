"""
Synapse Facial Recognition & Anti-Spoofing - Dataset Export & Pairing Pipeline
Exports real face images (Olivetti 40-subject benchmark + Synapse Employee profiles)
and synthesizes a realistic Anti-Spoofing benchmark dataset.
"""

import os
import random
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import sklearn.datasets
import urllib.request

DATA_DIR = os.path.join(os.path.dirname(__file__), "datasets")
IDENTITIES_DIR = os.path.join(DATA_DIR, "identities")
ANTISPOOF_DIR = os.path.join(DATA_DIR, "antispoof")
REAL_DIR = os.path.join(ANTISPOOF_DIR, "real")
SPOOF_DIR = os.path.join(ANTISPOOF_DIR, "spoof")

for d in [IDENTITIES_DIR, REAL_DIR, SPOOF_DIR]:
    os.makedirs(d, exist_ok=True)


def generate_spoof_variations(img: Image.Image) -> list[Image.Image]:
    """Generates print attack, screen replay, and motion/blur spoof variants."""
    spoofs = []
    
    # 1. Print Paper Attack
    p_img = img.copy()
    p_img = ImageEnhance.Color(p_img).enhance(random.uniform(0.55, 0.75))
    p_img = ImageEnhance.Brightness(p_img).enhance(random.uniform(1.15, 1.30))
    p_img = ImageEnhance.Contrast(p_img).enhance(random.uniform(0.70, 0.85))
    np_p = np.array(p_img, dtype=np.float32)
    noise = np.random.normal(0, 10, np_p.shape)
    np_p = np.clip(np_p + noise, 0, 255).astype(np.uint8)
    spoofs.append(Image.fromarray(np_p))
    
    # 2. Digital Screen Replay Attack (Moiré grid + blue cast)
    s_img = img.copy()
    np_s = np.array(s_img, dtype=np.float32)
    h, w, c = np_s.shape
    freq = random.uniform(0.2, 0.4)
    y_coords = np.arange(h)
    grid = (np.sin(y_coords * freq * 2 * np.pi) * 16).reshape(h, 1, 1)
    np_s = np.clip(np_s + grid, 0, 255)
    np_s[:, :, 0] *= 0.92  # reduce red
    np_s[:, :, 2] = np.clip(np_s[:, :, 2] * 1.15, 0, 255)  # boost blue
    spoofs.append(Image.fromarray(np_s.astype(np.uint8)))
    
    # 3. Low-quality capture blur attack
    b_img = img.copy().filter(ImageFilter.GaussianBlur(radius=random.uniform(2.5, 4.0)))
    spoofs.append(b_img)
    
    return spoofs


def export_pipeline():
    print("Loading benchmark face dataset (40 identities, 400 images)...")
    faces_bunch = sklearn.datasets.fetch_olivetti_faces(data_home=DATA_DIR)
    images = faces_bunch.images # shape: (400, 64, 64)
    targets = faces_bunch.target # shape: (400,)

    total_real = 0
    total_spoofs = 0

    print("Exporting identity directories and anti-spoof pairs...")
    for idx in range(len(images)):
        subject_id = int(targets[idx])
        img_arr = (images[idx] * 255.0).astype(np.uint8)
        # Convert grayscale to 3-channel RGB for ResNet
        img_rgb = np.stack([img_arr]*3, axis=-1)
        pil_img = Image.fromarray(img_rgb).resize((112, 112), Image.Resampling.BILINEAR)

        # 1. Save in Identity directory
        sub_dir = os.path.join(IDENTITIES_DIR, f"subject_{subject_id:02d}")
        os.makedirs(sub_dir, exist_ok=True)
        img_fn = f"face_{idx % 10:02d}.jpg"
        pil_img.save(os.path.join(sub_dir, img_fn), "JPEG", quality=95)

        # 2. Save in Anti-Spoof Real directory
        real_fn = f"real_{total_real:04d}_subj{subject_id:02d}.jpg"
        pil_img.save(os.path.join(REAL_DIR, real_fn), "JPEG", quality=95)
        total_real += 1

        # 3. Generate and save Spoofs (1:1 ratio for balanced training)
        spoof_variants = generate_spoof_variations(pil_img)
        # Pick 1 random spoof variant per real sample to keep perfectly balanced classes
        selected_spoof = random.choice(spoof_variants)
        spoof_fn = f"spoof_{total_spoofs:04d}_subj{subject_id:02d}.jpg"
        selected_spoof.save(os.path.join(SPOOF_DIR, spoof_fn), "JPEG", quality=90)
        total_spoofs += 1

    # Also download Synapse corporate employee faces
    corporate_faces = [
        ("EMP-ENG-001_Charvi", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80"),
        ("EMP-ENG-002_Tanisha", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80"),
        ("EMP-ENG-003_Anshika", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80"),
        ("EMP-ENG-004_Bhavya", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80"),
    ]

    print("Downloading and enrolling Synapse Corporate Employee Face Datasets...")
    for emp_id, url in corporate_faces:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as r:
                raw_bytes = r.read()
            emp_pil = Image.open(io.BytesIO(raw_bytes)).convert("RGB").resize((112, 112))
            
            # Save 5 variations with subtle rotations/crops
            emp_dir = os.path.join(IDENTITIES_DIR, emp_id)
            os.makedirs(emp_dir, exist_ok=True)
            for v_idx in range(5):
                var_img = emp_pil.copy()
                if v_idx > 0:
                    var_img = var_img.rotate(random.uniform(-8, 8))
                    var_img = ImageEnhance.Brightness(var_img).enhance(random.uniform(0.9, 1.1))
                var_img.save(os.path.join(emp_dir, f"face_{v_idx:02d}.jpg"), "JPEG", quality=95)
                
                # Real anti-spoof
                r_fn = f"real_{total_real:04d}_{emp_id}.jpg"
                var_img.save(os.path.join(REAL_DIR, r_fn), "JPEG", quality=95)
                total_real += 1
                
                # Spoof anti-spoof
                sp_img = random.choice(generate_spoof_variations(var_img))
                s_fn = f"spoof_{total_spoofs:04d}_{emp_id}.jpg"
                sp_img.save(os.path.join(SPOOF_DIR, s_fn), "JPEG", quality=90)
                total_spoofs += 1
                
            print(f"Enrolled employee profile: {emp_id}")
        except Exception as e:
            print(f"Note: Could not fetch {emp_id} online, skipping: {e}")

    print("\nDataset Export Summary:")
    print(f"Total Authentic (Real) Images: {total_real}")
    print(f"Total Spoof Attack Samples: {total_spoofs}")
    print(f"Total Enrolled Identities: {len(os.listdir(IDENTITIES_DIR))}")
    print(f"Dataset root: {DATA_DIR}")


if __name__ == "__main__":
    import io
    export_pipeline()
