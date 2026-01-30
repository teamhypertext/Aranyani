import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import numpy as np

# Core Config
IMG_SIZE = 96
ALPHA = 0.35 
BATCH_SIZE = 32
EPOCHS = 30
DATASET_DIR = r"D:\Project\Aranyani\CustomModels\dataset"
QUANTIZED_MODEL_NAME = "best.tflite"

def create_model(num_classes):
    """
    Creates a MobileNetV2 (Alpha 0.35) model for transfer learning.
    """
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet',
        alpha=ALPHA
    )
    base_model.trainable = False  # Freeze base layers for initial training

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def representative_data_gen():
    """
    Generator function for TFLite representative dataset.
    Needed for full INT8 quantization.
    """
    # Create a separate generator just for quantization sample
    # We need raw images (rescaled) but without heavy augmentation if possible, 
    # though reusing the validation generator is a common strategy.
    # Here we manually load reasonable number of images to be safe.
    
    # Simple strategy: iterate through dataset folder and pick first 100 images
    count = 0
    for root, dirs, files in os.walk(DATASET_DIR):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(root, file)
                img = tf.keras.preprocessing.image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
                img_array = tf.keras.preprocessing.image.img_to_array(img)
                img_array = img_array / 255.0  # Normalize
                img_array = np.expand_dims(img_array, axis=0)
                yield [img_array]
                
                count += 1
                if count >= 100:
                    return

def main():
    if not os.path.exists(DATASET_DIR):
        print(f"Error: Dataset directory not found at {DATASET_DIR}")
        return

    # 1. Data Load and Augment
    print("Loading Data...")
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        horizontal_flip=True,
        width_shift_range=0.2,
        height_shift_range=0.2,
        zoom_range=0.2,
        validation_split=0.2
    )

    train_data = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    val_data = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )
    
    num_classes = train_data.num_classes
    print(f"Classes found: {train_data.class_indices}")

    # 2. Model Architecture
    print("Creating Model...")
    model = create_model(num_classes)
    model.summary()

    # 3. Train
    print(f"Starting Training for {EPOCHS} epochs...")
    history = model.fit(
        train_data,
        epochs=EPOCHS,
        validation_data=val_data
    )
    
    # Save base model
    model.save("best.h5")
    print("Base model saved as model_base.h5")

    # 4. Quantization (INT8)
    print("Starting Post-Training Quantization (INT8)...")
    
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.representative_dataset = representative_data_gen
    
    # Ensure full integer quantization for ESP32
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    converter.inference_input_type = tf.int8
    converter.inference_output_type = tf.int8
    
    tflite_model = converter.convert()
    
    with open(QUANTIZED_MODEL_NAME, "wb") as f:
        f.write(tflite_model)
        
    print(f"Quantized model saved as {QUANTIZED_MODEL_NAME}")
    
    file_size = os.path.getsize(QUANTIZED_MODEL_NAME) / 1024
    print(f"Model Size: {file_size:.2f} KB")

if __name__ == "__main__":
    main()