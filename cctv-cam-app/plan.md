# Project Aranyani: Complete Implementation Guide
## 24/7 Battery-Efficient Wild Animal Surveillance System Using Old Smartphones

---

## PROJECT OVERVIEW

**Problem:** Human-wildlife conflict costs lives and crops. Commercial CCTV systems cost ₹15,000+ and aren't designed for remote forest areas.

**Solution:** Convert old smartphones into intelligent 24/7 forest monitoring cameras that:
- Run continuously on battery (24+ hours)
- Detect motion using ultra-low-power algorithms
- Use on-device AI to identify wild animals
- Send alerts only when wild animals are confirmed
- Work with solar panels for infinite operation

**Key Innovation:** Event-driven sensor (not video streamer) = 90-95% battery savings

---

## TECHNOLOGY STACK

### Frontend (Mobile App)
- **Framework:** React Native (latest version)
- **Language:** JavaScript/TypeScript
- **Target:** Android 8.0+ (old phones)

### Core Libraries
```json
{
  "react-native-vision-camera": "^4.0.0",
  "react-native-worklets-core": "^1.0.0", 
  "react-native-reanimated": "^3.0.0",
  "react-native-fast-tflite": "^1.0.0",
  "react-native-background-actions": "^3.0.0",
  "react-native-mqtt": "^1.3.0",
  "@react-native-community/geolocation": "^3.0.0",
  "@react-native-async-storage/async-storage": "^1.19.0",
  "react-native-permissions": "^3.9.0",
  "react-native-device-info": "^10.0.0"
}
```

### Backend (Simple)
- **Server:** Node.js + Express (optional for hackathon)
- **MQTT Broker:** Mosquitto or AWS IoT Core
- **Database:** MongoDB (for detection logs)
- **Storage:** cloudinary (for images)

---

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│              OLD SMARTPHONE (Sensor)                │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ STEP 1: Low-Power Motion Detection          │  │
│  │ - Camera: YUV format, 640x480, 2 FPS        │  │
│  │ - Algorithm: Grid sampling (256 points)     │  │
│  │ - Processing: 1 frame/second                │  │
│  │ - Power: ~50-80 mAh/hour                    │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│              [Motion Detected?]                     │
│                      ↓ YES                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ STEP 2: Capture High-Quality Photo          │  │
│  │ - Resolution: lowest                     │  │
│  │ - Format: JPEG                               │  │
│  │ - Metadata: timestamp, GPS, device_id        │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ STEP 3: AI Object Detection (TFLite)        │  │
│  │ - Model: MobileNet SSD / YOLO-tiny           │  │
│  │ - Classes: leopard, elephant, deer, etc.     │  │
│  │ - Threshold: confidence > 70%                │  │
│  │ - Inference: 200-500ms on-device             │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│              [Wild Animal Detected?]                │
│                      ↓ YES                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ STEP 4: Send Alert via MQTT                 │  │
│  │ - Protocol: MQTT (lightweight)               │  │
│  │ - Payload: JSON + base64 thumbnail           │  │
│  │ - Bandwidth: ~50-100 KB per alert            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │   SERVER / CLOUD BACKEND    │
        │ - Receive MQTT messages     │
        │ - Store in database         │
        │ - Send notifications        │
        │ - Analytics dashboard       │
        └─────────────────────────────┘
```

---

## TASK BREAKDOWN (FOR AI AGENT)

---

### TASK 1: PROJECT SETUP & CAMERA INITIALIZATION

**Objective:** Set up React Native project with camera access and permissions

**Requirements:**

1. Create new React Native project (latest version)
2. Install all required dependencies:
   - react-native-vision-camera
   - react-native-reanimated
   - react-native-worklets-core
   - react-native-permissions
   - react-native-device-info

3. Configure Android permissions in `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
   <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
   ```

4. Create permission request component that asks for:
   - Camera permission
   - Location permission
   - Battery optimization exemption

5. Create main camera screen with:
   - Camera device detection (prefer wide-angle, fallback to regular back camera)
   - Camera initialization with optimal settings
   - Basic preview display (for setup/testing only)

**Expected Output:**
- Camera opens successfully
- Wide-angle camera used if available
- All permissions granted
- Basic UI showing camera preview

**Battery Optimization Settings:**
```javascript
Camera Configuration:
{
  pixelFormat: 'yuv',  // Raw sensor data, no processing
  fps: 2,              // Ultra-low frame rate
  preset: 'low',       // 640x480 resolution
  photoQualityBalance: 'speed'
}
```

---

### TASK 2: MOTION DETECTION ENGINE

**Objective:** Implement battery-efficient motion detection using frame differencing

**Algorithm Specification:**

```
Input: Current Frame (Fc), Previous Frame (Fp)
Output: Boolean (motion detected or not)

