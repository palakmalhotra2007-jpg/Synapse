# SYNAPSE REPOSITORY RESTRUCTURING PLAN
## Comprehensive Audit Results and Implementation Strategy

---

## EXECUTIVE SUMMARY

This plan restructures the Synapse repository following professional module-based organization while:
- **Preserving all required functionality** (ML models, inference engines, frontend, backend)
- **Removing unnecessary documentation** (READMEs, markdown guides, training notes)
- **Organizing ML modules by feature** (meeting analysis, fraud detection, facial recognition, RAG)
- **Maintaining Next.js strict conventions** (src/app/ structure must stay intact)
- **Using descriptive filenames** throughout the codebase
- **Removing demo/mock data** that bypasses real integrations

**CRITICAL**: Next.js 15 with App Router requires the `src/app/` directory structure to remain exactly as-is. Frontend files will NOT be moved, only backend and ML reorganization will occur.

---

## SECTION 1: FILES TO DELETE

### 1.1 Documentation Files (Unnecessary)

#### ML Documentation
- `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\README.md` 
  - Justification: Training/setup documentation not needed in production repository
- `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\QUICK_START.md`
  - Justification: Development guide unnecessary for production
- `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\DATASETS.md`
  - Justification: Dataset documentation can be inferred from code
- `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\SETUP_CHECKLIST.md`
  - Justification: Setup checklist not needed post-deployment

### 1.2 Jupyter Notebooks (Training Artifacts)
- `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\notebooks\Synapse_Document_Fraud_Training.ipynb`
  - Justification: Training notebook; final models already exist in fraud_checkpoints/

### 1.3 Training Scripts (Keep only if needed for retraining)
**Decision**: Keep all training scripts in a dedicated `training/` subfolder within each module, as they may be needed for model updates. Move them rather than delete.

### 1.4 Temporary/Cache Files
- All `__pycache__` directories (generated at runtime, should be in .gitignore)
- `.next/cache/` contents (Next.js build cache)
- `.venv/` directory (Python virtual environment, should not be committed)

---

## SECTION 2: FILES TO RENAME

### 2.1 ML Inference Files (Descriptive Names)

| Old Path | New Path | Reason |
|----------|----------|--------|
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\inference.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\source\meeting_analysis_inference_engine.py` | Generic name → Descriptive name indicating purpose |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\fraud_inference.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\source\document_fraud_detection_ensemble.py` | More descriptive, indicates ensemble architecture |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\fraud_ocr.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\optical_character_recognition\document_ocr_consistency_verifier.py` | Indicates OCR verification purpose |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\hybrid_rag.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\retrieval_augmented_generation\source\hybrid_multimodal_rag_engine.py` | More descriptive, indicates hybrid+multimodal nature |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_ingestion.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\retrieval_augmented_generation\document_ingestion\multimodal_document_ingestion_engine.py` | More descriptive, indicates multimodal support |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\data_analyzer.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\shared\utilities\tabular_data_analytical_engine.py` | More descriptive, indicates tabular data analysis |

### 2.2 Facial Recognition Module

| Old Path | New Path | Reason |
|----------|----------|--------|
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\inference.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\source\facial_biometric_inference_engine.py` | More descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\models_arch.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\source\neural_architecture_definitions.py` | More descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\preprocessing.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\utilities\face_preprocessing_pipeline.py` | More descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\train.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\training\facial_recognition_training_pipeline.py` | Move to training subfolder |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\export_datasets.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\training\dataset_export_utility.py` | Move to training subfolder |

### 2.3 Training Scripts Organization

| Old Path | New Path | Reason |
|----------|----------|--------|
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\scripts\train_summarizer.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\training\flan_t5_summarizer_training_pipeline.py` | Module-specific, descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\scripts\train_action_extractor.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\training\flan_t5_action_extractor_training_pipeline.py` | Module-specific, descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\scripts\train_fraud_classifier.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\training\resnet18_fraud_classifier_training_pipeline.py` | Module-specific, descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\scripts\train_tamper_localizer.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\training\unet_tamper_localizer_training_pipeline.py` | Module-specific, descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\fraud_data\prepare_fraud_dataset.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\training\fraud_dataset_preparation_script.py` | Module-specific, descriptive |

### 2.4 Model Download and Setup Scripts

