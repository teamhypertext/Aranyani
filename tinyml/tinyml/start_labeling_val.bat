@echo off
echo Starting LabelImg for Validation Set...
echo Images: 01_Training_Workspace\data\processed\val\images
echo Classes: 01_Training_Workspace\classes.txt

"d:\Project\Aranyani\tinyml\.venv\Scripts\labelImg.exe" "d:\Project\Aranyani\tinyml\01_Training_Workspace\data\processed\val\images" "d:\Project\Aranyani\tinyml\01_Training_Workspace\classes.txt"

pause
