from ultralytics import YOLO

# Paths
MODEL_PATH = r"d:\Project\Aranyani\tinyml\tinyml\01_Training_Workspace\models\version_1\weights\best.pt"
DATA_YAML  = r"d:\Project\Aranyani\tinyml\tinyml\01_Training_Workspace\data.yaml"

def convert_to_tflite():
    print(f"Loading model from {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
    
    print("Starting conversion to TFLite (Int8 Quantization)...")
    # TFLite Int8 export requires a representative dataset for calibration.
    # Ultralytics uses the 'data' argument to find images for this.
    model.export(
        format="tflite", 
        int8=True, 
        data=DATA_YAML, 
        imgsz=640
    )
    print("Conversion Complete.")

if __name__ == "__main__":
    convert_to_tflite()