| Old Path | New Path | Reason |
|----------|----------|--------|
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\download_models.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\scripts\download_synapse_ml_models.py` | Move to scripts folder, more descriptive |
| `c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\setup_ml.py` | `c:\Users\Pankaj Malhotra\Downloads\Synapse\scripts\setup_ml_environment.py` | Move to scripts folder, more descriptive |

---

## SECTION 3: FOLDERS TO CREATE

### 3.1 ML Module Structure

```
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\
├── meeting_analysis\
│   ├── source\                  # Core inference engines
│   ├── trained_models\          # Final FLAN-T5 checkpoints
│   ├── training\                # Training scripts
│   └── utilities\               # Shared utilities for meeting analysis
│
├── document_fraud_detection\
│   ├── source\                  # Core ensemble inference
│   ├── trained_models\          # Final fraud classifier & localizer
│   ├── training\                # Training scripts and dataset prep
│   ├── optical_character_recognition\  # OCR and consistency verification
│   └── utilities\               # Fraud-specific utilities
│
├── facial_recognition\
│   ├── source\                  # Core biometric engines
│   ├── trained_models\          # Final face recognition & anti-spoof models
│   ├── training\                # Training scripts
│   ├── datasets\                # Face datasets (if any remain after cleanup)
│   └── utilities\               # Face preprocessing utilities
│
├── retrieval_augmented_generation\
│   ├── source\                  # Hybrid RAG engine
│   ├── document_ingestion\      # Multimodal document ingestion
│   ├── embedding_generation\    # If needed (currently inline)
│   ├── semantic_retrieval\      # BM25 + Dense retrieval
│   └── utilities\               # RAG-specific utilities
│
└── shared\
    ├── configuration\           # Shared config files
    ├── model_loading\           # Common model loading utilities
    └── utilities\               # Truly shared utilities (data_analyzer)
