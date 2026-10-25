# Implementation Plan: Integrate Google Gemini Vision API for Real Image Analysis

## Problem Statement
The Synapse Vision Engine at `src/lib/ai/visionEngine.ts` currently returns hardcoded mock data for every uploaded image, regardless of the actual image content. Users report identical output for all manually uploaded images. This plan integrates the Google Gemini Vision API (1.5 Flash multimodal) to perform real image analysis for each upload.

## Context & Discovery
- **Existing API Helper**: `src/lib/ai/synapseEngine.ts` has a working `callGeminiApi(prompt, systemInstruction)` function that successfully calls the Gemini 1.5 Flash text-only endpoint using `process.env.GEMINI_API_KEY` or `process.env.NEXT_PUBLIC_GEMINI_API_KEY`.
- **Current Vision Engine**: `src/lib/ai/visionEngine.ts` exports `SynapseVisionEngine` class with three static methods: `analyzeImage()`, `analyzeChart()`, and `detectSimilarImages()`. All return mock data with no actual API calls.
- **Image Upload Flow**: Users upload images via `src/components/vision/ImageVisionModal.tsx` and `src/components/workspace/UnifiedAIChatModal.tsx`. Both use `FileReader.readAsDataURL()` to convert uploaded files to base64 data URLs (format: `data:image/png;base64,iVBORw0KG...`).
- **Current Signatures**: Vision engine methods accept `fileName: string` and optional `imagePreviewUrl?: string` (unused), plus `userPrompt?: string` in `analyzeImage()`. They do NOT currently receive actual image data.
- **Project Build**: Next.js 14 TypeScript project. Build command: `npm run build`. Test command: `npm test` (runs `scripts/run-tests.js`). No existing vision API tests.
- **API Endpoint Format**: Gemini multimodal endpoint requires `parts` array with both `inline_data: { mime_type, data }` (base64 without prefix) and `text` prompt objects.

## Design Decision: Multimodal Vision API Integration Architecture

**Decision 1: Create a dedicated `callGeminiVisionApi()` helper**  
_Rationale_: The existing `callGeminiApi()` only handles text prompts. Vision analysis requires sending `inline_data` with base64 image bytes plus MIME type. A separate helper keeps the API integration clean and maintains backward compatibility.

**Decision 2: Accept base64 data strings (with or without data URL prefix) in vision methods**  
_Rationale_: Upload components produce `data:image/png;base64,XXX` format. The helper will strip the prefix if present, then send clean base64 to the API. This handles both direct base64 and data URLs without breaking existing callers.

**Decision 3: Map free-text Gemini responses back to structured TypeScript interfaces**  
_Rationale_: The vision engine returns typed responses (`ImageKnowledgeResponse`, `ChartAnalysisResult`). The API returns free-text. We'll use carefully crafted prompts requesting structured output (e.g., "List each component as: Name | Category | Confidence | Description") then parse the response back to our types. This preserves the existing UI contract.

**Decision 4: Graceful fallback when API is unavailable**  
_Rationale_: If `GEMINI_API_KEY` is missing or the API call fails, return a response with `visualComponents: []` and a clear `aiReasoning` message like "Real-time vision analysis unavailable. Please configure GEMINI_API_KEY." This prevents breaking the UI and informs users clearly—no fake data.

**Decision 5: Update method signatures to require imageData parameter**  
_Rationale_: Current signatures have `imagePreviewUrl?: string` (unused). We'll add a required `imageData: string` parameter (base64 or data URL) and a required `mimeType: string` parameter. The `fileName` remains for logging/context. This is a breaking change but necessary—the methods cannot work without actual image bytes.

---

# Implementation Plan

- [ ] 1. Create `callGeminiVisionApi()` helper function in `src/lib/ai/synapseEngine.ts` that accepts base64 image data, MIME type, and text prompt, then POSTs to Gemini 1.5 Flash multimodal endpoint with `inline_data` and returns the response text or null on failure.  
      **Files**: `src/lib/ai/synapseEngine.ts`  
      **Verify**: Run `npm run build` — TypeScript compilation succeeds with no errors.

- [ ] 2. Update `SynapseVisionEngine.analyzeImage()` signature in `src/lib/ai/visionEngine.ts` to accept `imageData: string` (base64 or data URL) and `mimeType: string` as required parameters. Strip data URL prefix if present, call `callGeminiVisionApi()` with a component identification prompt (e.g., "Identify all visible components, circuits, or structural elements. For each, provide: Name | Category | Confidence (0-100) | Description"), parse the response into `DetectedVisualComponent[]`, and return `ImageKnowledgeResponse`. If API key is missing or call fails, return a response with empty `visualComponents` array and `aiReasoning` stating "Real-time vision analysis unavailable. Configure GEMINI_API_KEY to enable live image understanding."  
      **Files**: `src/lib/ai/visionEngine.ts`  
      **Verify**: Run `npm run build` — TypeScript compilation succeeds.

- [ ] 3. Update `SynapseVisionEngine.analyzeChart()` signature in `src/lib/ai/visionEngine.ts` to accept `imageData: string` and `mimeType: string`. Strip data URL prefix, call `callGeminiVisionApi()` with a chart extraction prompt (e.g., "This is a chart/graph. Extract: chart type, title, axis labels, and all numeric data points with labels. Format as: Label | Value | Change%"). Parse the response into `ChartAnalysisResult` structure. On failure or missing API key, return a `ChartAnalysisResult` with `executiveSummary: "Chart analysis unavailable without GEMINI_API_KEY."` and empty `extractedMetrics`.  
      **Files**: `src/lib/ai/visionEngine.ts`  
      **Verify**: Run `npm run build` — TypeScript compilation succeeds.

