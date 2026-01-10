import * as Location from "expo-location";
import { Camera } from "expo-camera";

export interface PermissionStatus {
  camera: boolean;
  location: boolean;
}

export async function requestCameraPermission(): Promise<boolean> {
  try {
    const result = await Camera.requestCameraPermissionsAsync();
    return result.granted;
  } catch (error) {
    console.error("Error requesting camera permission:", error);
    return false;
  }
}

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const result = await Location.requestForegroundPermissionsAsync();
    return result.status === "granted";
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return false;
  }
}

export async function requestAllPermissions(): Promise<PermissionStatus> {
  const camera = await requestCameraPermission();
  const location = await requestLocationPermission();
  return { camera, location };
}

export async function checkCameraPermission(): Promise<boolean> {
  try {
    const result = await Camera.getCameraPermissionsAsync();
    return result.granted;
  } catch (error) {
    console.error("Error checking camera permission:", error);
    return false;
  }
}

export async function checkLocationPermission(): Promise<boolean> {
  try {
    const result = await Location.getForegroundPermissionsAsync();
    return result.status === "granted";
  } catch (error) {
    console.error("Error checking location permission:", error);
    return false;
  }
}