```

### 3.2 Scripts Folder Organization

```
c:\Users\Pankaj Malhotra\Downloads\Synapse\scripts\
├── download_synapse_ml_models.py
├── setup_ml_environment.py
├── process_vtuber_asset.py
├── process_vtuber_with_sharp.js
├── run-tests.js
└── maintenance\                 # Future maintenance scripts
```

**NOTE**: Frontend structure (`src/`) will remain untouched as Next.js requires strict app router conventions.

---

## SECTION 4: FILES TO MOVE

### 4.1 Meeting Analysis Module

**Create directories:**
```
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\source\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\trained_models\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\training\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\utilities\
```

**Moves:**
1. RENAME `ml\inference.py` → MOVE to `ml\meeting_analysis\source\meeting_analysis_inference_engine.py`
2. MOVE `ml\checkpoints\flan_t5_summarizer\*` → `ml\meeting_analysis\trained_models\flan_t5_summarizer\*`
3. MOVE `ml\checkpoints\flan_t5_action_extractor\*` → `ml\meeting_analysis\trained_models\flan_t5_action_extractor\*`
4. RENAME `ml\scripts\train_summarizer.py` → MOVE to `ml\meeting_analysis\training\flan_t5_summarizer_training_pipeline.py`
5. RENAME `ml\scripts\train_action_extractor.py` → MOVE to `ml\meeting_analysis\training\flan_t5_action_extractor_training_pipeline.py`
6. MOVE `ml\scripts\evaluate_transcription.py` → `ml\meeting_analysis\training\transcription_evaluation_script.py`
7. MOVE `ml\scripts\download_base_model.py` → `ml\meeting_analysis\training\download_base_flan_t5_model.py`
8. MOVE `ml\scripts\fast_download_base_model.py` → `ml\meeting_analysis\training\fast_download_base_model.py`
9. MOVE `ml\scripts\download_cord.py` → `ml\meeting_analysis\training\download_cord_dataset.py`

### 4.2 Document Fraud Detection Module

**Create directories:**
```
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\source\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\trained_models\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\training\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\optical_character_recognition\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\utilities\
```

**Moves:**
1. RENAME `ml\fraud_inference.py` → MOVE to `ml\document_fraud_detection\source\document_fraud_detection_ensemble.py`
2. RENAME `ml\fraud_ocr.py` → MOVE to `ml\document_fraud_detection\optical_character_recognition\document_ocr_consistency_verifier.py`
3. MOVE `ml\fraud_checkpoints\*` → `ml\document_fraud_detection\trained_models\*`
4. RENAME `ml\scripts\train_fraud_classifier.py` → MOVE to `ml\document_fraud_detection\training\resnet18_fraud_classifier_training_pipeline.py`
5. RENAME `ml\scripts\train_tamper_localizer.py` → MOVE to `ml\document_fraud_detection\training\unet_tamper_localizer_training_pipeline.py`
6. RENAME `ml\fraud_data\prepare_fraud_dataset.py` → MOVE to `ml\document_fraud_detection\training\fraud_dataset_preparation_script.py`
7. DELETE `ml\fraud_data\` directory after moving file

### 4.3 Facial Recognition Module

**Create directories:**
```
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\source\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\trained_models\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\training\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\utilities\
```

**Moves:**
1. RENAME `ml\facial_recognition\inference.py` → MOVE to `ml\facial_recognition\source\facial_biometric_inference_engine.py`
2. RENAME `ml\facial_recognition\models_arch.py` → MOVE to `ml\facial_recognition\source\neural_architecture_definitions.py`
3. RENAME `ml\facial_recognition\preprocessing.py` → MOVE to `ml\facial_recognition\utilities\face_preprocessing_pipeline.py`
4. RENAME `ml\facial_recognition\train.py` → MOVE to `ml\facial_recognition\training\facial_recognition_training_pipeline.py`
5. RENAME `ml\facial_recognition\export_datasets.py` → MOVE to `ml\facial_recognition\training\dataset_export_utility.py`
6. MOVE `ml\facial_recognition\models\*` → `ml\facial_recognition\trained_models\*`
7. DELETE `ml\facial_recognition\models\` directory after moving files
8. KEEP `ml\facial_recognition\datasets\` (may contain required datasets)

### 4.4 RAG Module

**Create directories:**
```
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\retrieval_augmented_generation\source\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\retrieval_augmented_generation\document_ingestion\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\retrieval_augmented_generation\utilities\
```

**Moves:**
1. RENAME `ml\hybrid_rag.py` → MOVE to `ml\retrieval_augmented_generation\source\hybrid_multimodal_rag_engine.py`
2. RENAME `ml\document_ingestion.py` → MOVE to `ml\retrieval_augmented_generation\document_ingestion\multimodal_document_ingestion_engine.py`

### 4.5 Shared Utilities

**Create directories:**
```
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\shared\utilities\
c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\shared\configuration\
```

**Moves:**
1. RENAME `ml\data_analyzer.py` → MOVE to `ml\shared\utilities\tabular_data_analytical_engine.py`
2. MOVE `ml\requirements.txt` → `ml\shared\configuration\requirements.txt`

### 4.6 Scripts Folder

**Moves:**
1. RENAME `ml\download_models.py` → MOVE to `scripts\download_synapse_ml_models.py`
2. RENAME `ml\setup_ml.py` → MOVE to `scripts\setup_ml_environment.py`
3. DELETE `ml\scripts\` directory after moving all files to appropriate module training folders

---

## SECTION 5: IMPORTS/REFERENCES TO UPDATE

### 5.1 API Server (api_server.py)

**File:** `c:\Users\Pankaj Malhotra\Downloads\Synapse\api_server.py`

| Line(s) | Old Import | New Import | Reason |
|---------|------------|------------|--------|
| 27-29 | `from ml.fraud_inference import FraudDetectionEnsemble` | `from ml.document_fraud_detection.source.document_fraud_detection_ensemble import FraudDetectionEnsemble` | File moved and renamed |
| 30 | `from ml.facial_recognition.inference import get_biometric_engine` | `from ml.facial_recognition.source.facial_biometric_inference_engine import get_biometric_engine` | File moved and renamed |
| 31 | `from ml.document_ingestion import DocumentIngestionEngine` | `from ml.retrieval_augmented_generation.document_ingestion.multimodal_document_ingestion_engine import DocumentIngestionEngine` | File moved and renamed |
| 32 | `from ml.hybrid_rag import get_rag_engine` | `from ml.retrieval_augmented_generation.source.hybrid_multimodal_rag_engine import get_rag_engine` | File moved and renamed |
| 33 | `from ml.data_analyzer import TabularDataAnalyzer` | `from ml.shared.utilities.tabular_data_analytical_engine import TabularDataAnalyzer` | File moved and renamed |

### 5.2 Meeting Analysis Module

**File:** `ml\meeting_analysis\source\meeting_analysis_inference_engine.py` (renamed from inference.py)

**Internal imports:** Should use relative imports within the module:
```python
# No changes needed - file is self-contained
```

**Model checkpoint paths:**
| Old Path String | New Path String | Line Reference |
|-----------------|-----------------|----------------|
| `BASE_DIR / "checkpoints" / "flan_t5_summarizer"` | `BASE_DIR.parent / "trained_models" / "flan_t5_summarizer"` | Around line 15-16 |
| `BASE_DIR / "checkpoints" / "flan_t5_action_extractor"` | `BASE_DIR.parent / "trained_models" / "flan_t5_action_extractor"` | Around line 17 |

### 5.3 Document Fraud Detection Module

**File:** `ml\document_fraud_detection\source\document_fraud_detection_ensemble.py` (renamed from fraud_inference.py)

| Old Import | New Import | Line Reference |
|------------|------------|----------------|
| `from ml.fraud_ocr import DocumentOCRVerifier` | `from ml.document_fraud_detection.optical_character_recognition.document_ocr_consistency_verifier import DocumentOCRVerifier` | Around line 37-39 |
| `from fraud_ocr import DocumentOCRVerifier` | `from ..optical_character_recognition.document_ocr_consistency_verifier import DocumentOCRVerifier` | Around line 37-39 |

**Model checkpoint paths:**
| Old Path String | New Path String | Line Reference |
|-----------------|-----------------|----------------|
| `CHECKPOINT_DIR = os.path.join(BASE_DIR, "fraud_checkpoints")` | `CHECKPOINT_DIR = os.path.join(BASE_DIR, "..", "trained_models")` | Around line 40 |
| `CLASSIFIER_CKPT = os.path.join(CHECKPOINT_DIR, "fraud_classifier_best.pt")` | (No change, relative path works) | Line 41 |
| `LOCALIZER_CKPT = os.path.join(CHECKPOINT_DIR, "tamper_localizer_best.pt")` | (No change, relative path works) | Line 42 |

### 5.4 Facial Recognition Module

**File:** `ml\facial_recognition\source\facial_biometric_inference_engine.py` (renamed from inference.py)

| Old Import | New Import | Line Reference |
|------------|------------|----------------|
| `from .preprocessing import FacePreprocessor` | `from ..utilities.face_preprocessing_pipeline import FacePreprocessor` | Around line 12 |
| `from .models_arch import AntiSpoofNet, FaceEmbeddingNet` | `from .neural_architecture_definitions import AntiSpoofNet, FaceEmbeddingNet` | Around line 13 |
| `from preprocessing import FacePreprocessor` | `from ml.facial_recognition.utilities.face_preprocessing_pipeline import FacePreprocessor` | Around line 15 |
| `from models_arch import AntiSpoofNet, FaceEmbeddingNet` | `from ml.facial_recognition.source.neural_architecture_definitions import AntiSpoofNet, FaceEmbeddingNet` | Around line 16 |

**Model paths:**
| Old Path String | New Path String | Line Reference |
|-----------------|-----------------|----------------|
| `MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")` | `MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "trained_models")` | Around line 18 |