- [ ] 4. Update `SynapseVisionEngine.detectSimilarImages()` signature in `src/lib/ai/visionEngine.ts` to accept `imageData: string` and `mimeType: string`. For now, this method returns a message stating "Perceptual hashing and duplicate detection require vector database integration (future enhancement)." The method signature changes for consistency but does not call the vision API yet (duplicate detection needs image embeddings, not available in Gemini 1.5 Flash multimodal content generation endpoint).  
      **Files**: `src/lib/ai/visionEngine.ts`  
      **Verify**: Run `npm run build` — TypeScript compilation succeeds.

- [ ] 5. Update `src/components/vision/ImageVisionModal.tsx` to pass actual base64 image data and MIME type to vision engine methods. Extract MIME type from the data URL prefix (e.g., `data:image/png;base64,XXX` → `image/png`). Pass `imageData: selectedImageUrl` (the base64 data URL) and `mimeType` to `SynapseVisionEngine.analyzeImage()`, `.analyzeChart()`, and `.detectSimilarImages()`.  
      **Files**: `src/components/vision/ImageVisionModal.tsx`  
      **Verify**: Run `npm run build` — TypeScript compilation succeeds. Manually test the modal: upload a real image, click "Run Deep Learning Visual Component Identification", confirm the response reflects actual image content (not hardcoded FPGA components).

- [ ] 6. Update `src/components/workspace/UnifiedAIChatModal.tsx` to pass actual base64 image data and MIME type when invoking vision analysis in the unified chat interface. Extract MIME type from data URL, pass `imageData` and `mimeType` to vision engine methods.  
      **Files**: `src/components/workspace/UnifiedAIChatModal.tsx`  
      **Verify**: Run `npm run build` — TypeScript compilation succeeds. Manually test: upload an image in the unified chat modal, ask a vision question, confirm response is based on actual image.

- [ ] 7. Update the vision integration in `src/lib/ai/synapseEngine.ts` `generateChatResponse()` method (around line 80-100, the `isVisionQuery` block) to pass actual image data when calling `SynapseVisionEngine.analyzeImage()`. Currently it calls `analyzeImage(fileName, userPrompt)`. Change to extract base64 and MIME type from the first attached document if it's an image type, then call `analyzeImage(fileName, userPrompt, imageData, mimeType)`.  
      **Files**: `src/lib/ai/synapseEngine.ts`  
      **Verify**: Run `npm run build` — TypeScript compilation succeeds.

- [ ] 8. Add a new test case in `scripts/run-tests.js` that verifies the vision API helper returns null when `GEMINI_API_KEY` is unset, and that the vision engine methods return graceful fallback messages. Test the happy path by mocking a small base64 image string and confirming `callGeminiVisionApi()` constructs the correct JSON payload structure (test the payload shape, not the actual API call to avoid network dependencies in CI).  
      **Files**: `scripts/run-tests.js`  
      **Verify**: Run `npm test` — new test cases pass.

- [ ] 9. Document the new environment variable requirement in the project README or a `.env.example` file. Add `GEMINI_API_KEY=your_google_api_key_here` with a comment explaining it enables real-time multimodal vision analysis.  
      **Files**: Create or update `.env.example` (if it doesn't exist, create it in the workspace root).  
      **Verify**: Read `.env.example` and confirm the `GEMINI_API_KEY` entry is present with a clear explanation.

- [ ] 10. Run full project build and manual end-to-end test: Set `GEMINI_API_KEY` in environment, start dev server (`npm run dev`), upload a real image (not a preset SVG) via the Vision Modal, run analysis, and confirm the output describes the actual uploaded image content instead of hardcoded FPGA/chart data.  
      **Files**: None (integration verification step).  
      **Verify**: Dev server runs without errors. Uploaded images return unique, context-aware analysis. Build completes with `npm run build` exit code 0.

---

## Interface Changes Required

### New Function
```typescript
// In src/lib/ai/synapseEngine.ts
export async function callGeminiVisionApi(
  imageData: string,        // base64 string or data URL
  mimeType: string,          // e.g., 'image/png', 'image/jpeg'
  prompt: string
): Promise<string | null>
```

### Updated Method Signatures
```typescript
// In src/lib/ai/visionEngine.ts
static async analyzeImage(
  fileName: string,
  userPrompt: string,
  imageData: string,         // NEW: required base64 or data URL
  mimeType: string           // NEW: required MIME type
): Promise<ImageKnowledgeResponse>

static async analyzeChart(
  fileName: string,
  imageData: string,         // NEW: required base64 or data URL
  mimeType: string           // NEW: required MIME type
): Promise<ImageKnowledgeResponse>

static async detectSimilarImages(
  fileName: string,
  imageData: string,         // NEW: required base64 or data URL
  mimeType: string           // NEW: required MIME type
): Promise<ImageKnowledgeResponse>
```

### Caller Updates
All callers of the three vision methods must be updated to pass the new `imageData` and `mimeType` parameters:
- `src/components/vision/ImageVisionModal.tsx` (3 call sites)
- `src/components/workspace/UnifiedAIChatModal.tsx` (3 call sites)
- `src/lib/ai/synapseEngine.ts` in `generateChatResponse()` (1 call site)

---

## Expected Outcomes
- Every uploaded image receives a unique analysis based on its actual visual content via Google Gemini Vision API.
- When `GEMINI_API_KEY` is not configured, users see a clear message: "Real-time vision analysis unavailable" instead of fake data.
- TypeScript compilation succeeds with no errors.
- Existing tests pass and new vision fallback test passes.
- Manual testing confirms distinct outputs for different uploaded images.
