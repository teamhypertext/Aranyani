import { useState, useCallback, useRef } from "react";
import {
  MOTION_CHECK_INTERVAL,
  MOTION_RESET_DELAY,
  MOTION_DETECTION_PHOTO_QUALITY,
  WARMUP_FRAMES,
} from "@/constants";
import {
  getFrameData,
  compareFrames,
  formatDetectionTime,
  type FrameData,
} from "@/utils";

export function useMotionDetection(cameraRef: React.MutableRefObject<any>) {
  const [motionDetected, setMotionDetected] = useState(false);
  const [detectionsCount, setDetectionsCount] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const previousFrameRef = useRef<FrameData | null>(null);
  const frameCountRef = useRef(0);
  const motionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false);

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
          console.log(`🚨 Motion: ${percentChange.toFixed(1)}% change`);
          setMotionDetected(true);
          setDetectionsCount((prev) => prev + 1);
          setLastDetectionTime(formatDetectionTime(new Date()));
          setCapturedImage(photo.uri);

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
    console.log("Starting motion detection...");
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
