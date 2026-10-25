"""
Stream download model.safetensors with clean progress reports.
"""

import sys
import time
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models_cache" / "flan-t5-small"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

TARGET_FILE = MODEL_DIR / "model.safetensors"
TEMP_FILE = MODEL_DIR / "model.safetensors.tmp"

URL = "https://hf-mirror.com/google/flan-t5-small/resolve/main/model.safetensors"
HEADERS = {"User-Agent": "Mozilla/5.0"}

def main():
    if TARGET_FILE.exists() and TARGET_FILE.stat().st_size == 307867048:
        print(f"[OK] model.safetensors already complete ({TARGET_FILE.stat().st_size / (1024*1024):.2f} MB)")
        return

    print("Connecting to download model.safetensors (293.6 MB)...", flush=True)
    t0 = time.time()
    r = requests.get(URL, headers=HEADERS, stream=True, timeout=60)
    r.raise_for_status()

    total_len = int(r.headers.get("content-length", 307867048))
    downloaded = 0
    last_print = time.time()

    with open(TEMP_FILE, "wb") as f:
        for chunk in r.iter_content(chunk_size=512 * 1024):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if time.time() - last_print >= 2.0 or downloaded >= total_len:
                    pct = downloaded * 100 / total_len
                    mb = downloaded / (1024 * 1024)
                    tot_mb = total_len / (1024 * 1024)
                    speed = mb / max(time.time() - t0, 0.001)
                    print(f"Progress: {mb:.1f} / {tot_mb:.1f} MB ({pct:.1f}%) - Speed: {speed:.2f} MB/s", flush=True)
                    last_print = time.time()

    TEMP_FILE.rename(TARGET_FILE)
    elapsed = time.time() - t0
    print(f"\n[DONE] Successfully downloaded model.safetensors in {elapsed:.1f}s ({TARGET_FILE.stat().st_size / (1024*1024):.2f} MB)!", flush=True)

if __name__ == "__main__":
    main()
