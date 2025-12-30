import axios from "axios";
import { API_BASE_URL } from "@/constants";
import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const DEVICE_ID_KEY = "aranyani_device_id";

export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get stored device ID first
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    if (deviceId) {
      return deviceId;
    }

    // If no stored ID, get platform-specific ID
    if (Platform.OS === "android") {
      deviceId = Application.getAndroidId() || "";
    } else if (Platform.OS === "ios") {
      deviceId = await Application.getIosIdForVendorAsync() || "";
    } else {
      // For web or other platforms, use installation ID
      deviceId = Application.applicationId || "";
    }

    // Generate fallback UUID if still no ID
    if (!deviceId) {
      deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    // Store the device ID for future use
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    
    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    // Return a fallback UUID
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
};

export const createUser = async (username: string, fcmToken?: string) => {
  const deviceId = await getDeviceId();
  const response = await api.post("/api/v1/users/create", {
    deviceId,
    username,
    fcmToken,
  });
  return response.data;
};

export const updateUserLocation = async (lat: number, lng: number) => {
  const deviceId = await getDeviceId();
  const response = await api.patch(
    "/api/v1/users/location",
    {
      lat,
      lng,
    },
    {
      headers: {
        "device-id": deviceId,
      },
    }
  );
  return response.data;
};

export const getNearbyAnimals = async (lat: number, lng: number) => {
  const deviceId = await getDeviceId();
  const response = await api.get("/api/v1/animal-records/nearby", {
    params: { lat, lng },
    headers: {
      "device-id": deviceId,
    },
  });
  return response.data;
};

export const checkUserExists = async (): Promise<boolean> => {
  try {
    const deviceId = await getDeviceId();
    const response = await api.get("/api/v1/animal-records/nearby", {
      params: { lat: 0, lng: 0 },
      headers: {
        "device-id": deviceId,
      },
    });
    return response.data.success;
  } catch (error: any) {
    if (error.response?.status === 403) {
      return false;
    }
    throw error;
  }
};
