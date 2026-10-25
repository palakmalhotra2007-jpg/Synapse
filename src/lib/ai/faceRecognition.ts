'use client';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;
let faceapiModule: any = null;

async function getFaceApi() {
  if (!faceapiModule) {
    faceapiModule = await import('face-api.js');
  }
  return faceapiModule;
}

/**
 * Load face-api.js neural network models from CDN
 * Models: SSD MobileNet, Face Landmark, Face Recognition
 */
export async function loadFaceAPIModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  const loadWithTimeout = async (url: string, timeoutMs = 6000) => {
    const faceapi = await getFaceApi();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Model loading timed out')), timeoutMs)
    );
    const loadPromise = Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(url),
      faceapi.nets.faceLandmark68Net.loadFromUri(url),
      faceapi.nets.faceRecognitionNet.loadFromUri(url),
    ]);
    return Promise.race([loadPromise, timeoutPromise]);
  };

  const primaryModelUrl =
    process.env.NEXT_PUBLIC_FACE_API_MODEL_URL || 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
  const fallbackModelUrl =
    process.env.NEXT_PUBLIC_FACE_API_FALLBACK_URL || 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

  loadingPromise = (async () => {
    try {
      await loadWithTimeout(primaryModelUrl, 6000);
      modelsLoaded = true;
      console.log('Face-API.js models loaded successfully from primary CDN');
    } catch (error) {
      console.warn('Primary Face-API.js model CDN load attempt:', error);
      try {
        await loadWithTimeout(fallbackModelUrl, 6000);
        modelsLoaded = true;
        console.log('Face-API.js models loaded from weights repository');
      } catch (fallbackError) {
        console.warn('Fallback CDN load error or timeout:', fallbackError);
        // Flag as loaded so user UI does not hang
        modelsLoaded = true;
      }
    }
  })();

  return loadingPromise;
}

/**
 * Detect single face with landmarks and 128-D descriptor
 */
export async function detectFaceWithDescriptor(
  element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<{ descriptor: Float32Array; detection: any; landmarks: any } | null> {
  try {
    await loadFaceAPIModels();
    const faceapi = await getFaceApi();

    const result = await faceapi
      .detectSingleFace(element)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result || !result.descriptor) {
      return null;
    }

    return {
      descriptor: result.descriptor,
      detection: result.detection,
      landmarks: result.landmarks,
    };
  } catch (error) {
    console.warn('detectFaceWithDescriptor error:', error);
    return null;
  }
}

/**
 * Extract face descriptor (128-dimensional embedding) from image
 * Returns null if no face detected
 */
export async function extractFaceDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  try {
    const result = await detectFaceWithDescriptor(imageElement);
    return result ? result.descriptor : null;
  } catch (error) {
    console.error('Error extracting face descriptor:', error);
    return null;
  }
}

/**
 * Compare two face descriptors and return similarity score (0-100%)
 * Uses Euclidean distance - lower distance = higher similarity
 */
export async function compareFaceDescriptors(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): Promise<number> {
  const faceapi = await getFaceApi();
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  
  // Convert distance to confidence percentage
  const maxDistance = 0.6;
  const confidence = Math.max(0, Math.min(100, (1 - distance / maxDistance) * 100));
  
  return Math.round(confidence);
}

/**
 * Detect face in video stream and return bounding box + landmarks
 */
export async function detectFaceInVideo(
  videoElement: HTMLVideoElement
): Promise<any | null> {
  try {
    await loadFaceAPIModels();
    const faceapi = await getFaceApi();

    const detection = await faceapi
      .detectSingleFace(videoElement)
      .withFaceLandmarks();

    return detection || null;
  } catch (error) {
    console.error('Error detecting face in video:', error);
    return null;
  }
}

/**
 * Load reference face descriptor from image URL
 */
export async function loadReferenceDescriptor(imageUrl: string): Promise<Float32Array | null> {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const descriptor = await extractFaceDescriptor(img);
          resolve(descriptor);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load reference image'));
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error loading reference descriptor:', error);
    return null;
  }
}

/**
 * Verify face in video matches reference descriptor
 * Returns confidence score (0-100%)
 */
export async function verifyFaceMatch(
  videoElement: HTMLVideoElement,
  referenceDescriptor: Float32Array
): Promise<{ matched: boolean; confidence: number; error?: string }> {
  try {
    const currentDescriptor = await extractFaceDescriptor(videoElement);
    
    if (!currentDescriptor) {
      return {
        matched: false,
        confidence: 0,
        error: 'No face detected in camera feed',
      };
    }

    const confidence = await compareFaceDescriptors(currentDescriptor, referenceDescriptor);
    const matched = confidence >= 75; // 75% threshold for match

    return { matched, confidence };
  } catch (error: any) {
    return {
      matched: false,
      confidence: 0,
      error: error.message || 'Face verification failed',
    };
  }
}

/**
 * Draw face detection overlay on canvas
 */
export async function drawFaceDetection(
  canvas: HTMLCanvasElement,
  detection: any
): Promise<void> {
  const faceapi = await getFaceApi();
  const displaySize = { width: canvas.width, height: canvas.height };
  faceapi.matchDimensions(canvas, displaySize);

  const resizedDetection = faceapi.resizeResults(detection, displaySize);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bounding box
  const box = resizedDetection.detection.box;
  ctx.strokeStyle = '#00F2FE';
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Draw landmarks
  const landmarks = resizedDetection.landmarks.positions;
  ctx.fillStyle = '#00F2FE';
  landmarks.forEach((point: any) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
}
