import cv2 as cv
import os
import glob

class DatasetCropper:
    def __init__(self, source_dir, output_dir):
        """
        Initialize the DatasetCropper.
        
        Args:
            source_dir (str): Base directory containing 'labels' and 'images' subdirectories.
            output_dir (str): Directory where cropped images will be saved.
        """
        self.label_dir = os.path.join(source_dir, "labels")
        self.image_dir = os.path.join(source_dir, "images")
        self.output_dir = output_dir
        self.count = 0
        
        os.makedirs(self.output_dir, exist_ok=True)

    def process_dataset(self):
        """Iterate through all label files and process them."""
        if not os.path.exists(self.label_dir):
            print(f"Error: Label directory not found at {self.label_dir}")
            return

        label_files = glob.glob(os.path.join(self.label_dir, "*.txt"))
        print(f"Found {len(label_files)} label files.")

        for label_path in label_files:
            self.process_single_file(label_path)
            
        print(f"Processing complete. Total crops saved: {self.count}")

    def process_single_file(self, label_path):
        """
        Process a single label file and its corresponding image.
        
        Args:
            label_path (str): Path to the label file.
        """
        filename = os.path.basename(label_path)
        if filename == "classes.txt":
            return
            
        image_name = filename.replace(".txt", ".jpg")
        image_path = os.path.join(self.image_dir, image_name)
        
        if not os.path.exists(image_path):
            print(f"Image not found: {image_path}")
            return

        image = cv.imread(image_path)
        if image is None:
            print(f"Failed to load image: {image_path}")
            return
            
        with open(label_path, 'r') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            try:
                self.crop_and_save_object(image, line, image_name, i)
            except ValueError as e:
                print(f"Error parsing line in {filename}: {e}")

    def crop_and_save_object(self, image, label_line, original_filename, index):
        """
        Parse label line, crop the object, and save it.
        
        Args:
            image (numpy.ndarray): The source image.
            label_line (str): A single line from the YOLO label file.
            original_filename (str): Name of the original image file.
            index (int): Index of the object in the image (to ensure unique filenames).
        """
        img_height, img_width = image.shape[:2]
        
        content = label_line.strip().split(" ")
        content = [float(x) for x in content]
        
        class_id, x_center_norm, y_center_norm, width_norm, height_norm = content
        
        x_center = x_center_norm * img_width
        y_center = y_center_norm * img_height
        width  = width_norm * img_width
        height = height_norm * img_height 

        x_min = x_center - width / 2
        y_min = y_center - height / 2 
        x_max = x_center + width / 2
        y_max = y_center + height / 2 

        x1 = int(max(0, x_min))
        y1 = int(max(0, y_min))
        x2 = int(min(img_width, x_max))
        y2 = int(min(img_height, y_max))

        if x2 > x1 and y2 > y1:
            cropped_image = image[y1:y2, x1:x2]
            
            resized_image = cv.resize(cropped_image, (96, 96))
            
            base_name = os.path.splitext(original_filename)[0]
            save_name = f"{base_name}_{index}.jpg"
            save_path = os.path.join(self.output_dir, save_name)
            
            cv.imwrite(save_path, resized_image)
            self.count += 1
        else:
             print(f"Invalid crop dimensions for {original_filename} object {index}: {x1},{y1} to {x2},{y2}")

if __name__ == "__main__":
    TRAIN_DIR = r"D:\\Project\\Aranyani\\tinyml\\01_Training_Workspace\\data\\processed\\train"
    OUTPUT_DIR = r"D:\\Project\\Aranyani\\CustomModels\\data\\train"
    
    cropper = DatasetCropper(TRAIN_DIR, OUTPUT_DIR)
    cropper.process_dataset()
