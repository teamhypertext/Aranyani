import * as Device from "expo-device";

export function getBasicDeviceInfo() {
  return {
    deviceId:
      Device.osBuildId ??
      Device.osInternalBuildId ??
      Device.deviceName ??
      "Unknown",
    brand: Device.brand ?? "Unknown",
    model: Device.modelName ?? "Unknown",
    systemName: Device.osName ?? "Unknown",
    systemVersion: Device.osVersion ?? "Unknown",
  };
}