### 5.5 RAG Module

**File:** `ml\retrieval_augmented_generation\source\hybrid_multimodal_rag_engine.py` (renamed from hybrid_rag.py)

No import changes needed - self-contained module.

**File:** `ml\retrieval_augmented_generation\document_ingestion\multimodal_document_ingestion_engine.py` (renamed from document_ingestion.py)

No import changes needed - self-contained module.

### 5.6 Frontend API Routes

**File:** `src\app\api\meetings\route.ts`

**Expected API call to Python backend:** Check if it references model paths
- Review needed: May call `/api/meetings/transcript-fetcher` which then calls Python backend
- No direct Python imports in TypeScript files

**File:** `src\app\api\fraud\route.ts`

**Expected API call to Python backend:**
- May need to verify FastAPI endpoint paths remain consistent

### 5.7 Training Scripts Import Updates

Each training script that was moved will need to update its imports to reference the new module structure:

**Example for** `ml\meeting_analysis\training\flan_t5_summarizer_training_pipeline.py`:
| Old Import | New Import |
|------------|------------|
| `from ml.inference import MeetingAnalyserInference` (if exists) | `from ml.meeting_analysis.source.meeting_analysis_inference_engine import MeetingAnalyserInference` |

**Example for** `ml\document_fraud_detection\training\resnet18_fraud_classifier_training_pipeline.py`:
| Old Import | New Import |
|------------|------------|
| `from ml.fraud_inference import DocumentFraudClassifier` (if exists) | `from ml.document_fraud_detection.source.document_fraud_detection_ensemble import DocumentFraudClassifier` |

---

