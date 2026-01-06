@echo off
echo Starting LabelImg with VanaRaksha Classes...
echo Images: 01_Training_Workspace\data\processed\train\images
echo Classes: 01_Training_Workspace\classes.txt

"d:\Project\Aranyani\tinyml\.venv\Scripts\labelImg.exe" "d:\Project\Aranyani\tinyml\01_Training_Workspace\data\processed\train\images" "d:\Project\Aranyani\tinyml\01_Training_Workspace\classes.txt"