Grid Sampling Method:
1. Extract Y-plane (Luminance) from YUV format
2. Define grid: 16x16 = 256 sample points
3. For each grid point (x, y):
   - Calculate position: px = x * (width/16), py = y * (height/16)
   - Get pixel index: idx = py * width + px
   - Extract luminance: Lc = Fc[idx], Lp = Fp[idx]
   - Calculate difference: diff = |Lc - Lp|
   - If diff > THRESHOLD (25): increment changed_count
4. If changed_count > MIN_CHANGES (12):
   - Return TRUE (motion detected)
5. Store Fc as new Fp for next frame
6. Return FALSE (no motion)

Optimizations:
- Process only 1 frame per second (throttle)
- Early exit when threshold reached
- Skip frame processing if still processing previous detection
```

**Implementation Requirements:**

1. Create `useFrameProcessor` hook with Reanimated worklet
2. Extract Y-plane data from YUV frame buffer
3. Implement grid sampling (256 points, not all pixels)
4. Compare with previous frame using absolute difference
5. Maintain shared values for:
   - previousFrameData
   - lastProcessTime
   - isProcessing flag
6. Add throttling: process max 1 frame per second
7. Use `runOnJS` to trigger motion callback from worklet

**Expected Output:**
- Motion detection works accurately (>95% accuracy)
- Processes only 1 frame per second
- Uses <5% CPU when idle
- Triggers callback when motion detected

**Code Structure:**
```javascript
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  
  // Throttle: process only 1 fps
  if (now - lastProcessTime < 1000) return;
  
  // Extract Y-plane from YUV
  const currentLuminance = extractYPlane(frame);
  
  // Grid sampling comparison
  const motionDetected = compareFrames(
    currentLuminance, 
    previousLuminance,
    GRID_SIZE: 16,
    THRESHOLD: 25,
    MIN_CHANGES: 12
  );
  
  if (motionDetected && !isProcessing) {
    runOnJS(handleMotionDetected)();
  }
}, []);
```

---

### TASK 3: SEND THE PHOTO CAPTURE

**Objective:** Capture high-resolution photo only when motion is detected

**Requirements:**

1. Implement photo capture function using `camera.takePhoto()`
2. Configuration for photo capture:
   ```javascript
   {
     qualityPrioritization: 'speed',
     flash: 'off',
     enableShutterSound: false,
     skipMetadata: false
   }
   ```

3. Add metadata to captured photo:
   - Timestamp (ISO 8601 format)
   - GPS coordinates (latitude, longitude)
   - Device ID (unique identifier)
   - Battery level
   - CPU temperature (if available)

4. Implement debouncing: prevent multiple captures within 2 seconds

5. Store photo path and metadata in state

6. Create image preview component (optional, for debugging)

**Expected Output:**
- Photo captured in <500ms
- Resolution: 1920x1080 or device maximum
- Metadata included
- Photo path stored for processing

**Flow:**
```
Motion Detected → Wait 100ms (let motion stabilize) → Capture Photo → Extract Metadata → Pass to AI
```

---

### TASK 4: TENSORFLOW LITE INTEGRATION

**Objective:** Run on-device AI model to detect wild animals

**Model Specification:**
- **Type:** Object Detection (SSD MobileNet V2 or YOLO-tiny)
- **Input:** 300x300 or 416x416 RGB image
- **Output:** Array of detections with [class, confidence, bounding_box]
- **Classes:** leopard, elephant, tiger, deer, wild_boar, monkey, bear, etc.

**Requirements:**

1. Install and configure `react-native-fast-tflite`

2. Load TFLite model from assets:
   ```javascript
   const model = await loadTFLiteModel('animal_detection_model.tflite');
   ```

3. Implement image preprocessing:
   - Resize captured photo to model input size (e.g., 300x300)
   - Normalize pixel values (0-255 → 0-1 or -1 to 1 based on model)
   - Convert to required format (RGB)

4. Run inference:
   ```javascript
   const detections = await model.run(preprocessedImage);
   ```

5. Parse model output:
   - Extract detected objects
   - Filter by confidence threshold (>70%)
   - Filter by class (only wild animals, exclude humans/vehicles)
   - Get bounding box coordinates
   - Get species name and confidence score

6. Handle multiple detections (if multiple animals in frame)

7. Add error handling for model loading and inference failures

**Expected Output:**
```javascript
{
  detected: true,
  species: "leopard",
  confidence: 0.89,
  boundingBox: {x: 100, y: 150, width: 200, height: 300},
  inferenceTime: 450  // milliseconds
}
```

**Inference Optimization:**
- Run inference only when motion detected
- Use quantized model (int8) for faster inference
- Release model resources when not needed

---

### TASK 5: MQTT COMMUNICATION LAYER

**Objective:** Send detection alerts to server using lightweight MQTT protocol

**Requirements:**

1. Install and configure `react-native-mqtt`

2. Set up MQTT client:
   ```javascript
   const mqttClient = mqtt.connect('mqtt://your-broker-url:1883', {
     clientId: `aranyani_${deviceId}`,
     username: 'your_username',  // if required
     password: 'your_password',  // if required
     keepalive: 60,
     reconnectPeriod: 5000
   });
   ```

3. Implement connection handlers:
   - onConnect: log successful connection
   - onError: handle connection errors
   - onDisconnect: attempt reconnection

4. Create alert payload:
   ```javascript
   {
     device_id: "phone_abc123",
     timestamp: "2026-01-04T14:30:00.000Z",
     location: {
       latitude: 15.2993,
       longitude: 74.1240
     },
     detection: {
       species: "leopard",
       confidence: 0.89,
       bounding_box: {x: 100, y: 150, w: 200, h: 300}
     },
     image: "base64_thumbnail_or_url",
     metadata: {
       battery_level: 67,
       cpu_temp: 42.5,
       network_type: "4G"
     }
   }
   ```

5. Publish to topic:
   ```javascript
   mqttClient.publish('aranyani/detections', JSON.stringify(payload));
   ```

6. Implement image compression:
   - Create thumbnail (max 400x400)
   - Convert to base64 or upload to S3 and send URL
   - Keep payload under 100KB

7. Add offline queue:
   - Store alerts locally if no internet
   - Send when connection restored
   - Max queue size: 50 alerts

8. Implement retry logic with exponential backoff

**Expected Output:**
- MQTT connection established
- Alerts sent successfully within 2 seconds
- Offline alerts queued and sent later
- Payload size <100KB

---

### TASK 6: BACKGROUND SERVICE (24/7 OPERATION)

**Objective:** Keep app running 24/7 with screen off

**Requirements:**

1. Install `react-native-background-actions`

2. Create foreground service with notification:
   ```javascript
   const options = {
     taskName: 'AranyaniMonitoring',
     taskTitle: 'Forest Monitoring Active',
     taskDesc: 'Watching for wild animals...',
     taskIcon: {
       name: 'ic_launcher',
       type: 'mipmap',
     },
     color: '#00ff00',
     linkingURI: 'aranyani://home',
     parameters: {
       delay: 1000,
     },
   };
   ```

3. Implement background task that:
   - Keeps camera active
   - Continues motion detection
   - Maintains wake lock (CPU stays alive)
   - Works with screen OFF

4. Add thermal protection:
   ```javascript
   if (cpuTemp > 60) {
     reduceFpsTo(0.2);  // 1 frame every 5 seconds
   } else if (cpuTemp < 50) {
     restoreFpsTo(1);   // Back to 1 frame per second
   }
   ```

5. Add battery protection:
   ```javascript
   if (batteryLevel < 15) {
     stopService();
     sendLowBatteryAlert();
   }
   ```

6. Implement auto-restart on crash:
   - Use `WorkManager` (native module)
   - Check service health every 15 minutes
   - Restart if stopped unexpectedly

7. Add service controls:
   - Start service
   - Stop service
   - Restart service

8. Handle power button press:
   - Service continues when screen turns off
   - Service continues when phone locked

**Expected Output:**
- Service runs continuously with screen off
- Camera remains active
- Motion detection continues working
- App doesn't crash or stop
- Battery drain: 50-100 mAh/hour

---

### TASK 7: USER INTERFACE & MONITORING

**Objective:** Create simple UI for setup and monitoring

**Requirements:**

1. **Home Screen:**
   - Start/Stop monitoring button
   - Current status indicator (Active/Stopped)
   - Live stats display:
     - Battery level
     - CPU temperature
     - Frames processed today
     - Detections today
     - Network status

2. **Settings Screen:**
   - Motion sensitivity adjustment (threshold slider)
   - AI confidence threshold (70-95%)
   - MQTT server configuration
   - Enable/disable GPS
   - Test camera button
   - Test AI model button

3. **Detection History:**
   - List of recent detections
   - Thumbnail image
   - Species name
   - Confidence score
   - Timestamp
   - Tap to view full image

4. **Setup Wizard:**
   - Step 1: Grant permissions
   - Step 2: Configure MQTT server
   - Step 3: Mount phone on wall
   - Step 4: Test detection
   - Step 5: Start monitoring

5. **Debug Panel (for hackathon demo):**
   - Real-time frame processing visualization
   - Motion detection heatmap
   - AI inference time graph
   - Network latency
   - Storage usage

**Expected Output:**
- Clean, minimal UI
- Easy to set up
- Live statistics visible
- Professional appearance for demo

---

### TASK 8: OPTIMIZATION & POLISH

**Objective:** Fine-tune performance and add production features

**Requirements:**

1. **Battery Optimization:**
   - Profile battery usage
   - Ensure <100 mAh/hour consumption
   - Add adaptive FPS based on activity
   - Optimize worklet performance

2. **Error Handling:**
   - Camera errors (device busy, permission denied)
   - Model loading failures
   - Network errors (offline mode)
   - Storage full scenarios
   - Add proper error messages

3. **Performance Monitoring:**
   - Track FPS
   - Track inference time
   - Track memory usage
   - Log crashes and errors

4. **Local Storage:**
   - Use AsyncStorage for settings
   - Store detection history (last 100)
   - Cache model weights
   - Queue failed uploads

5. **Testing:**
   - Test 24-hour continuous operation
   - Test with screen off
   - Test in low battery scenarios
   - Test thermal throttling
   - Test offline operation
   - Test with different animals

6. **Documentation:**
   - Setup guide
   - API documentation
   - Deployment instructions
   - Troubleshooting guide

**Expected Output:**
- Stable 24-hour operation
- Proper error handling
- Performance metrics logged
- Ready for production deployment

---

## BATTERY EFFICIENCY TARGETS

| Component | Target | Actual (to be measured) |
|-----------|--------|-------------------------|
| Motion Detection | 30-50 mAh/hour | ___ mAh/hour |
| AI Inference (per detection) | 10-20 mAh | ___ mAh |
| MQTT Communication | 5-10 mAh/hour | ___ mAh/hour |
| GPS | 10-20 mAh/hour | ___ mAh/hour |
| **Total** | **50-100 mAh/hour** | ___ mAh/hour |

**Goal:** 24+ hours on single charge (3000 mAh battery)

**With Solar Panel (5W):** Infinite operation

---

## HACKATHON DEMO SCRIPT

### Setup (5 minutes before)
1. Mount phone on wall at eye level
2. Ensure good lighting
3. Connect to WiFi/mobile data
4. Open dashboard on laptop
5. Start monitoring service
6. Screen goes OFF (phone looks "dead")

### Demo Flow (5 minutes)

**[Show the mounted phone]**
"This is an old smartphone that most people would throw away. But we've converted it into an intelligent forest guardian."

**[Point to dark screen]**
"Notice the screen is completely OFF. It looks dead. But it's actually running our ultra-efficient 24/7 monitoring system."

**[Wave hand in front of camera]**
"When I create motion..."

**[Alert appears on laptop dashboard within 2 seconds]**
"...you see the alert appears instantly on our dashboard!"

**[Walk past camera]**
"The AI model has been trained to ignore humans like me..."

**[No alert sent]**
"...see, no alert."

**[Show stuffed animal or image of wild animal]**
"But when a wild animal appears..."

**[Alert with species name appears]**
"...it immediately detects the species, calculates confidence, and sends an alert with the image!"

**[Show statistics on dashboard]**
"Our system processes just 1 frame per second, uses low-resolution YUV format, and consumes only 50-80 milliamp-hours per hour."

**[Show calculation]**
"A typical old phone battery is 3000 mAh. Our app runs for 24-36 hours on a single charge."

**[Show solar panel]**
"Add this ₹500 solar panel, and it runs forever."

**[Show impact slide]**
"There are 30 million old smartphones sitting in drawers in India alone. We can convert them from e-waste into forest guardians for zero cost."

**[Final message]**
"Commercial CCTV costs ₹15,000. Our solution costs ₹0 for the device + ₹500 for solar. That's 96% cost reduction while addressing both e-waste and human-wildlife conflict."

---

## SUCCESS CRITERIA

### Technical (must achieve):
- ✅ Motion detection accuracy >95%
- ✅ False positive rate <5%
- ✅ AI inference time <500ms
- ✅ Battery consumption <100 mAh/hour
- ✅ 24-hour continuous operation without crash
- ✅ Works with screen OFF
- ✅ MQTT alerts within 2 seconds

### Demo (must show):
- ✅ Phone mounted, screen OFF, working
- ✅ Real-time alert on dashboard
- ✅ AI correctly identifies animal
- ✅ Live statistics display
- ✅ Battery consumption calculations

### Pitch (must include):
- ✅ Problem: human-wildlife conflict
- ✅ Solution: repurpose old phones
- ✅ Innovation: event-driven sensing
- ✅ Impact: 30M phones × ₹15,000 saved
- ✅ Sustainability: e-waste reduction

---

## TROUBLESHOOTING GUIDE

### Issue: High battery drain
**Solution:**
- Check FPS is actually 2 (not higher)
- Verify YUV format is being used
- Ensure grid sampling (not full frame processing)
- Check for memory leaks in worklet
- Disable auto-focus and image stabilization

### Issue: Motion detection not working
**Solution:**
- Increase motion threshold (try 20, 15, 10)
- Decrease MIN_CHANGES (try 10, 8, 5)
- Check lighting conditions
- Verify Y-plane extraction is correct
- Add logging to see pixel differences

### Issue: AI model slow inference
**Solution:**
- Use quantized (int8) model
- Reduce input resolution (300x300 instead of 416x416)
- Ensure model is loaded once (not per inference)
- Check GPU acceleration is enabled
- Profile inference time

### Issue: Service stops unexpectedly
**Solution:**
- Add to battery optimization whitelist
- Check wake lock is acquired
- Verify foreground notification is showing
- Add auto-restart mechanism
- Check logcat for crash logs

### Issue: MQTT connection fails
**Solution:**
- Verify broker URL and port
- Check network connectivity
- Try without username/password first
- Use public broker for testing (mqtt://test.mosquitto.org)
- Check firewall settings

---

## DEPLOYMENT CHECKLIST

- [ ] All permissions granted
- [ ] Battery optimization disabled for app
- [ ] MQTT broker configured
- [ ] AI model loaded successfully
- [ ] Location services enabled
- [ ] Storage space available (>1GB)
- [ ] Network connectivity verified
- [ ] Phone mounted securely
- [ ] Camera has clear view
- [ ] Foreground service notification showing
- [ ] Screen turns OFF and app continues
- [ ] First detection test successful
- [ ] Dashboard receiving alerts

---

## FINAL DELIVERABLES

1. **APK File:** Ready to install on any Android 8.0+ device
2. **Source Code:** Clean, well-commented, on GitHub
3. **Documentation:** Setup guide and API docs
4. **Demo Video:** 5-minute walkthrough
5. **Presentation:** 10 slides (problem, solution, tech, impact, demo)
6. **Dashboard:** Live monitoring interface
7. **Pitch Deck:** For judges and investors

---

## ESTIMATED TIMELINE

- **Day 1 (8 hours):** Tasks 1-2 (Setup + Motion Detection)
- **Day 2 (8 hours):** Tasks 3-4 (Photo Capture + AI)
- **Day 3 (8 hours):** Tasks 5-6 (MQTT + Background Service)
- **Day 4 (8 hours):** Tasks 7-8 (UI + Polish + Testing)

**Total:** 32 hours of focused development

---

**This document contains everything needed to build Project Aranyani. Start with Task 1 and proceed sequentially. Each task builds on the previous one. Good luck! 🚀🐆**