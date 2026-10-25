"""
Fast parallel multi-threaded downloader for FLAN-T5-small model weights.
Uses 8 parallel chunk workers with HTTP Range headers and automatic retry.
"""

import os
import sys
import time
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models_cache" / "flan-t5-small"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
}

SMALL_FILES = [
    "config.json",
    "generation_config.json",
    "spiece.model",
    "tokenizer.json",
    "tokenizer_config.json",
    "special_tokens_map.json"
]

def download_small_file(filename: str):
    dest = MODEL_DIR / filename
    if dest.exists() and dest.stat().st_size > 0:
        print(f"[OK] {filename} already exists ({dest.stat().st_size} bytes)")
        return

    url = f"https://hf-mirror.com/google/flan-t5-small/resolve/main/{filename}"
    print(f"Downloading {filename}...")
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            with open(dest, "wb") as f:
                f.write(r.content)
            print(f"[SUCCESS] {filename} saved ({len(r.content)} bytes)")
            return
        except Exception as e:
            print(f"Attempt {attempt+1} failed for {filename}: {e}")
            time.sleep(1)
    raise RuntimeError(f"Failed to download {filename}")

def download_chunk(url: str, start: int, end: int, chunk_id: int, temp_file: Path):
    headers = dict(HEADERS)
    headers["Range"] = f"bytes={start}-{end}"
    for attempt in range(5):
        try:
            r = requests.get(url, headers=headers, timeout=20, stream=True)
            r.raise_for_status()
            with open(temp_file, "wb") as f:
                for chunk in r.iter_content(chunk_size=65536):
                    if chunk:
                        f.write(chunk)
            return chunk_id, temp_file
        except Exception as e:
            print(f"Chunk {chunk_id} attempt {attempt+1} error: {e}")
            time.sleep(1)
    raise RuntimeError(f"Chunk {chunk_id} failed after 5 retries")

def download_large_file(filename: str = "model.safetensors", num_threads: int = 8):
    dest = MODEL_DIR / filename
    url = f"https://hf-mirror.com/google/flan-t5-small/resolve/main/{filename}"
    
    # Get total file size
    r = requests.head(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    total_size = int(r.headers.get("content-length", 0))
    print(f"Total size of {filename}: {total_size / (1024*1024):.2f} MB")

    if dest.exists() and dest.stat().st_size == total_size:
        print(f"[OK] {filename} already fully downloaded ({total_size / (1024*1024):.2f} MB)")
        return

    chunk_size = (total_size + num_threads - 1) // num_threads
    chunks = []
    temp_files = []

    for i in range(num_threads):
        start = i * chunk_size
        end = min((i + 1) * chunk_size - 1, total_size - 1)
        temp_file = MODEL_DIR / f"{filename}.part{i}"
        chunks.append((url, start, end, i, temp_file))
        temp_files.append(temp_file)

    print(f"Starting parallel download with {num_threads} workers ({chunk_size / (1024*1024):.2f} MB per chunk)...")
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(download_chunk, *c) for c in chunks]
        completed = 0
        for f in as_completed(futures):
            chunk_id, _ = f.result()
            completed += 1
            elapsed = time.time() - start_time
            print(f"  Chunk {chunk_id} finished ({completed}/{num_threads}) in {elapsed:.1f}s")

    print("All chunks downloaded! Merging parts into final file...")
    with open(dest, "wb") as outfile:
        for temp_file in temp_files:
            with open(temp_file, "rb") as infile:
                while True:
                    buf = infile.read(1024 * 1024)
                    if not buf:
                        break
                    outfile.write(buf)
            temp_file.unlink(missing_ok=True)

    elapsed_total = time.time() - start_time
    final_size = dest.stat().st_size
    print(f"[COMPLETE] {filename} successfully downloaded and assembled!")
    print(f"Size: {final_size / (1024*1024):.2f} MB in {elapsed_total:.2f}s ({final_size / (1024*1024) / elapsed_total:.2f} MB/s)")

if __name__ == "__main__":
    print("=== Downloading FLAN-T5-small ===")
    for sf in SMALL_FILES:
        download_small_file(sf)
    download_large_file("model.safetensors", num_threads=8)
    print("=== FLAN-T5-small is ready locally! ===")