## SECTION 6: DEMO DATA TO REMOVE

### 6.1 Mock Data Files

**DO NOT DELETE THESE FILES** - They contain demo accounts for Charvi and Anshika which are legitimate demo users per requirements.

However, **REDUCE CONTENT** in mock data files to only essential demo records:

#### 6.1.1 Meetings Mock Data
**File:** `src\lib\mockData\meetings.ts`

**Action:** REDUCE (not remove) - Keep only 2-3 sample meetings
- Keep: Sample participants (Charvi, Anshika, Tanisha, Bhavya) - these are legitimate demo users
- Keep: 2-3 recent meeting samples for UI demo purposes
- Remove: Excessive historical meeting records (keep max 3)

**Rationale:** UI needs some demo data for initial load before real meetings are created, but dozens of fake meetings should be reduced.

#### 6.1.2 Documents Mock Data
**File:** `src\lib\mockData\documents.ts`

**Action:** REDUCE (not remove) - Keep only 2-3 sample documents
- Keep: 2-3 representative document samples for UI demo
- Remove: Excessive fake documents (keep max 3)

**Rationale:** Same as meetings - UI needs initial demo state.

#### 6.1.3 Transactions Mock Data
**File:** `src\lib\mockData\transactions.ts`

**Action:** REDUCE (not remove) - Keep only 2-3 sample transactions
- Keep: 2-3 representative transaction samples
- Remove: Excessive fake transactions (keep max 3)

#### 6.1.4 Dashboard Mock Data
**File:** `src\lib\mockData\dashboard.ts`

**Action:** REDUCE (not remove) - Keep minimal dashboard state
- Keep: Basic dashboard structure
- Reduce: Hardcoded metrics to minimal demo values

### 6.2 Hardcoded Demo Data in Pages

#### 6.2.1 Meetings Page
**File:** `src\app\meetings\page.tsx`

**Lines to review:** Check for any hardcoded meeting data that bypasses API calls
- **Action:** Ensure all meeting data loads from API routes or localStorage, not hardcoded arrays
- **Review:** Lines that initialize state with mock data should be flagged

#### 6.2.2 Fraud Page
**File:** `src\app\fraud\page.tsx`

**Lines to review:** Check for any hardcoded fraud analysis results
- **Action:** Ensure all fraud results come from actual API server (api_server.py), not mock responses
- **Review:** Any hardcoded `DocumentFraudReport` objects should be removed

#### 6.2.3 Documents Page
**File:** `src\app\documents\page.tsx`

**Lines to review:** Check for any hardcoded document arrays
- **Action:** Ensure documents load from real API or database, not hardcoded arrays
- **Review:** Initial state should be empty array, populated by API

#### 6.2.4 Employees Page
**File:** `src\app\employees\page.tsx`

**Lines to review:** Check for hardcoded employee data beyond the legitimate demo users
- **Action:** Keep Charvi, Anshika, Tanisha, Bhavya as they are intended demo accounts
- **Review:** Any additional fake employees should be removed

### 6.3 API Route Mock Responses

#### 6.3.1 Meetings API Route
**File:** `src\app\api\meetings\route.ts`

**Review:** Ensure it doesn't return hardcoded mock meeting arrays
- If it returns mock data, replace with empty array or database query

#### 6.3.2 Documents API Route
**File:** `src\app\api\documents\route.ts`

**Review:** Ensure it doesn't return hardcoded mock document arrays
- If it returns mock data, replace with empty array or database query

### 6.4 Users Database

**File:** `src\lib\auth\usersDb.ts`

**Action:** KEEP AS-IS - This contains the legitimate demo users (Charvi, Anshika group)
- These are the intended demo accounts per requirements
- DO NOT REMOVE

---

## SECTION 7: EXECUTION ORDER (Safe Sequence)

### Phase 1: Preparation & Backup (Manual)
1. **Commit current state** to git before any changes
2. **Create backup** of entire repository
3. **Verify all tests pass** in current state

### Phase 2: Create New Directory Structure
1. Create all module directories under `ml/`:
   - `ml/meeting_analysis/source/`
   - `ml/meeting_analysis/trained_models/`
   - `ml/meeting_analysis/training/`
   - `ml/document_fraud_detection/source/`
   - `ml/document_fraud_detection/trained_models/`
   - `ml/document_fraud_detection/training/`
   - `ml/document_fraud_detection/optical_character_recognition/`
   - `ml/facial_recognition/source/`
   - `ml/facial_recognition/trained_models/`
   - `ml/facial_recognition/training/`
   - `ml/facial_recognition/utilities/`
   - `ml/retrieval_augmented_generation/source/`
   - `ml/retrieval_augmented_generation/document_ingestion/`
   - `ml/shared/utilities/`
   - `ml/shared/configuration/`

