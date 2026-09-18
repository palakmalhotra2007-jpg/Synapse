declare module 'face-api.js' {
  export interface FaceDetection {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    score: number;
  }

  export interface FaceLandmarks {
    positions: Array<{ x: number; y: number }>;
  }

  export interface FaceDescriptor extends Float32Array {}

  export interface WithFaceLandmarks<T> extends T {
    landmarks: FaceLandmarks;
  }

  export interface WithFaceDescriptor<T> extends T {
    descriptor: Float32Array;
  }

  export const nets: {
    ssdMobilenetv1: {
      loadFromUri: (url: string) => Promise<void>;
    };
    faceLandmark68Net: {
      loadFromUri: (url: string) => Promise<void>;
    };
    faceRecognitionNet: {
      loadFromUri: (url: string) => Promise<void>;
    };
  };

  export function detectSingleFace(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): {
    withFaceLandmarks: () => {
      withFaceDescriptor?: () => Promise<WithFaceDescriptor<WithFaceLandmarks<{ detection: FaceDetection }>> | undefined>;
    } & Promise<WithFaceLandmarks<{ detection: FaceDetection }> | undefined>;
  };

  export function euclideanDistance(arr1: Float32Array, arr2: Float32Array): number;

  export function matchDimensions(
    canvas: HTMLCanvasElement,
    displaySize: { width: number; height: number }
  ): void;

  export function resizeResults<T>(
    results: T,
    displaySize: { width: number; height: number }
  ): T;
}
