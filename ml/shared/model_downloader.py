from pathlib import Path
from huggingface_hub import snapshot_download

REPO_ID = "palakmalhotra/synapse-ml-models"
ML_DIR = Path(__file__).resolve().parent

def main():
    print("Downloading Synapse ML models...")

    snapshot_download(
        repo_id=REPO_ID,
        repo_type="model",
        local_dir=str(ML_DIR),
        allow_patterns=[
            "checkpoints/**",
            "fraud_checkpoints/**",
            "facial_recognition/models/**",
        ],
    )

    print("All Synapse models downloaded successfully.")

if __name__ == "__main__":
    main()