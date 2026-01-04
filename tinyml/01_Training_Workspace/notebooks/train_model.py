from ultralytics import YOLO
import os

def train_model():
    model = YOLO("yolo11n.pt") 

    # 2. Train
    # data: data.yaml
    # epochs: 50
    # imgsz: 640 (image resolution)
    # project: saving models
    results = model.train(
        data=r"d:\Project\Aranyani\tinyml\01_Training_Workspace\data.yaml",
        epochs=50,
        imgsz=640,
        project=r"d:\Project\Aranyani\tinyml\01_Training_Workspace\models",
        name="vana_raksha_v1",
        batch=16,     
        device='cpu'  
    )
    
   
    metrics = model.val()
    print(f"mAP50: {metrics.box.map50}")
    

if __name__ == "__main__":
    train_model()
