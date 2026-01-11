import { loadTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { MIN_CONFIDENCE_THRESHOLD, EXCLUDED_ANIMALS } from '@/constants';

// Animal classes based on data.yaml from tinyml project
export const ANIMAL_CLASSES = {
  0: 'Elephant',
  1: 'Wild Boar',
  2: 'Cattle',
  3: 'Leopard',
  4: 'Cheetah',
  5: 'Human',
} as const;

export type AnimalClass = keyof typeof ANIMAL_CLASSES;

export interface InferenceResult {
  class: AnimalClass;
  label: string;
  confidence: number;
  allPredictions: Array<{
    class: AnimalClass;
    label: string;
    confidence: number;
  }>;
}

class MLInferenceService {
  private model: TensorflowModel | null = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private readonly MODEL_INPUT_SIZE = 640; // YOLO11n input size
  
  /**
   * Initialize the TFLite model
   * Loads best_float32.tflite from ml folder
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      console.log('[ML Service] Model already initialized or initializing');
      return;
    }

    try {
      this.isInitializing = true;
      console.log('[ML Service] Starting model initialization...');
      console.log('[ML Service] Loading TFLite model: ml/best_float32.tflite');

      this.model = await loadTensorflowModel(require('../ml/best_float32.tflite'));
      
      this.isInitialized = true;
      console.log('[ML Service] SUCCESS: TFLite Model loaded successfully!');
      console.log('[ML Service] Model inputs:', JSON.stringify(this.model.inputs));
      console.log('[ML Service] Model outputs:', JSON.stringify(this.model.outputs));
    } catch (error) {
      console.error('[ML Service] CRITICAL ERROR: Failed to load TFLite model');
      console.error('[ML Service] Error details:', error);
      this.isInitialized = false;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Run inference on captured image using the ACTUAL TFLite model
   * @param imageUri - URI of the captured image
   * @returns InferenceResult with predictions (null if confidence < 25%)
   */
  async predict(imageUri: string): Promise<InferenceResult | null> {
    if (!this.isInitialized || !this.model) {
      console.error('Model not loaded! Call initialize() first.');
      return null;
    }

    try {
      // Step 1: Resize image to 640x640 for YOLO model  
      const resizedImage = await manipulateAsync(
        imageUri,
        [{ resize: { width: this.MODEL_INPUT_SIZE, height: this.MODEL_INPUT_SIZE } }],
        { format: SaveFormat.JPEG, compress: 0.9, base64: true }
      );

      if (!resizedImage.base64) {
        throw new Error('Failed to get base64 image data');
      }

      // Step 2: Decode JPEG to RGB pixels using jpeg-js (pure JavaScript)
      const jpeg = require('jpeg-js');
      const jpegData = Uint8Array.from(atob(resizedImage.base64), c => c.charCodeAt(0));
      const rawImageData = jpeg.decode(jpegData, { useTArray: true });
      
      // Step 3: Convert RGBA → RGB Float32Array with normalization [0-255] → [0-1]
      const { width, height, data } = rawImageData; // data is RGBA Uint8Array
      
      // Create Float32 array: [1, 640, 640, 3] = 1,228,800 values
      const pixelCount = width * height;
      const tensorSize = pixelCount * 3; // RGB only (no alpha)
      const imageData = new Float32Array(tensorSize);
      
      // Convert RGBA → RGB and normalize to [0, 1]
      for (let i = 0; i < pixelCount; i++) {
        const rgbaIndex = i * 4;
        const rgbIndex = i * 3;
        
        imageData[rgbIndex] = data[rgbaIndex] / 255.0;         // R
        imageData[rgbIndex + 1] = data[rgbaIndex + 1] / 255.0; // G
        imageData[rgbIndex + 2] = data[rgbaIndex + 2] / 255.0; // B
        // Skip alpha channel (rgbaIndex + 3)
      }

      // Step 4: Run inference with the properly formatted data
      const outputs = this.model.runSync([imageData]);
      
      // Step 5: Parse YOLO detection output
      // Output shape: [1, 10, 8400] = [batch, (4_bbox + 6_classes), num_anchors]
      const output = outputs[0];
      
      const numClasses = Object.keys(ANIMAL_CLASSES).length;
      const numAnchors = 8400;
      
      // Collect all detections with class scores
      const detections: Array<{
        bbox: number[];
        classScores: number[];
        maxClass: number;
        maxScore: number;
      }> = [];

      // Parse each detection anchor
      for (let i = 0; i < numAnchors; i++) {
        // Get bbox coordinates (first 4 values for this anchor)
        const x = output[i] as number;
        const y = output[numAnchors + i] as number;
        const w = output[2 * numAnchors + i] as number;
        const h = output[3 * numAnchors + i] as number;
        
        // Get class scores (next 6 values for this anchor)
        const classScores: number[] = [];
        for (let c = 0; c < numClasses; c++) {
          const score = output[(4 + c) * numAnchors + i] as number;
          classScores.push(score);
        }
        
        // Find max class and score
        let maxScore = -Infinity;
        let maxClass = 0;
        classScores.forEach((score, idx) => {
          if (score > maxScore) {
            maxScore = score;
            maxClass = idx;
          }
        });
        
        // Only keep detections with reasonable confidence
        if (maxScore > 0.001) {
          detections.push({ bbox: [x, y, w, h], classScores, maxClass, maxScore });
        }
      }
      
      if (detections.length === 0) {
        return null;
      }
      
      // Sort by confidence and take top detection
      detections.sort((a, b) => b.maxScore - a.maxScore);
      const topDetection = detections[0];
      
      // Apply sigmoid to class scores to get probabilities
      const expScores = topDetection.classScores.map(score => Math.exp(score));
      const sumExpScores = expScores.reduce((a, b) => a + b, 0);
      const probabilities = expScores.map(exp => (exp / sumExpScores) * 100);
      
      // Create sorted predictions
      const allPredictions = probabilities
        .map((probability, index) => ({
          class: index as AnimalClass,
          label: ANIMAL_CLASSES[index as AnimalClass],
          confidence: probability,
        }))
        .sort((a, b) => b.confidence - a.confidence);

      const topPrediction = allPredictions[0];

      console.log('[ML Detection] Top prediction:', topPrediction.label, '-', topPrediction.confidence.toFixed(2) + '%');

      // Check confidence threshold
      if (topPrediction.confidence < MIN_CONFIDENCE_THRESHOLD) {
        return null;
      }

      return {
        class: topPrediction.class,
        label: topPrediction.label,
        confidence: topPrediction.confidence,
        allPredictions,
      };
    } catch (error) {
      console.error('[ML Service] TFLite inference failed:', error);
      return null;
    }
  }

  /**
   * Cleanup and release model resources
   */
  dispose(): void {
    if (this.model) {
      this.model = null;
    }
    this.isInitialized = false;
  }

  /**
   * Check if model is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }
}

// Export singleton instance
export const mlInferenceService = new MLInferenceService();
