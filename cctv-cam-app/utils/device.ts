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

export async function getDeviceStatus(): Promise<DeviceStatus> {
  try {
    const networkState = await Network.getNetworkStateAsync();
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

export async function openBatterySettings(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.BATTERY_SAVER_SETTINGS
      );
    } else if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:root=BATTERY_USAGE");
    }
  } catch (error) {
    console.error("Error opening battery settings:", error);
    Linking.openSettings();
  }
}

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
