"""
SYNAPSE - Phase 3: Model 2 Training (Action Item & Task Extractor)
=================================================================
Architecture: google/flan-t5-small (Sequence-to-Sequence Structured Task Generation)
Datasets: AMI Scenario Action Items + Synthetic Meeting-to-Task
Target: Task title, Description, Assignee, Deadline, Priority, Supporting Evidence
Metrics: Task Detection Precision, Recall, F1-Score, Assignee Accuracy, Deadline Accuracy
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

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
CHECKPOINT_DIR = BASE_DIR / "checkpoints" / "flan_t5_action_extractor"
METRICS_DIR = BASE_DIR / "metrics"

for d in [CHECKPOINT_DIR, METRICS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

class ActionItemDataset(Dataset):
    def __init__(self, data_file: Path, tokenizer, max_input_len=512, max_target_len=300):
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
            "ground_items": item["action_items"],
            "id": item["id"]
        }

def evaluate_task_extraction(predictions, ground_truths_list):
    """
    Computes Task Detection Precision, Recall, F1, Assignee Accuracy, and Deadline Accuracy.
    """
    total_gold_tasks = 0
    total_pred_tasks = 0
    matched_tasks = 0
    correct_assignees = 0
    correct_deadlines = 0

    for pred_text, gold_items in zip(predictions, ground_truths_list):
        total_gold_tasks += len(gold_items)
        
        # Parse JSON predictions or line items
        parsed_preds = []
        try:
            parsed = json.loads(pred_text)
            if isinstance(parsed, list):
                parsed_preds = parsed
            elif isinstance(parsed, dict) and "action_items" in parsed:
                parsed_preds = parsed["action_items"]
        except Exception:
            # Fallback regex parsing if JSON formatting has minor token truncation
            lines = [l.strip() for l in pred_text.split("\n") if l.strip()]
            for l in lines:
                parsed_preds.append({"task_title": l, "assignee": "TBD", "deadline": "TBD"})

        total_pred_tasks += len(parsed_preds)

        for gold in gold_items:
            gold_title = (gold.get("task_title") or gold.get("title") or "").lower()
            gold_assignee = (gold.get("assignee") or "").lower()
            gold_deadline = (gold.get("deadline") or "").lower()

            best_match = None
            for p in parsed_preds:
                p_title = (p.get("task_title") or p.get("title") or "").lower()
                # Check keyword overlap
                overlap = len(set(gold_title.split()) & set(p_title.split()))
                if overlap >= 2 or gold_title in p_title or p_title in gold_title:
                    best_match = p
                    break

            if best_match:
                matched_tasks += 1
                p_assignee = (best_match.get("assignee") or "").lower()
                p_deadline = (best_match.get("deadline") or "").lower()
                if p_assignee and (p_assignee in gold_assignee or gold_assignee in p_assignee):
                    correct_assignees += 1
                if p_deadline and (p_deadline in gold_deadline or gold_deadline in p_deadline):
                    correct_deadlines += 1

    precision = round((matched_tasks / max(1, total_pred_tasks)) * 100, 2)
    recall = round((matched_tasks / max(1, total_gold_tasks)) * 100, 2)
    f1 = round((2 * precision * recall / max(0.001, precision + recall)), 2)
    assignee_acc = round((correct_assignees / max(1, matched_tasks)) * 100, 2)
    deadline_acc = round((correct_deadlines / max(1, matched_tasks)) * 100, 2)

    return {
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "assignee_accuracy": assignee_acc,
        "deadline_accuracy": deadline_acc,
        "total_gold_tasks": total_gold_tasks,
        "total_predicted_tasks": total_pred_tasks,
        "matched_tasks": matched_tasks
    }

def run_training():
    print("=" * 70)
    print("SYNAPSE ML: TRAINING MODEL 2 (ACTION ITEM & TASK EXTRACTOR)")
    print("=" * 70)

    model_cache = BASE_DIR / "models_cache" / "flan-t5-small"
    model_name = str(model_cache) if model_cache.exists() and (model_cache / "model.safetensors").exists() else "google/flan-t5-small"
    print(f"Loading Base Tokenizer & Model: {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    device = torch.device("cpu")
    model.to(device)

    train_file = PROCESSED_DIR / "action_items_train.json"
    val_file = PROCESSED_DIR / "action_items_val.json"
    test_file = PROCESSED_DIR / "action_items_test.json"

    train_dataset = ActionItemDataset(train_file, tokenizer)
    val_dataset = ActionItemDataset(val_file, tokenizer)
    test_dataset = ActionItemDataset(test_file, tokenizer)

    train_loader = DataLoader(train_dataset, batch_size=1, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=1, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=1, shuffle=False)

    print(f"Datasets: {len(train_dataset)} train, {len(val_dataset)} val, {len(test_dataset)} test")

    # 1. Pretrained Baseline Evaluation
    print("\n--- Evaluating Zero-Shot Baseline Performance ---")
    model.eval()
    baseline_preds = []
    gold_item_lists = [r["action_items"] for r in test_dataset.records]

    with torch.no_grad():
        for batch in test_loader:
            outputs = model.generate(
                input_ids=batch["input_ids"].to(device),
                attention_mask=batch["attention_mask"].to(device),
                max_length=260,
                num_beams=2,
                early_stopping=True
            )
            decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
            baseline_preds.append(decoded)

    baseline_metrics = evaluate_task_extraction(baseline_preds, gold_item_lists)
    print(f"Pretrained Zero-Shot Baseline: Precision = {baseline_metrics['precision']}%, Recall = {baseline_metrics['recall']}%, F1 = {baseline_metrics['f1_score']}%")

    # 2. Fine-Tuning Execution
    print("\n--- Executing Task Extractor Fine-Tuning (3 Epochs) ---")
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

        avg_train = epoch_loss / len(train_loader)

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
        avg_val = val_loss / max(1, len(val_loader))

        training_logs.append({
            "epoch": epoch,
            "train_loss": round(avg_train, 4),
            "val_loss": round(avg_val, 4)
        })
        print(f"-> Epoch {epoch} Done: Train Loss = {avg_train:.4f}, Val Loss = {avg_val:.4f}")

    total_training_time = round(time.time() - start_time, 2)
    print(f"\nTask Extractor Training Complete in {total_training_time} seconds!")

    # 3. Fine-Tuned Evaluation
    print("\n--- Evaluating Fine-Tuned Model on Test Split ---")
    model.eval()
    finetuned_preds = []

    with torch.no_grad():
        for batch in test_loader:
            outputs = model.generate(
                input_ids=batch["input_ids"].to(device),
                attention_mask=batch["attention_mask"].to(device),
                max_length=280,
                num_beams=2,
                early_stopping=True
            )
            decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
            finetuned_preds.append(decoded)

    finetuned_metrics = evaluate_task_extraction(finetuned_preds, gold_item_lists)
    print("\nTask Extractor Evaluation Results:")
    print(f"  Precision: {finetuned_metrics['precision']}% (Baseline: {baseline_metrics['precision']}%)")
    print(f"  Recall:    {finetuned_metrics['recall']}% (Baseline: {baseline_metrics['recall']}%)")
    print(f"  F1-Score:  {finetuned_metrics['f1_score']}% (Baseline: {baseline_metrics['f1_score']}%)")
    print(f"  Assignee Accuracy: {finetuned_metrics['assignee_accuracy']}%")
    print(f"  Deadline Accuracy: {finetuned_metrics['deadline_accuracy']}%")

    # 4. Save Checkpoint & Metrics
    print(f"\nSaving Task Extractor Checkpoint to {CHECKPOINT_DIR}...")
    model.save_pretrained(CHECKPOINT_DIR)
    tokenizer.save_pretrained(CHECKPOINT_DIR)

    metrics_payload = {
        "model_type": "FLAN-T5-small (Task & Action Extractor)",
        "base_model": model_name,
        "datasets": "AMI Meeting Corpus + Synthetic Meeting-to-Task",
        "training_time_seconds": total_training_time,
        "epochs": epochs,
        "training_logs": training_logs,
        "baseline_metrics": baseline_metrics,
        "finetuned_metrics": finetuned_metrics,
        "f1_improvement": round(finetuned_metrics["f1_score"] - baseline_metrics["f1_score"], 2),
        "sample_prediction": {
            "raw_input": test_dataset.records[0]["input_text"],
            "prediction": finetuned_preds[0]
        }
    }

    metrics_file = METRICS_DIR / "action_extractor_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"Metrics saved to {metrics_file}")

if __name__ == "__main__":
    run_training()