2. Create `scripts/` directory at root if it doesn't exist

### Phase 3: Move Model Checkpoints (No Code Changes)
**Order:** Model files first (no import dependencies)

1. Move `ml/checkpoints/flan_t5_summarizer/*` → `ml/meeting_analysis/trained_models/flan_t5_summarizer/`
2. Move `ml/checkpoints/flan_t5_action_extractor/*` → `ml/meeting_analysis/trained_models/flan_t5_action_extractor/`
3. Move `ml/fraud_checkpoints/*` → `ml/document_fraud_detection/trained_models/`
4. Move `ml/facial_recognition/models/*` → `ml/facial_recognition/trained_models/`
5. Delete empty `ml/checkpoints/`, `ml/fraud_checkpoints/`, `ml/facial_recognition/models/` directories

### Phase 4: Move and Rename Core Inference Files (WITH Import Updates)

**Important:** Each file must be updated with new imports BEFORE or IMMEDIATELY AFTER moving.

#### 4.1 Meeting Analysis
1. **COPY** `ml/inference.py` → `ml/meeting_analysis/source/meeting_analysis_inference_engine.py`
2. **UPDATE imports** in `meeting_analysis_inference_engine.py`:
   - Update checkpoint paths from `BASE_DIR / "checkpoints"` to `BASE_DIR.parent / "trained_models"`
3. **VERIFY** file can be imported: `python -c "from ml.meeting_analysis.source.meeting_analysis_inference_engine import MeetingAnalyserInference"`
4. **DELETE** `ml/inference.py` only after verification succeeds

#### 4.2 Document Fraud Detection
1. **COPY** `ml/fraud_inference.py` → `ml/document_fraud_detection/source/document_fraud_detection_ensemble.py`
2. **UPDATE imports** in `document_fraud_detection_ensemble.py`:
   - Change `from ml.fraud_ocr import` to relative import (will update after fraud_ocr moves)
   - Update checkpoint directory from `"fraud_checkpoints"` to `"../trained_models"`
3. **COPY** `ml/fraud_ocr.py` → `ml/document_fraud_detection/optical_character_recognition/document_ocr_consistency_verifier.py`
4. **UPDATE import** in `document_fraud_detection_ensemble.py` to reference new location
5. **VERIFY** both files can be imported
6. **DELETE** `ml/fraud_inference.py` and `ml/fraud_ocr.py` after verification

#### 4.3 Facial Recognition
1. **COPY** `ml/facial_recognition/preprocessing.py` → `ml/facial_recognition/utilities/face_preprocessing_pipeline.py`
2. **COPY** `ml/facial_recognition/models_arch.py` → `ml/facial_recognition/source/neural_architecture_definitions.py`
3. **COPY** `ml/facial_recognition/inference.py` → `ml/facial_recognition/source/facial_biometric_inference_engine.py`
4. **UPDATE imports** in `facial_biometric_inference_engine.py`:
   - `from .preprocessing` → `from ..utilities.face_preprocessing_pipeline`
   - `from .models_arch` → `from .neural_architecture_definitions`
   - Update `MODELS_DIR` from `"models"` to `"../trained_models"`
5. **VERIFY** imports work
6. **DELETE** original files after verification

#### 4.4 RAG Module
1. **COPY** `ml/hybrid_rag.py` → `ml/retrieval_augmented_generation/source/hybrid_multimodal_rag_engine.py`
2. **VERIFY** import works (self-contained)
3. **DELETE** `ml/hybrid_rag.py`
4. **COPY** `ml/document_ingestion.py` → `ml/retrieval_augmented_generation/document_ingestion/multimodal_document_ingestion_engine.py`
5. **VERIFY** import works (self-contained)
6. **DELETE** `ml/document_ingestion.py`

#### 4.5 Shared Utilities
1. **COPY** `ml/data_analyzer.py` → `ml/shared/utilities/tabular_data_analytical_engine.py`
2. **VERIFY** import works
3. **DELETE** `ml/data_analyzer.py`

### Phase 5: Update API Server Imports

**File:** `api_server.py`

