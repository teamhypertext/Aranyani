/**
 * Utils barrel export
 * Re-exports all utility functions and types
 */

// Device utilities
export {
  getDeviceStatus,
  openBatterySettings,
  formatNetworkType,
  type DeviceStatus,
} from "./device";

// Motion detection utilities
export {
  calculateFrameSignature,
  detectMotion,
  formatDetectionTime,
} from "./motionDetection";

// Permission utilities are exported separately as they have their own import path
