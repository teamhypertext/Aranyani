/**
 * Motion detection utilities
 */

/**
 * Calculate a simple signature/hash from base64 image data
 * This is used to compare frames for motion detection
 */
export function calculateFrameSignature(base64Data: string): number {
  if (!base64Data) return 0;
  
  // Sample the base64 string at regular intervals to create a signature
  let signature = 0;
  const sampleSize = Math.min(base64Data.length, 1000);
  const step = Math.floor(base64Data.length / sampleSize);
  
  for (let i = 0; i < base64Data.length; i += step) {
    signature += base64Data.charCodeAt(i);
  }
  
  return signature;
}

/**
 * Detect motion by comparing two frame signatures
 * Returns true if the difference exceeds the threshold
 */
export function detectMotion(
  currentSignature: number,
  previousSignature: number,
  sensitivityPercent: number
): { detected: boolean; percentChange: number } {
  if (previousSignature === 0) {
    return { detected: false, percentChange: 0 };
  }
  
  const difference = Math.abs(currentSignature - previousSignature);
  const percentChange = (difference / previousSignature) * 100;
  
  return {
    detected: percentChange > sensitivityPercent,
    percentChange,
  };
}

/**
 * Format detection time for display
 */
export function formatDetectionTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
