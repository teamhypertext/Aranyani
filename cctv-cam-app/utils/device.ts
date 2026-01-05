import { Platform, Linking } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import * as Network from "expo-network";
import * as Battery from "expo-battery";

export interface DeviceStatus {
  isConnected: boolean;
  connectionType: string;
  batteryLevel: number;
  isLowPowerMode: boolean;
}

/**
 * Get current device status including network and battery info
 */
export async function getDeviceStatus(): Promise<DeviceStatus> {
  try {
    // Network status
    const networkState = await Network.getNetworkStateAsync();
    
    // Battery status
    const batteryLevelValue = await Battery.getBatteryLevelAsync();
    const isLowPowerMode = await Battery.isLowPowerModeEnabledAsync();
    
    return {
      isConnected: networkState.isConnected || false,
      connectionType: networkState.type || "Unknown",
      batteryLevel: Math.round(batteryLevelValue * 100),
      isLowPowerMode,
    };
  } catch (error) {
    console.error("Error getting device status:", error);
    return {
      isConnected: false,
      connectionType: "Unknown",
      batteryLevel: 0,
      isLowPowerMode: false,
    };
  }
}

/**
 * Open battery saver settings on the device
 */
export async function openBatterySettings(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      // Open Battery Saver settings directly on Android
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.BATTERY_SAVER_SETTINGS
      );
    } else if (Platform.OS === "ios") {
      // iOS doesn't allow direct access to battery settings, open main settings
      Linking.openURL("App-Prefs:root=BATTERY_USAGE");
    }
  } catch (error) {
    console.error("Error opening battery settings:", error);
    // Fallback to general settings if specific intent fails
    Linking.openSettings();
  }
}

/**
 * Format network type for display
 */
export function formatNetworkType(type: string): string {
  switch (type) {
    case "WIFI":
      return "WiFi";
    case "CELLULAR":
      return "Cellular";
    case "NONE":
      return "Offline";
    default:
      return type;
  }
}
