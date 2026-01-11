# VanaRaksha Training Workspace (YOLO11n)

This directory contains the complete pipeline for training the **VanaRaksha** wildlife detection model (YOLO11n).

## 📂 Directory Structure

- **`data/`**: Contains the dataset.
  - `raw/`: Sourced images (Elephant, Wild Boar, etc.).
  - `processed/`: Formatted for YOLO (Split into `train`/`val`/`test`).
- **`notebooks/`**: Python scripts for data management and training.
- **`models/`**: (Created during training) Saved model checkpoints.
- **`classes.txt`**: List of object classes.
- **`data.yaml`**: Configuration file for YOLO training.

## 🛠 Scripts & Workflow

### 1. Data Cleaning (`notebooks/data_preprocessing.py`)

**Goal**: Organizes raw images, removes duplicates, and creates the folder structure.

```bash
python notebooks/data_preprocessing.py
```

### 2. Background Filtering (`notebooks/clean_background.py`)

**Goal**: Ensures "Background" images are pure. Uses a pre-trained YOLO model to delete any background images that accidentally contain animals (Deer, Giraffes, etc.).

```bash
python notebooks/clean_background.py
```

### 3. Manual Labeling

**Goal**: Annotate target animals.

- **Tool**: LabelImg.
- **Helper Scripts**:
  - `../start_labeling.bat`: Launches annotation for Training set.
  - `../start_labeling_val.bat`: Launches annotation for Validation set.
- **Classes**: Defined in `classes.txt` (Elephant, Wild Boar, Cattle, Leopard, Cheetah, Human, Dog).

### 4. Training (`notebooks/train_model.py`)

**Goal**: Trains the YOLO11n model on the labeled data.

```bash
python notebooks/train_model.py
```

- **Epochs**: 50 (Default)
- **Model**: YOLO11n (Nano) - Optimized for Edge Devices.

## 📋 Classes

1. Elephant
2. Wild Boar
3. Cattle
4. Leopard
5. Cheetah
6. Human

## ✅ Quick Start

1. **Prepare Data**: Run scripts 1 & 2.
2. **Label**: Run batch files and annotate images.
3. **Train**: Run script 4.
