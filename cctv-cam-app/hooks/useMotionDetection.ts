import { useState, useCallback, useRef } from "react";
import {
  MOTION_CHECK_INTERVAL,
  MOTION_RESET_DELAY,
  MOTION_SENSITIVITY_PERCENT,
  MOTION_DETECTION_PHOTO_QUALITY,
} from "@/constants";
import { detectMotion, calculateFrameSignature, formatDetectionTime } from "@/utils";

export interface MotionDetectionState {
  motionDetected: boolean;
  framesProcessed: number;
  detectionsToday: number;
  lastDetectionTime: string | null;
  capturedImage: string | null;
  isActive: boolean;
}

/**
 * Custom hook for motion detection using camera frames
 * Implements frame differencing algorithm with throttling
 */
export function useMotionDetection(cameraRef: React.MutableRefObject<any>) {
  const [motionDetected, setMotionDetected] = useState(false);
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [detectionsToday, setDetectionsToday] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Refs for motion detection
  const previousSignatureRef = useRef<number>(0);
  const motionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false);

  // Process a single frame for motion detection
  const processFrame = useCallback(async () => {
    if (isProcessingRef.current || !cameraRef.current) return;

    isProcessingRef.current = true;

    try {
      // Capture frame with low quality for fast processing
      const photo = await cameraRef.current.takePictureAsync({
        quality: MOTION_DETECTION_PHOTO_QUALITY,
        base64: true,
        skipMetadata: true,
        shutterSound: false,
      });

      setFramesProcessed((prev) => prev + 1);

      // Calculate signature from base64 image
      const currentSignature = calculateFrameSignature(photo.base64);

      // Compare with previous frame if we have one
      if (previousSignatureRef.current > 0) {
        const { detected, percentChange } = detectMotion(
          currentSignature,
          previousSignatureRef.current,
          MOTION_SENSITIVITY_PERCENT
        );

        if (detected) {
          console.log(`Motion detected! Change: ${percentChange.toFixed(2)}%`);
          setMotionDetected(true);
          setDetectionsToday((prev) => prev + 1);
          setLastDetectionTime(formatDetectionTime(new Date()));
          setCapturedImage(photo.uri);

          // Reset motion detected flag after delay
          setTimeout(() => setMotionDetected(false), MOTION_RESET_DELAY);
        }
      }

      // Store current signature for next comparison
      previousSignatureRef.current = currentSignature;
    } catch (error) {
      console.error("Frame capture error:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [cameraRef]);

  // Start motion detection
  const startDetection = useCallback(() => {
    console.log("Starting motion detection...");
    setMotionDetected(false);
    previousSignatureRef.current = 0;
    setIsActive(true);

    // Process frames at the configured interval
    motionIntervalRef.current = setInterval(processFrame, MOTION_CHECK_INTERVAL);
  }, [processFrame]);

  // Stop motion detection
  const stopDetection = useCallback(() => {
    console.log("Stopping motion detection...");
    if (motionIntervalRef.current) {
      clearInterval(motionIntervalRef.current);
      motionIntervalRef.current = null;
    }
    previousSignatureRef.current = 0;
    isProcessingRef.current = false;
    setIsActive(false);
  }, []);

  // Reset statistics
  const resetStats = useCallback(() => {
    setFramesProcessed(0);
    setDetectionsToday(0);
    setLastDetectionTime(null);
    setCapturedImage(null);
    setMotionDetected(false);
  }, []);

  return {
    // State
    motionDetected,
    framesProcessed,
    detectionsToday,
    lastDetectionTime,
    capturedImage,
    isActive,
    // Actions
    startDetection,
    stopDetection,
    resetStats,
  };
}
