import { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { Toast } from "toastify-react-native";

import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { useMotionDetection } from "@/hooks/useMotionDetection";
import { StatusCard, LiveStatsCard, LastDetectionCard } from "@/components";
import { formatNetworkType } from "@/utils";
import { CAMERA_INIT_DELAY, LOW_BATTERY_THRESHOLD } from "@/constants";

type CameraFacing = "front" | "back";

/**
 * Monitoring Screen
 * Dedicated page for active wildlife monitoring with camera and motion detection
 * Following plan.md Task 2: Motion Detection Engine specifications
 */
export default function MonitorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cameraFacing?: string }>();
  const cameraFacing = (params.cameraFacing as CameraFacing) || "back";

  // Camera ref
  const cameraRef = useRef<any>(null);

  // Custom hooks for modular logic
  const { deviceStatus } = useDeviceStatus();
  const {
    motionDetected,
    framesProcessed,
    detectionsToday,
    lastDetectionTime,
    capturedImage,
    startDetection,
    stopDetection,
  } = useMotionDetection(cameraRef);

  // Location status (passed from dashboard or can be re-requested)
  const locationEnabled = true; // Already granted in dashboard

  // Hide navigation bar and show toast on mount
  useEffect(() => {
    // Hide system navigation bar for immersive experience
    NavigationBar.setVisibilityAsync("hidden").catch(() => {
      // Ignore errors on unsupported devices
    });

    // Show exit instruction toast
    Toast.info("Long press STOP to exit monitoring", "bottom");

    // Start motion detection after camera init delay
    const initTimeout = setTimeout(() => {
      startDetection();
    }, CAMERA_INIT_DELAY);

    // Cleanup on unmount
    return () => {
      clearTimeout(initTimeout);
      stopDetection();
      NavigationBar.setVisibilityAsync("visible").catch(() => {});
    };
  }, [startDetection, stopDetection]);

  // Handle stop monitoring with long press
  const handleStopMonitoring = useCallback(() => {
    stopDetection();
    router.back();
  }, [stopDetection, router]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Camera View - Full screen background */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={cameraFacing}
      />

      {/* Motion Detection Overlay - Red border when motion detected */}
      {motionDetected && <View style={styles.motionOverlay} />}

      {/* Main Content Overlay */}
      <SafeAreaView style={styles.flex1}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Aranyani Sensor</Text>
              <Text style={styles.headerSubtitle}>Wildlife Monitoring Active</Text>
            </View>
            {/* Live Indicator */}
            <View style={styles.liveIndicator}>
              <View
                style={[
                  styles.dot,
                  motionDetected ? styles.dotRed : styles.dotGreen,
                ]}
              />
              <Text style={motionDetected ? styles.motionText : styles.liveText}>
                {motionDetected ? "MOTION!" : "LIVE"}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Status Grid */}
          <View style={styles.statusGrid}>
            <StatusCard
              label="Internet"
              value={
                deviceStatus.isConnected
                  ? formatNetworkType(deviceStatus.connectionType)
                  : "Offline"
              }
              isActive={deviceStatus.isConnected}
              isDark
            />
            <StatusCard
              label="Location"
              value={locationEnabled ? "Enabled" : "Disabled"}
              isActive={locationEnabled}
              isDark
            />
            <StatusCard
              label="Battery"
              value={`${deviceStatus.batteryLevel}%`}
              isActive={deviceStatus.batteryLevel > LOW_BATTERY_THRESHOLD}
              isDark
            />
            <StatusCard
              label="Power Mode"
              value={deviceStatus.isLowPowerMode ? "Saver ON" : "Normal"}
              isActive={deviceStatus.isLowPowerMode}
              isDark
            />
          </View>

          {/* Live Stats */}
          <LiveStatsCard
            framesProcessed={framesProcessed}
            detectionsToday={detectionsToday}
          />

          {/* Last Detection */}
          {capturedImage && lastDetectionTime && (
            <LastDetectionCard
              imageUri={capturedImage}
              detectionTime={lastDetectionTime}
            />
          )}
        </View>

        {/* Stop Button */}
        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopMonitoring}
            onLongPress={handleStopMonitoring}
            delayLongPress={500}
          >
            <Text style={styles.buttonText}>⏹ Stop Monitoring</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  flex1: {
    flex: 1,
  },
  motionOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: "#ef4444",
    zIndex: 10,
  },
  header: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: "#22c55e",
  },
  dotRed: {
    backgroundColor: "#ef4444",
  },
  liveText: {
    color: "#fff",
    fontWeight: "500",
  },
  motionText: {
    color: "#ef4444",
    fontWeight: "bold",
  },
  contentArea: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionArea: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  stopButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
  },
});