1. **UPDATE** all imports to reference new module paths (see Section 5.1)
2. **VERIFY** API server can start: `python api_server.py`
3. **TEST** health endpoint: `curl http://localhost:8000/health`

### Phase 6: Move Training Scripts

**Order:** Training scripts are independent of each other

1. Move and rename training scripts to respective module `/training/` folders (see Section 2.3)
2. Update imports within each training script to reference new source paths
3. **DO NOT TEST** training scripts (they require datasets and are not part of inference)

### Phase 7: Move Utility Scripts

1. Move `ml/download_models.py` → `scripts/download_synapse_ml_models.py`
2. Update any hardcoded paths inside the script
3. Move `ml/setup_ml.py` → `scripts/setup_ml_environment.py`
4. Update any hardcoded paths inside the script

### Phase 8: Delete Documentation Files

**Safe to delete - no code dependencies:**

1. Delete `ml/README.md`
2. Delete `ml/QUICK_START.md`
3. Delete `ml/DATASETS.md`
4. Delete `ml/SETUP_CHECKLIST.md`
5. Delete `ml/notebooks/Synapse_Document_Fraud_Training.ipynb`

### Phase 9: Reduce Mock Data (Manual Review Required)

**Files to manually edit:**

1. `src/lib/mockData/meetings.ts` - Keep only 2-3 sample meetings
2. `src/lib/mockData/documents.ts` - Keep only 2-3 sample documents
3. `src/lib/mockData/transactions.ts` - Keep only 2-3 sample transactions
4. `src/lib/mockData/dashboard.ts` - Reduce to minimal demo state

**Pages to review for hardcoded data:**

1. `src/app/meetings/page.tsx` - Ensure API integration is primary data source
2. `src/app/fraud/page.tsx` - Ensure API integration is primary data source
3. `src/app/documents/page.tsx` - Ensure API integration is primary data source
4. `src/app/employees/page.tsx` - Verify only legitimate demo users remain

### Phase 10: Clean Up Empty Directories

1. Delete `ml/checkpoints/` (should be empty)
2. Delete `ml/fraud_checkpoints/` (should be empty)
3. Delete `ml/fraud_data/` (should be empty)
4. Delete `ml/scripts/` (should be empty)
5. Delete `ml/notebooks/` (should be empty after notebook deletion)

### Phase 11: Update .gitignore

**Add or verify these entries exist:**

```
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
.venv/
venv/
ENV/
env/
.next/
.cache/
node_modules/
.DS_Store
*.log
```

### Phase 12: Final Verification

1. **Start API server:** `python api_server.py`
2. **Verify health check:** `curl http://localhost:8000/health`
3. **Test fraud prediction endpoint:** `curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d '{"document_id":"TEST","document_title":"test.pdf","content_text":"INVOICE"}'`
4. **Start Next.js dev server:** `npm run dev`
5. **Verify all pages load:** Open browser and check each route
6. **Run tests:** `npm test` or `npm run pr-check:quick` (if tests exist)

---

## SECTION 8: VERIFICATION STEPS FOR EACH PHASE

### Phase 2 Verification: Directory Structure
**Command:**
```powershell
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\source"
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\source"
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\source"
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\retrieval_augmented_generation\source"
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\shared\utilities"
```
**Expected:** All return `True`

### Phase 3 Verification: Model Checkpoints
**Command:**
```powershell
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\meeting_analysis\trained_models\flan_t5_summarizer\model.safetensors"
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\document_fraud_detection\trained_models\fraud_classifier_best.pt"
Test-Path "c:\Users\Pankaj Malhotra\Downloads\Synapse\ml\facial_recognition\trained_models\face_recognition_model.pt"
```
**Expected:** All return `True`

### Phase 4 Verification: Python Import Tests
**Command:**
```bash
cd "c:\Users\Pankaj Malhotra\Downloads\Synapse"
python -c "from ml.meeting_analysis.source.meeting_analysis_inference_engine import MeetingAnalyserInference; print('✓ Meeting Analysis OK')"
python -c "from ml.document_fraud_detection.source.document_fraud_detection_ensemble import FraudDetectionEnsemble; print('✓ Fraud Detection OK')"
python -c "from ml.facial_recognition.source.facial_biometric_inference_engine import FaceBiometricEngine; print('✓ Facial Recognition OK')"
python -c "from ml.retrieval_augmented_generation.source.hybrid_multimodal_rag_engine import HybridRAGEngine; print('✓ RAG Engine OK')"
python -c "from ml.shared.utilities.tabular_data_analytical_engine import TabularDataAnalyzer; print('✓ Data Analyzer OK')"
```
**Expected:** All imports succeed with ✓ messages

