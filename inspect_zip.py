import zipfile
import os

zip_path = "só arrastar para deploy ultima atualização Xzenpress.zip"
try:
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        print("Listing files in zip:")
        for file in zip_ref.namelist():
            if "Sounds" in file or "Jornada" in file:
                print(file)
except Exception as e:
    print(f"Error reading zip: {e}")
