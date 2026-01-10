import { useState, useCallback, useRef } from "react";
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';
import {
  MOTION_CHECK_INTERVAL,
  MOTION_RESET_DELAY,
  MOTION_DETECTION_PHOTO_QUALITY,
  WARMUP_FRAMES,
  API_BASE_URL,
  ANIMAL_RECORDS_ENDPOINT,
  NODE_ID,
  EXCLUDED_ANIMALS,
} from "@/constants";
import {
  getFrameData,
  compareFrames,
  formatDetectionTime,
  type FrameData,
} from "@/utils";
import { mlInferenceService } from "@/services";

export function useMotionDetection(cameraRef: React.MutableRefObject<any>) {
  const [motionDetected, setMotionDetected] = useState(false);
  const [detectionsCount, setDetectionsCount] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const previousFrameRef = useRef<FrameData | null>(null);
  const frameCountRef = useRef(0);
  const motionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false);
  const lastAnimalDetectionRef = useRef<number>(0); // Track last detection timestamp
  const DETECTION_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Announce detected animal using text-to-speech
   * Announces detected animals via speech synthesis
   * Filtering is already done by the caller, so just announce
   */
  const announceAnimal = useCallback((animalName: string, confidence: number) => {
    console.log('[Voice Alert] ========== VOICE ANNOUNCEMENT ==========');
    console.log('[Voice Alert] Animal:', animalName, '| Confidence:', confidence.toFixed(2) + '%');
    
    // Stop any ongoing speech
    Speech.stop();

    // Announce the animal with clear alert message
    const message = `Alert! ${animalName} detected nearby!`;
    console.log('[Voice Alert] ANNOUNCING:', message);
    console.log('[Voice Alert] Pitch: 1.1 | Rate: 0.85 | Volume: 1.0');
    
    Speech.speak(message, {
      language: 'en-US',
      pitch: 1.1,
      rate: 0.85,
      volume: 1.0,
    });
    
    console.log('[Voice Alert] Voice command sent to Speech API');
  }, []);

  /**
   * Run ML inference on captured image
   * Flow: ML Detection → API Call → Voice Announcement
   */
  const runMLInference = useCallback(async (imageUri: string) => {
    try {
      console.log('[Motion Detection] ========== STARTING ML INFERENCE ==========');
      console.log('[Motion Detection] Image URI:', imageUri.substring(0, 60) + '...');
      
      // Ensure ML model is initialized
      if (!mlInferenceService.isReady()) {
        console.log('[Motion Detection] ML model not ready, initializing...');
        await mlInferenceService.initialize();
      }

      // Run inference
      console.log('[Motion Detection] Calling ML model predict...');
      const result = await mlInferenceService.predict(imageUri);

      if (result) {
        console.log('[Motion Detection] ========== DETECTION RESULT ==========');
        console.log('[Motion Detection] Top Detection:', result.label);
        console.log('[Motion Detection] Confidence:', result.confidence.toFixed(2) + '%');
        console.log('[Motion Detection] Checking if animal is excluded...');
        console.log('[Motion Detection] Excluded list:', EXCLUDED_ANIMALS);
        console.log('[Motion Detection] Is excluded?', EXCLUDED_ANIMALS.includes(result.label));

        // Check if this is a dangerous animal (exclude Human and Elephant)
        if (!EXCLUDED_ANIMALS.includes(result.label)) {
          console.log('[Motion Detection] ✓ DANGEROUS ANIMAL DETECTED:', result.label);
          
          // Check if we're in cooldown period
          const now = Date.now();
          const timeSinceLastDetection = now - lastAnimalDetectionRef.current;
          
          if (timeSinceLastDetection < DETECTION_COOLDOWN) {
            const remainingMinutes = Math.ceil((DETECTION_COOLDOWN - timeSinceLastDetection) / 60000);
            console.log(`[Motion Detection] ⏸ COOLDOWN ACTIVE: ${remainingMinutes} minutes remaining`);
            console.log('[Motion Detection] Skipping API call and announcement\n');
            return;
          }
          
          console.log('[Motion Detection] Proceeding with API call and announcement...\n');
          
          // Update last detection time
          lastAnimalDetectionRef.current = now;
          
          // Step 1: Call backend API to save detection
          await saveAnimalDetection(result.label, imageUri);
          
          // Step 2: Announce the animal
          console.log('[Motion Detection] Calling voice announcement for:', result.label);
          announceAnimal(result.label, result.confidence);
        } else {
          console.log('[Motion Detection] ✗ Animal excluded from alert:', result.label, '\n');
        }
      } else {
        console.log('[Motion Detection] No detection result (low confidence or error)');
      }
      console.log('[Motion Detection] ========== ML INFERENCE COMPLETE ==========\n');
    } catch (error) {
      console.error('[Motion Detection] ML Inference error:', error);
    }
  }, []);

  /**
   * Save animal detection to backend API
   * Backend will handle Cloudinary upload
   */
  const saveAnimalDetection = useCallback(async (animalType: string, imageUri: string) => {
    try {
      console.log('\n[Backend API] ========== SAVING DETECTION ==========');
      console.log('[Backend API] Animal:', animalType);
      
      // Step 1: Read image as base64
      console.log('[Backend API] Reading image as base64...');
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      console.log('[Backend API] Base64 size:', base64Image.length, 'characters');

      // Step 2: Get current location
      console.log('[Backend API] Getting device location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      console.log('[Backend API] Location:', latitude.toFixed(6), ',', longitude.toFixed(6));

      // Step 3: Prepare request body with base64 image
      const requestBody = {
        animalType,
        nodeId: NODE_ID,
        lat: latitude,
        lng: longitude,
        imageBase64: base64Image, // Send base64 to backend
      };

      console.log('[Backend API] Sending to backend (image will be uploaded to Cloudinary by server)...');

      // Step 4: Call backend API
      const apiUrl = `${API_BASE_URL}${ANIMAL_RECORDS_ENDPOINT}`;
      console.log('[Backend API] API URL:', apiUrl);
      
      const response = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 50000, // 50s timeout for image upload
        }
      );

      console.log('[Backend API] Response status:', response.status);
      console.log('[Backend API] Response data:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log('[Backend API] ✓ Detection saved successfully!');
        console.log('[Backend API] Image URL:', response.data.data?.img_url || 'N/A');
      } else {
        console.log('[Backend API] ✗ Backend returned success=false');
      }
      console.log('[Backend API] =====================================\n');
    } catch (error: any) {
      console.error('[Backend API] ✗ API call failed');
      console.error('[Backend API] Error:', error.message);
      if (error.response) {
        console.error('[Backend API] Response status:', error.response.status);
        console.error('[Backend API] Response data:', error.response.data);
      }
      console.log('[Backend API] =====================================\n');
      // Don't throw - continue with announcement even if API fails
    }
  }, []);




  const processFrame = useCallback(async () => {
    if (isProcessingRef.current || !cameraRef.current) return;

    isProcessingRef.current = true;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: MOTION_DETECTION_PHOTO_QUALITY,
        base64: true,
        skipMetadata: true,
        shutterSound: false,
        enableAutoStabilization: false,
        enableAutoRedEyeReduction: false,
      });

      if (!photo.base64) {
        isProcessingRef.current = false;
        return;
      }

      frameCountRef.current++;

      if (frameCountRef.current <= WARMUP_FRAMES) {
        previousFrameRef.current = getFrameData(photo.base64);
        isProcessingRef.current = false;
        return;
      }

      const currentFrame = getFrameData(photo.base64);

      if (previousFrameRef.current) {
        const { isChanged, percentChange } = compareFrames(
          currentFrame,
          previousFrameRef.current
        );

        if (isChanged) {
          console.log('[Motion Detection] ========== MOTION DETECTED ==========');
          console.log('[Motion Detection] Frame change:', percentChange.toFixed(1) + '%');
          console.log('[Motion Detection] Captured image URI:', photo.uri.substring(0, 60) + '...');
          
          setMotionDetected(true);
          setDetectionsCount((prev) => prev + 1);
          setLastDetectionTime(formatDetectionTime(new Date()));
          setCapturedImage(photo.uri);

          // Run ML inference on the captured image
          console.log('[Motion Detection] Triggering ML inference...');
          runMLInference(photo.uri);

          setTimeout(() => setMotionDetected(false), MOTION_RESET_DELAY);
        }
      }

      previousFrameRef.current = currentFrame;
    } catch (error) {
    } finally {
      isProcessingRef.current = false;
    }
  }, [cameraRef]);

  const startDetection = useCallback(() => {
    previousFrameRef.current = null;
    frameCountRef.current = 0;
    motionIntervalRef.current = setInterval(processFrame, MOTION_CHECK_INTERVAL);
  }, [processFrame]);

  const stopDetection = useCallback(() => {
    if (motionIntervalRef.current) {
      clearInterval(motionIntervalRef.current);
      motionIntervalRef.current = null;
    }
    previousFrameRef.current = null;
    frameCountRef.current = 0;
    isProcessingRef.current = false;
  }, []);

  return {
    motionDetected,
    detectionsCount,
    lastDetectionTime,
    capturedImage,
    startDetection,
    stopDetection,
  };
}
