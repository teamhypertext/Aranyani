from ultralytics import YOLO
import cv2

# Path to your trained model
MODEL_PATH = r"d:\Project\Aranyani\tinyml\tinyml\01_Training_Workspace\models\version_1\weights\best.pt"

# SOURCE = 0  # Default Webcam
# To use Mobile Camera:
# 1. Install 'IP Webcam' app on Android.
# 2. Start Server on App.
# 3. Enter the URL shown (e.g. http://192.168.1.5:8080/video) below:
# SOURCE = 0 
SOURCE = "http://10.82.98.34:8080/video"
# SOURCE = "http://192.168.1.6:8080/video" # Example for Mobile

def run_inference():
    # Load model
    print("Loading model...")
    model = YOLO(MODEL_PATH)
    
    print(f"Starting Inference on source: {SOURCE}... Press 'q' to exit.")
    
    # Open source
    cap = cv2.VideoCapture(SOURCE)
    
    if not cap.isOpened():
        print(f"Error: Could not open source {SOURCE}.")
        print("If using Mobile Camera, checks:")
        print("1. Phone and PC are on SAME WiFi.")
        print("2. The URL is correct (ends in /video for some apps).")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Run YOLO inference
        results = model.predict(frame, conf=0.85, verbose=True)
        
        # Visualize results
        annotated_frame = results[0].plot()
        
        # Resize if frame is too big (Mobile cameras are often 1080p/4k)
        height, width = annotated_frame.shape[:2]
        if width > 1280:
            annotated_frame = cv2.resize(annotated_frame, (1280, int(height * 1280 / width)))

        # Display
        cv2.imshow("VanaRaksha - Animal Detection", annotated_frame)
        
        # Exit on 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_inference()
