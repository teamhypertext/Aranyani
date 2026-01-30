import os
import shutil
import glob

SOURCE_IMAGES_DIR = r"D:\Project\Aranyani\CustomModels\data\train"
LABELS_DIR = r"D:\Project\Aranyani\tinyml\01_Training_Workspace\data\processed\train\labels"
OUTPUT_DATASET_DIR = r"D:\Project\Aranyani\CustomModels\dataset"

def load_classes(labels_dir):
    """
    Load class names from classes.txt.
    Returns a dictionary mapping class_id (int) to class_name (str).
    """
    classes_path = os.path.join(labels_dir, "classes.txt")
    if not os.path.exists(classes_path):
        raise FileNotFoundError(f"classes.txt not found at {classes_path}")
    
    with open(classes_path, 'r') as f:
        class_names = [line.strip() for line in f.readlines() if line.strip()]
    
    return {i: name for i, name in enumerate(class_names)}

def organize_data():
    """
    Organize images into class-specific folders based on YOLO label files.
    """
    print(f"Source Images: {SOURCE_IMAGES_DIR}")
    print(f"Labels Dir: {LABELS_DIR}")
    print(f"Output Dataset: {OUTPUT_DATASET_DIR}")

    # 1. Load Classes
    try:
        class_map = load_classes(LABELS_DIR)
        print(f"Loaded {len(class_map)} classes: {class_map}")
    except FileNotFoundError as e:
        print(e)
        return

    # 2. Prepare Output Directory
    if not os.path.exists(OUTPUT_DATASET_DIR):
        os.makedirs(OUTPUT_DATASET_DIR)
        print(f"Created output directory: {OUTPUT_DATASET_DIR}")
    
    # Create class subdirectories
    for class_name in class_map.values():
        class_dir = os.path.join(OUTPUT_DATASET_DIR, class_name)
        os.makedirs(class_dir, exist_ok=True)

    # 3. Process Label Files
    label_files = glob.glob(os.path.join(LABELS_DIR, "*.txt"))
    count_moved = 0
    count_missing = 0

    print(f"Found {len(label_files)} label files to process.")

    for label_path in label_files:
        filename = os.path.basename(label_path)
        if filename == "classes.txt":
            continue

        # Derived logic from 01_CropNSave.py:
        # The crop script iterates lines in the label file.
        # Line 0 -> {base_name}_0.jpg
        # Line 1 -> {base_name}_1.jpg
        
        base_name = os.path.splitext(filename)[0]
        
        with open(label_path, 'r') as f:
            lines = f.readlines()

        for i, line in enumerate(lines):
            try:
                # Parse class_id associated with this object
                parts = line.strip().split()
                if not parts:
                    continue
                class_id = int(parts[0])
                class_name = class_map.get(class_id)
                
                if class_name is None:
                    print(f"Warning: Unknown class ID {class_id} in {filename}")
                    continue

                # Construct expected cropped image filename
                image_name = f"{base_name}_{i}.jpg"
                src_path = os.path.join(SOURCE_IMAGES_DIR, image_name)
                dst_path = os.path.join(OUTPUT_DATASET_DIR, class_name, image_name)

                if os.path.exists(src_path):
                    shutil.copy2(src_path, dst_path)
                    count_moved += 1
                else:
                    print(f"Image not found (maybe invalid crop): {src_path}") 
                    count_missing += 1

            except ValueError:
                print(f"Error parsing line {i} in {filename}")

    print("-" * 30)
    print(f"Organization Complete.")
    print(f"Total images copied: {count_moved}")
    print(f"Missing/Skipped images: {count_missing}")
    
    
    print("\nVerifying Dataset Structure:")
    
    sorted_classes = sorted(list(class_map.values()))
    print("Expected Label Indices (Alphabetical Order):")
    for idx, name in enumerate(sorted_classes):
        print(f"Label {idx}: {name}")

if __name__ == "__main__":
    organize_data()