### Phase 5 Verification: API Server
**Command:**
```bash
cd "c:\Users\Pankaj Malhotra\Downloads\Synapse"
python api_server.py &
sleep 5
curl http://localhost:8000/health
```
**Expected:** JSON response with `"status": "HEALTHY"`

### Phase 9 Verification: Mock Data Reduction
**Manual review:**
1. Open `src/lib/mockData/meetings.ts` - count array length, should be ≤ 3
2. Open `src/lib/mockData/documents.ts` - count array length, should be ≤ 3
3. Open `src/lib/mockData/transactions.ts` - count array length, should be ≤ 3

### Phase 12 Verification: Full System
**Commands:**
```bash
# Terminal 1: Start API server
cd "c:\Users\Pankaj Malhotra\Downloads\Synapse"
python api_server.py

# Terminal 2: Start Next.js
cd "c:\Users\Pankaj Malhotra\Downloads\Synapse"
npm run dev

# Terminal 3: Test endpoints
curl http://localhost:8000/health
curl http://localhost:3000/
```

**Browser tests:**
1. Open http://localhost:3000
2. Navigate to /meetings - should load
3. Navigate to /fraud - should load
4. Navigate to /documents - should load
5. Navigate to /employees - should load
6. Navigate to /workspace - should load

**Expected:** All pages load without console errors, all API calls succeed

---

## CRITICAL NOTES

### Next.js Directory Structure
**DO NOT MOVE OR RENAME:**
- `src/app/` directory
- `src/components/` directory
- `src/lib/` directory
- `src/types/` directory
- Any file within `src/` that Next.js requires for routing

**Reason:** Next.js 15 App Router has strict conventions for file-based routing. Moving these files will break the entire frontend.

### Python Path Resolution
After moving Python files, ensure `sys.path` modifications in `api_server.py` still allow imports. The current structure adds:
- `BASE_DIR` (repository root)
- `ML_DIR` (ml/ folder)
- `FR_DIR` (facial_recognition/ folder)

These may need adjustment if import issues arise.

### Model Checkpoint Paths
All model loading code references relative paths. After moving models to `trained_models/` subfolders, verify:
- `ml/meeting_analysis/source/` correctly finds `../trained_models/`
- `ml/document_fraud_detection/source/` correctly finds `../trained_models/`
- `ml/facial_recognition/source/` correctly finds `../trained_models/`

### Training Scripts
Training scripts are moved but NOT tested in this plan. They are preserved for future model retraining but are not part of the production inference flow.

### Demo Users (KEEP)
Per requirements, Charvi and Anshika are legitimate demo users. Their data in `src/lib/auth/usersDb.ts` and references in mock data should be preserved.

---

## ROLLBACK PLAN

If any phase fails:

1. **Restore from git:** `git reset --hard HEAD`
2. **Restore from backup:** Copy entire backup folder back
3. **Incremental rollback:** Undo changes in reverse order of execution
4. **Verify rollback:** Run original verification commands to confirm working state

---

## POST-RESTRUCTURING TASKS

1. **Update documentation** (if creating new docs outside repo):
   - New module structure
   - Import paths
   - Model locations

2. **Update CI/CD** (if exists):
   - Build scripts referencing old paths
   - Test scripts referencing old imports
   - Deployment scripts referencing old structure

3. **Update team documentation:**
   - Onboarding guides
   - Development setup instructions
   - Training/retraining procedures

---

## COMPLETION CHECKLIST

- [ ] Phase 1: Backup completed
- [ ] Phase 2: Directory structure created and verified
- [ ] Phase 3: Model checkpoints moved and verified
- [ ] Phase 4: Inference files moved, renamed, and imports updated
- [ ] Phase 5: API server updated and tested
- [ ] Phase 6: Training scripts moved
- [ ] Phase 7: Utility scripts moved
- [ ] Phase 8: Documentation deleted
- [ ] Phase 9: Mock data reduced
- [ ] Phase 10: Empty directories removed
- [ ] Phase 11: .gitignore updated
- [ ] Phase 12: Full system verification passed
- [ ] All API endpoints respond correctly
- [ ] All Next.js pages load without errors
- [ ] Python imports all succeed
- [ ] Model loading works in all modules
- [ ] Git commit of final restructured state

---

**END OF RESTRUCTURING PLAN**
