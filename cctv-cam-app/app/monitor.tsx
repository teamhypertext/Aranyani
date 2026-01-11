import { useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, StatusBar, Vibration, Pressable } from "react-native";
import { CameraView } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { Toast } from "toastify-react-native";

import { useMotionDetection } from "@/hooks/useMotionDetection";
import { CAMERA_INIT_DELAY, LOW_BATTERY_THRESHOLD } from "@/constants";
import { getDeviceStatus } from "@/utils";

type CameraFacing = "front" | "back";

export default function MonitorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cameraFacing?: string }>();
  const cameraFacing = (params.cameraFacing as CameraFacing) || "back";

  const cameraRef = useRef<any>(null);
  const batteryCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { motionDetected, startDetection, stopDetection } = useMotionDetection(cameraRef);

  useEffect(() => {
    if (motionDetected) {
      Vibration.vibrate([0, 200, 100, 200]);
    }
  }, [motionDetected]);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    NavigationBar.setBackgroundColorAsync("#000000").catch(() => {});

    Toast.info("Long press to exit", "bottom");

    const initTimeout = setTimeout(() => {
      startDetection();
    }, CAMERA_INIT_DELAY);

    batteryCheckRef.current = setInterval(async () => {
      const status = await getDeviceStatus();
      if (status.batteryLevel < LOW_BATTERY_THRESHOLD) {
        Toast.error("Low battery - stopping", "bottom");
        handleExit();
      }
    }, 60000);

    return () => {
      clearTimeout(initTimeout);
      stopDetection();
      if (batteryCheckRef.current) {
        clearInterval(batteryCheckRef.current);
      }
      NavigationBar.setVisibilityAsync("visible").catch(() => {});
    };
  }, [startDetection, stopDetection]);

  const handleExit = useCallback(() => {
    stopDetection();
    router.back();
  }, [stopDetection, router]);

  return (
    <Pressable style={styles.container} onLongPress={handleExit} delayLongPress={1000}>
      <StatusBar hidden />
      
      {/* Camera behind black overlay - no flash visible */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
          animateShutter={false}
          enableTorch={false}
        />
        {/* Black overlay to hide any camera flash/animation */}
        <View style={styles.blackOverlay} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraContainer: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
  },
  camera: {
    width: 100,
    height: 100,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
});
