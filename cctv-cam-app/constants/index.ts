export const MOTION_CHECK_INTERVAL = 1000;
export const MOTION_RESET_DELAY = 3000;
export const CAMERA_INIT_DELAY = 1000;
export const STATUS_UPDATE_INTERVAL = 60000;
export const LOW_BATTERY_THRESHOLD = 15;
export const MOTION_DETECTION_PHOTO_QUALITY = 0.1;
export const SIZE_CHANGE_THRESHOLD = 2;
export const WARMUP_FRAMES = 2;

// Confidence threshold for triggering actions (lowered from 85% due to model performance)
export const MIN_CONFIDENCE_THRESHOLD = 25;

// Animals to exclude from alerts and API calls (safe animals)
export const EXCLUDED_ANIMALS = ['Human', 'Elephant', 'Cattle'];

// Backend API configuration
export const API_BASE_URL = 'https://aranyani.onrender.com';
export const ANIMAL_RECORDS_ENDPOINT = '/api/v1/animal-records/add';
export const NODE_ID = 'SENSOR_001';