import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

import { useDeviceStatus } from "@/hooks";
import {
  StatusCard,
  BatteryWarningBanner,
  BatteryWarningModal,
} from "@/components";
import { openBatterySettings, formatNetworkType } from "@/utils";
import { requestLocationPermission } from "@/utils/permissions";
import { LOW_BATTERY_THRESHOLD } from "@/constants";

type AppState = "loading" | "permission_denied" | "dashboard";
type CameraFacing = "front" | "back";

export default function DashboardScreen() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>("loading");
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const { deviceStatus, isLoading: isStatusLoading } = useDeviceStatus();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("back");
  const [showBatteryWarning, setShowBatteryWarning] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      setStatusMessage("Requesting camera permission...");
      const cameraResult = await requestCameraPermission();

      if (!cameraResult.granted) {
        setStatusMessage("Camera permission is required for monitoring.");
        setAppState("permission_denied");
        return;
      }

      setStatusMessage("Requesting location permission...");
      const locationGranted = await requestLocationPermission();
      setLocationEnabled(locationGranted);

      setAppState("dashboard");
    } catch (error) {
      console.error("Initialization error:", error);
      setStatusMessage("Error during initialization");
      setAppState("permission_denied");
    }
  }

  const handleStartMonitoring = useCallback(() => {
    if (!deviceStatus.isLowPowerMode) {
      setShowBatteryWarning(true);
      return;
    }
    navigateToMonitoring();
  }, [deviceStatus.isLowPowerMode, cameraFacing]);

  const navigateToMonitoring = useCallback(() => {
    setShowBatteryWarning(false);
    router.push(`/monitor?cameraFacing=${cameraFacing}` as any);
  }, [router, cameraFacing]);

  const handleOpenSettings = useCallback(async () => {
    await openBatterySettings();
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
  }, []);

  if (appState === "loading") {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4a7c59" />
        <Text style={styles.statusText}>{statusMessage}</Text>
      </SafeAreaView>
    );
  }

  if (appState === "permission_denied") {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.title}>Permissions Required</Text>
        <Text style={styles.subtitle}>{statusMessage}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={initializeApp}>
          <Text style={styles.primaryButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <BatteryWarningModal
        visible={showBatteryWarning}
        onOpenSettings={handleOpenSettings}
        onContinue={navigateToMonitoring}
        onCancel={() => setShowBatteryWarning(false)}
      />

      <SafeAreaView style={styles.flex1}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Aranyani Sensor</Text>
              <Text style={styles.headerSubtitle}>24/7 Wildlife Monitoring</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentArea}>
          <View style={styles.statusGrid}>
            <StatusCard
              label="Internet"
              value={
                deviceStatus.isConnected
                  ? formatNetworkType(deviceStatus.connectionType)
                  : "Offline"
              }
              isActive={deviceStatus.isConnected}
            />
            <StatusCard
              label="Location"
              value={locationEnabled ? "Enabled" : "Disabled"}
              isActive={locationEnabled}
            />
            <StatusCard
              label="Battery"
              value={`${deviceStatus.batteryLevel}%`}
              isActive={deviceStatus.batteryLevel > LOW_BATTERY_THRESHOLD}
            />
            <StatusCard
              label="Power Mode"
              value={deviceStatus.isLowPowerMode ? "Saver ON" : "Normal"}
              isActive={deviceStatus.isLowPowerMode}
            />
          </View>

          <View style={styles.cameraCard}>
            <View>
              <Text style={styles.cameraTitle}>Camera</Text>
              <Text style={styles.cameraSubtitle}>
                {cameraFacing === "back"
                  ? "Back Camera (Recommended)"
                  : "Front Camera"}
              </Text>
            </View>
            <TouchableOpacity style={styles.toggleButton} onPress={toggleCamera}>
              <Text style={styles.toggleButtonText}>
                {cameraFacing === "back" ? "🔄 Front" : "🔄 Back"}
              </Text>
            </TouchableOpacity>
          </View>

          {!deviceStatus.isLowPowerMode && (
            <BatteryWarningBanner onOpenSettings={handleOpenSettings} />
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Ready to Monitor</Text>
            <Text style={styles.infoText}>
              Press the button below to start 24/7 wildlife monitoring. The app
              will detect motion and capture images automatically.
            </Text>
          </View>
        </View>

        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartMonitoring}
          >
            <Text style={styles.buttonText}>▶ Start Monitoring</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fbf9",
  },
  flex1: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fbf9",
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  statusText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "500",
    color: "#1e2b20",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e2b20",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6c8574",
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#4a7c59",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
  },
  header: {
    backgroundColor: "#4a7c59",
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
  contentArea: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flex: 1,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cameraCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8e4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraTitle: {
    fontWeight: "500",
    color: "#1e2b20",
  },
  cameraSubtitle: {
    fontSize: 14,
    color: "#6c8574",
  },
  toggleButton: {
    backgroundColor: "#e6efe8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonText: {
    fontWeight: "500",
    color: "#1e2b20",
  },
  infoCard: {
    backgroundColor: "#e6efe8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#c8dccb",
  },
  infoTitle: {
    fontWeight: "600",
    color: "#1e2b20",
    marginBottom: 8,
  },
  infoText: {
    color: "#4a7c59",
    lineHeight: 20,
  },
  actionArea: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  startButton: {
    backgroundColor: "#4a7c59",
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
