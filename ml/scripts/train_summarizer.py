"""
SYNAPSE - Phase 3: Model 1 Training (Meeting Summarizer on MeetingBank & QMSum)
=============================================================================
Architecture: google/flan-t5-small (Sequence-to-Sequence, 77M parameters)
Datasets: MeetingBank (municipal meetings) + QMSum (query/topic summaries)
Metrics: ROUGE-1, ROUGE-2, ROUGE-L (Pretrained Baseline vs Fine-Tuned)
"""

import os
import sys

# Fast mirror to prevent Hugging Face CDN timeout on Windows
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import json
import time
from pathlib import Path
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
    get_linear_schedule_with_warmup
)
from torch.optim import AdamW
import evaluate

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
CHECKPOINT_DIR = BASE_DIR / "checkpoints" / "flan_t5_summarizer"
METRICS_DIR = BASE_DIR / "metrics"

for d in [CHECKPOINT_DIR, METRICS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

class MeetingSummaryDataset(Dataset):
    def __init__(self, data_file: Path, tokenizer, max_input_len=512, max_target_len=256):
        with open(data_file, "r", encoding="utf-8") as f:
            self.records = json.load(f)
        self.tokenizer = tokenizer
        self.max_input_len = max_input_len
        self.max_target_len = max_target_len

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        item = self.records[idx]
        inputs = self.tokenizer(
            item["input_text"],
            max_length=self.max_input_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        labels = self.tokenizer(
            item["target_text"],
            max_length=self.max_target_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        labels_ids = labels["input_ids"].squeeze(0)
        labels_ids[labels_ids == self.tokenizer.pad_token_id] = -100

        return {
            "input_ids": inputs["input_ids"].squeeze(0),
            "attention_mask": inputs["attention_mask"].squeeze(0),
            "labels": labels_ids,
            "raw_input": item["input_text"],
            "raw_target": item["target_text"],
            "id": item["id"]
        }

def compute_rouge_metrics(predictions, references):
    rouge = evaluate.load("rouge")
    scores = rouge.compute(predictions=predictions, references=references, use_stemmer=True)
    return {
        "rouge1": round(scores["rouge1"] * 100, 2),
        "rouge2": round(scores["rouge2"] * 100, 2),
        "rougeL": round(scores["rougeL"] * 100, 2),
        "rougeLsum": round(scores["rougeLsum"] * 100, 2),
    }

def run_training():
    print("=" * 70)
    print("SYNAPSE ML: TRAINING FLAN-T5-SMALL ON MEETINGBANK & QMSUM")
    print("=" * 70)

    model_cache = BASE_DIR / "models_cache" / "flan-t5-small"
    model_name = str(model_cache) if model_cache.exists() and (model_cache / "model.safetensors").exists() else "google/flan-t5-small"
    print(f"Loading Base Tokenizer & Pretrained Model: {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    device = torch.device("cpu")
    model.to(device)

    train_file = PROCESSED_DIR / "summarizer_train.json"
    val_file = PROCESSED_DIR / "summarizer_val.json"
    test_file = PROCESSED_DIR / "summarizer_test.json"

    train_dataset = MeetingSummaryDataset(train_file, tokenizer)
    val_dataset = MeetingSummaryDataset(val_file, tokenizer)
    test_dataset = MeetingSummaryDataset(test_file, tokenizer)

    train_loader = DataLoader(train_dataset, batch_size=1, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=1, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=1, shuffle=False)

    print(f"Dataset Loaded: {len(train_dataset)} train, {len(val_dataset)} val, {len(test_dataset)} test")

    # ---------------------------------------------------------------------
    # 1. EVALUATE PRETRAINED BASELINE MODEL (BEFORE FINE-TUNING)
    # ---------------------------------------------------------------------
    print("\n--- Evaluating Pretrained Baseline (Zero-Shot FLAN-T5-small) ---")
    model.eval()
    baseline_preds = []
    ground_truths = []
    
    with torch.no_grad():
        for batch in test_loader:
            outputs = model.generate(
                input_ids=batch["input_ids"].to(device),
                attention_mask=batch["attention_mask"].to(device),
                max_length=180,
                num_beams=2,
                early_stopping=True
            )
            decoded_pred = tokenizer.decode(outputs[0], skip_special_tokens=True)
            baseline_preds.append(decoded_pred)
            ground_truths.append(batch["raw_target"][0])

    baseline_rouge = compute_rouge_metrics(baseline_preds, ground_truths)
    print(f"Pretrained Baseline Scores:")
    print(f"  ROUGE-1: {baseline_rouge['rouge1']}% | ROUGE-2: {baseline_rouge['rouge2']}% | ROUGE-L: {baseline_rouge['rougeL']}%")

    # ---------------------------------------------------------------------
    # 2. FINE-TUNING LOOP (PyTorch + Hugging Face Transformers)
    # ---------------------------------------------------------------------
    print("\n--- Executing Actual Model Fine-Tuning (3 Epochs) ---")
    epochs = 3
    optimizer = AdamW(model.parameters(), lr=4e-4, weight_decay=0.01)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=2, num_training_steps=total_steps)

    training_logs = []
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        epoch_loss = 0.0

        for step, batch in enumerate(train_loader, start=1):
            optimizer.zero_grad()
            outputs = model(
                input_ids=batch["input_ids"].to(device),
                attention_mask=batch["attention_mask"].to(device),
                labels=batch["labels"].to(device)
            )
            loss = outputs.loss
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()

            epoch_loss += loss.item()
            print(f"  Epoch {epoch}/{epochs} | Step {step}/{len(train_loader)} | Loss: {loss.item():.4f}")

        avg_train_loss = epoch_loss / len(train_loader)

        # Validation Loss
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                v_out = model(
                    input_ids=batch["input_ids"].to(device),
                    attention_mask=batch["attention_mask"].to(device),
                    labels=batch["labels"].to(device)
                )
                val_loss += v_out.loss.item()
        avg_val_loss = val_loss / max(1, len(val_loader))

        log_entry = {
            "epoch": epoch,
            "train_loss": round(avg_train_loss, 4),
            "val_loss": round(avg_val_loss, 4)
        }
        training_logs.append(log_entry)
        print(f"-> Epoch {epoch} Complete: Avg Train Loss = {avg_train_loss:.4f}, Val Loss = {avg_val_loss:.4f}")

    total_training_time = round(time.time() - start_time, 2)
    print(f"\nFine-Tuning Finished in {total_training_time} seconds!")

    # ---------------------------------------------------------------------
    # 3. EVALUATE FINE-TUNED MODEL & COMPARE AGAINST BASELINE
    # ---------------------------------------------------------------------
    print("\n--- Evaluating Fine-Tuned Model on Test Split ---")
    model.eval()
    finetuned_preds = []
    
    with torch.no_grad():
        for batch in test_loader:
            outputs = model.generate(
                input_ids=batch["input_ids"].to(device),
                attention_mask=batch["attention_mask"].to(device),
                max_length=220,
                num_beams=2,
                early_stopping=True
            )
            decoded_pred = tokenizer.decode(outputs[0], skip_special_tokens=True)
            finetuned_preds.append(decoded_pred)

    finetuned_rouge = compute_rouge_metrics(finetuned_preds, ground_truths)
    print(f"Fine-Tuned Model Scores:")
    print(f"  ROUGE-1: {finetuned_rouge['rouge1']}% | ROUGE-2: {finetuned_rouge['rouge2']}% | ROUGE-L: {finetuned_rouge['rougeL']}%")

    r1_gain = round(finetuned_rouge['rouge1'] - baseline_rouge['rouge1'], 2)
    r2_gain = round(finetuned_rouge['rouge2'] - baseline_rouge['rouge2'], 2)
    rL_gain = round(finetuned_rouge['rougeL'] - baseline_rouge['rougeL'], 2)

    print("\nPerformance Comparison Summary:")
    print(f"  ROUGE-1: {baseline_rouge['rouge1']}% -> {finetuned_rouge['rouge1']}% (+{r1_gain}%)")
    print(f"  ROUGE-2: {baseline_rouge['rouge2']}% -> {finetuned_rouge['rouge2']}% (+{r2_gain}%)")
    print(f"  ROUGE-L: {baseline_rouge['rougeL']}% -> {finetuned_rouge['rougeL']}% (+{rL_gain}%)")

    # ---------------------------------------------------------------------
    # 4. SAVE MODEL CHECKPOINT & METRICS
    # ---------------------------------------------------------------------
    print(f"\nSaving fine-tuned model checkpoint to {CHECKPOINT_DIR}...")
    model.save_pretrained(CHECKPOINT_DIR)
    tokenizer.save_pretrained(CHECKPOINT_DIR)

    metrics_payload = {
        "model_type": "FLAN-T5-small (Meeting Summarizer)",
        "base_model": model_name,
        "dataset_trained": "MeetingBank & QMSum",
        "training_time_seconds": total_training_time,
        "epochs": epochs,
        "training_logs": training_logs,
        "baseline_metrics": baseline_rouge,
        "finetuned_metrics": finetuned_rouge,
        "rouge_gains": {
            "rouge1_gain": r1_gain,
            "rouge2_gain": r2_gain,
            "rougeL_gain": rL_gain
        },
        "sample_evaluations": [
            {
                "ground_truth": ground_truths[0],
                "pretrained_baseline_output": baseline_preds[0],
                "finetuned_model_output": finetuned_preds[0]
            }
        ]
    }

    metrics_file = METRICS_DIR / "summarizer_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    # Human-readable comparison text
    comparison_file = METRICS_DIR / "summarizer_comparison.txt"
    with open(comparison_file, "w", encoding="utf-8") as f:
        f.write("SYNAPSE AI MEETING ANALYSER - MODEL 1 EVALUATION REPORT\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Base Architecture: {model_name}\n")
        f.write(f"Trained on: MeetingBank + QMSum (Municipal & Strategy Meetings)\n")
        f.write(f"Total Training Duration: {total_training_time}s across {epochs} epochs\n\n")
        f.write("ROUGE EVALUATION METRICS COMPARISON:\n")
        f.write(f"  Metric   | Pretrained Baseline | Fine-Tuned FLAN-T5 | Relative Gain\n")
        f.write(f"  ROUGE-1  | {baseline_rouge['rouge1']:>17}% | {finetuned_rouge['rouge1']:>16}% | +{r1_gain}%\n")
        f.write(f"  ROUGE-2  | {baseline_rouge['rouge2']:>17}% | {finetuned_rouge['rouge2']:>16}% | +{r2_gain}%\n")
        f.write(f"  ROUGE-L  | {baseline_rouge['rougeL']:>17}% | {finetuned_rouge['rougeL']:>16}% | +{rL_gain}%\n\n")
        f.write("-" * 60 + "\n")
        f.write("SAMPLE PREDICTIONS:\n\n")
        f.write("[Ground Truth Summary]:\n" + ground_truths[0] + "\n\n")
        f.write("[Pretrained Zero-Shot Output]:\n" + baseline_preds[0] + "\n\n")
        f.write("[Fine-Tuned Model Output]:\n" + finetuned_preds[0] + "\n")

    print(f"Metrics saved to {metrics_file}")
    print(f"Detailed comparison report saved to {comparison_file}")

if __name__ == "__main__":
    run_training()
