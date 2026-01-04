import os
import shutil
import hashlib
import pandas as pd
from PIL import Image
import random
from tqdm import tqdm
import warnings


RAW_DATA_DIR = r"d:\Project\Aranyani\tinyml\01_Training_Workspace\data\raw"
PROCESSED_DATA_DIR = r"d:\Project\Aranyani\tinyml\01_Training_Workspace\data\processed"
MANIFEST_FILE = r"d:\Project\Aranyani\tinyml\01_Training_Workspace\data\dataset_manifest.csv"


CLASS_MAPPING = {
    "elephant_raw": "Elephant",
    "wild_boar_raw": "Wild Boar",
    "cattle": "Cattle",
    "leopard_raw": "Leopard",
    "cheetah_raw": "Cheetah",
    "Serengeti": "Background"   
}


VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp'}

def calculate_hash(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def is_valid_image(file_path):
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False

def determine_class_from_filename(filename, default_class):
    fname = filename.lower()
    
    if default_class == "Background":
        return default_class
        
    if "leopard" in fname:
        return "Leopard"
    elif "cheetah" in fname:
        return "Cheetah"
    elif "elephant" in fname:
        return "Elephant"
    elif "cattle" in fname or "cow" in fname:
        return "Cattle"
    elif "wild_boar" in fname or "wild boar" in fname or "wildboar" in fname or "boar" in fname:
        return "Wild Boar"
    
    return default_class

def setup_directories():
    if os.path.exists(PROCESSED_DATA_DIR):
        print(f"Cleaning existing directory: {PROCESSED_DATA_DIR}")
        shutil.rmtree(PROCESSED_DATA_DIR)
    
    for split in ['train', 'val', 'test']:
        os.makedirs(os.path.join(PROCESSED_DATA_DIR, split, 'images'), exist_ok=True)
        os.makedirs(os.path.join(PROCESSED_DATA_DIR, split, 'labels'), exist_ok=True)

def process_data():
    setup_directories()
    
    manifest_data = []
    seen_hashes = set()
    
    print("Starting data processing...")
    all_images = []
    
    for folder_name in os.listdir(RAW_DATA_DIR):
        folder_path = os.path.join(RAW_DATA_DIR, folder_name)
        if not os.path.isdir(folder_path):
            continue
            
        class_name = CLASS_MAPPING.get(folder_name, "Other")
        
        for root, _, files in os.walk(folder_path):
            if folder_name == "Serengeti":
                if "blank" not in root.lower():
                    continue

            for file in files:
                if os.path.splitext(file)[1].lower() in VALID_EXTENSIONS:
                    full_path = os.path.join(root, file)
                    final_class = determine_class_from_filename(file, class_name)
                    all_images.append((full_path, final_class))

    print(f"Found {len(all_images)} total candidate images.")

    
    valid_images_map = { 'train': [], 'val': [], 'test': [] }
    
    images_by_class = {}
    for path, cls in all_images:
        if cls not in images_by_class:
            images_by_class[cls] = []
        images_by_class[cls].append(path)
        
    for cls, paths in images_by_class.items():
        print(f"Processing class: {cls} ({len(paths)} images)...")
        clean_paths = []
        for p in tqdm(paths, desc=f"Validating {cls}"):
            if is_valid_image(p):
                file_hash = calculate_hash(p)
                if file_hash not in seen_hashes:
                    seen_hashes.add(file_hash)
                    clean_paths.append(p)
        
        if len(clean_paths) == 0:
            print(f"Warning: No valid images for class {cls}")
            continue
            
        random.shuffle(clean_paths)
        total_images = len(clean_paths)
        train_end = int(total_images * 0.7)
        val_end = int(total_images * 0.9) # 70% + 20% = 90%
        
        train_imgs = clean_paths[:train_end]
        val_imgs = clean_paths[train_end:val_end]
        test_imgs = clean_paths[val_end:]
        
        valid_images_map['train'].extend([(p, cls) for p in train_imgs])
        valid_images_map['val'].extend([(p, cls) for p in val_imgs])
        valid_images_map['test'].extend([(p, cls) for p in test_imgs])
    
    global_index = 0
    
    for split, items in valid_images_map.items():
        for original_path, cls in tqdm(items, desc=f"Writing {split} set"):
            global_index += 1
            
            ext = os.path.splitext(original_path)[1]
            new_filename = f"{cls}_{global_index}{ext}"
            new_image_path = os.path.join(PROCESSED_DATA_DIR, split, 'images', new_filename)
            
            
            shutil.copy2(original_path, new_image_path)
            
            label_dir = os.path.join(PROCESSED_DATA_DIR, split, 'labels')
            label_filename = f"{cls}_{global_index}.txt"
            label_path = os.path.join(label_dir, label_filename)
            
            if cls == "Background":
                with open(label_path, 'w') as f:
                    pass
            else:
                pass
            
            manifest_data.append({
                'original_path': original_path,
                'processed_path': new_image_path,
                'split': split,
                'class': cls,
                'hash': calculate_hash(original_path)
            })

    df = pd.DataFrame(manifest_data)
    df.to_csv(MANIFEST_FILE, index=False)
    print(f"Processing complete. Manifest saved to {MANIFEST_FILE}")
    print(f"Total processed images: {len(df)}")

if __name__ == "__main__":
    process_data()
