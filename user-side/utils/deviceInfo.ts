import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "aranyani_device_id";

export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    if (deviceId) {
      return deviceId;
    }

    if (Platform.OS === "android") {
      deviceId = Application.getAndroidId() || "";
    } else if (Platform.OS === "ios") {
      deviceId = await Application.getIosIdForVendorAsync() || "";
    } else {
      deviceId = Application.applicationId || "";
    }

    if (!deviceId) {
      deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    
    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
};
