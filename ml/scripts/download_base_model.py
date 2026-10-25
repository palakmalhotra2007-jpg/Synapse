"""
Download google/flan-t5-small directly from mirror with progress tracking.
"""

import os
import sys
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models_cache" / "flan-t5-small"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FILES = [
    "config.json",
    "generation_config.json",
    "model.safetensors",
    "spiece.model",
    "tokenizer.json",
    "tokenizer_config.json",
    "special_tokens_map.json"
]

BASE_URL = "https://hf-mirror.com/google/flan-t5-small/resolve/main"

def download_file(file_name: str):
    dest_path = MODEL_DIR / file_name
    if dest_path.exists() and dest_path.stat().st_size > 0:
        # Check if already fully downloaded
        print(f"[CACHE] {file_name} already exists ({dest_path.stat().st_size / 1024 / 1024:.2f} MB)")
        return

    url = f"{BASE_URL}/{file_name}"
    print(f"[DOWNLOADING] {file_name} from {url}...")
    
    def reporthook(count, block_size, total_size):
        if total_size > 0:
            percent = count * block_size * 100 / total_size
            downloaded_mb = count * block_size / (1024 * 1024)
            total_mb = total_size / (1024 * 1024)
            if count % 200 == 0 or percent >= 100:
                print(f"  {file_name}: {downloaded_mb:.1f}/{total_mb:.1f} MB ({min(percent, 100.0):.1f}%)", end="\r")

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=60) as response, open(dest_path, 'wb') as out_file:
            total_size = int(response.info().get('Content-Length', -1))
            downloaded = 0
            block_size = 64 * 1024  # 64 KB
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                downloaded += len(buffer)
                out_file.write(buffer)
                if total_size > 0 and (downloaded % (2 * 1024 * 1024) == 0 or downloaded >= total_size):
                    print(f"  {file_name}: {downloaded / 1048576:.1f}/{total_size / 1048576:.1f} MB ({downloaded * 100 / total_size:.1f}%)", end="\r")
        print(f"\n[DONE] {file_name} successfully downloaded ({dest_path.stat().st_size / 1024 / 1024:.2f} MB)")
    except Exception as e:
        print(f"\n[ERROR] Failed to download {file_name}: {e}")
        if dest_path.exists():
            dest_path.unlink()
        raise

if __name__ == "__main__":
    print(f"Downloading FLAN-T5-small to {MODEL_DIR}...")
    for f in FILES:
        download_file(f)
    print("\nAll model files downloaded successfully!")
