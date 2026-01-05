/**
 * Motion detection constants
 */

// How often to check for motion (in milliseconds)
export const MOTION_CHECK_INTERVAL = 1000; // 1 second

// How long to show motion detected state (in milliseconds)
export const MOTION_RESET_DELAY = 3000; // 3 seconds

// Sensitivity threshold - percentage change required to trigger motion detection
// Lower = more sensitive, Higher = less sensitive
export const MOTION_SENSITIVITY_PERCENT = 5;

// Delay before starting motion detection after camera init (in milliseconds)
export const CAMERA_INIT_DELAY = 1000; // 1 second

// How often to update device status (in milliseconds)
export const STATUS_UPDATE_INTERVAL = 10000; // 10 seconds

// Battery threshold for warning (percentage)
export const LOW_BATTERY_THRESHOLD = 20;

// Photo quality for motion detection (0-1, lower = smaller file = faster processing)
export const MOTION_DETECTION_PHOTO_QUALITY = 0.1;
