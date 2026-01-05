import { useState, useEffect, useCallback, useRef } from "react";
import { getDeviceStatus, type DeviceStatus } from "@/utils";
import { STATUS_UPDATE_INTERVAL } from "@/constants";

/**
 * Custom hook for managing device status updates
 * Polls device status at regular intervals
 */
export function useDeviceStatus() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    isConnected: false,
    connectionType: "Unknown",
    batteryLevel: 0,
    isLowPowerMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateDeviceStatus = useCallback(async () => {
    try {
      const status = await getDeviceStatus();
      setDeviceStatus(status);
    } catch (error) {
      console.error("Error updating device status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startStatusUpdates = useCallback(() => {
    // Get initial status
    updateDeviceStatus();
    
    // Start interval for periodic updates
    intervalRef.current = setInterval(updateDeviceStatus, STATUS_UPDATE_INTERVAL);
  }, [updateDeviceStatus]);

  const stopStatusUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startStatusUpdates();
    return () => {
      stopStatusUpdates();
    };
  }, [startStatusUpdates, stopStatusUpdates]);

  return {
    deviceStatus,
    isLoading,
    updateDeviceStatus,
    startStatusUpdates,
    stopStatusUpdates,
  };
}
