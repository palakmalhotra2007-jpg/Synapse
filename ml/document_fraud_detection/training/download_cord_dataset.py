import urllib.request
import os
import sys
import time

url = 'https://huggingface.co/datasets/naver-clova-ix/cord-v1/resolve/main/data/test-00000-of-00001-f6c27485d73a0328.parquet'
target_file = 'ml/fraud_data/cord_test.parquet'

print(f"Connecting to {url}...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

start_time = time.time()
with urllib.request.urlopen(req, timeout=30) as resp, open(target_file, 'wb') as out_f:
    total_size = int(resp.headers.get('Content-Length', 0))
    print(f"Total file size: {total_size / (1024*1024):.2f} MB")
    
    downloaded = 0
    chunk_size = 1024 * 512 # 512 KB
    last_print = time.time()
    
    while True:
        chunk = resp.read(chunk_size)
        if not chunk:
            break
        out_f.write(chunk)
        downloaded += len(chunk)
        if time.time() - last_print > 3:
            print(f"Downloaded {downloaded / (1024*1024):.2f} / {total_size / (1024*1024):.2f} MB ({downloaded/total_size*100:.1f}%)")
            last_print = time.time()

elapsed = time.time() - start_time
print(f"Download complete! Saved {os.path.getsize(target_file)} bytes in {elapsed:.1f}s")
