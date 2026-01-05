import { SIZE_CHANGE_THRESHOLD } from "@/constants";

export interface FrameData {
  size: number;
  timestamp: number;
}

export function getFrameData(base64Data: string): FrameData {
  return {
    size: base64Data?.length || 0,
    timestamp: Date.now(),
  };
}

export function compareFrames(
  current: FrameData,
  previous: FrameData
): { isChanged: boolean; percentChange: number } {
  if (previous.size === 0 || current.size === 0) {
    return { isChanged: false, percentChange: 0 };
  }

  const sizeDiff = Math.abs(current.size - previous.size);
  const percentChange = (sizeDiff / previous.size) * 100;
  const isChanged = percentChange > SIZE_CHANGE_THRESHOLD;

  return { isChanged, percentChange };
}

export function formatDetectionTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
