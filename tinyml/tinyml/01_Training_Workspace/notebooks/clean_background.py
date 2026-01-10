import os
import shutil
import pandas as pd
from ultralytics import YOLO
from tqdm import tqdm
import logging


PROCESSED_DATA_DIR = r"d:\Project\Aranyani\tinyml\01_Training_Workspace\data\processed"
MANIFEST_FILE = r"d:\Project\Aranyani\tinyml\01_Training_Workspace\data\dataset_manifest.csv"
CONF_THRESHOLD = 0.25  # Standard YOLO confidence


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def clean_backgrounds():
    
    model = YOLO("yolo11n.pt") 
    
    df = pd.read_csv(MANIFEST_FILE)
    initial_count = len(df)
    
 
    background_df = df[df['class'] == 'Background']
    logger.info(f"Scanning {len(background_df)} background images for hidden objects...")
    
    images_to_delete = []
    
    for idx, row in tqdm(background_df.iterrows(), total=len(background_df)):
        img_path = row['processed_path']
        
        if not os.path.exists(img_path):
            continue
            
        results = model(img_path, verbose=False, conf=CONF_THRESHOLD)
        
        if len(results[0].boxes) > 0:
            detected_classes = [model.names[int(c)] for c in results[0].boxes.cls]
            images_to_delete.append(row['processed_path'])

    logger.info(f"Found {len(images_to_delete)} 'polluted' images to delete.")
    
    deleted_count = 0
    for file_path in images_to_delete:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
            
            label_path = file_path.replace('images', 'labels').replace('.jpg', '.txt').replace('.png', '.txt')
            if os.path.exists(label_path):
                os.remove(label_path)
                
            deleted_count += 1
        except Exception as e:
            logger.error(f"Error deleting {file_path}: {e}")
            
    if deleted_count > 0:
        df_clean = df[~df['processed_path'].isin(images_to_delete)]
        df_clean.to_csv(MANIFEST_FILE, index=False)
        logger.info(f"Manifest updated. Removed {deleted_count} entries. New total: {len(df_clean)}")
    else:
        logger.info("No images deleted.")

if __name__ == "__main__":
    clean_backgrounds()
