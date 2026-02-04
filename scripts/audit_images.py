import re
import os

# Caminhos
points_file = r"src/data/acupressurePoints.ts"
public_dir = r"public"

# Regex para encontrar imagens
image_pattern = re.compile(r"image:\s*'([^']+)'")

# Ler arquivo de pontos
with open(points_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extrair todas as imagens
matches = image_pattern.findall(content)

print(f"Total de referências de imagem encontradas: {len(matches)}")

missing_files = []
existing_files = []

for img_path in matches:
    # Remove a barra inicial se existir para verificar no sistema de arquivos
    clean_path = img_path.lstrip('/')
    full_path = os.path.join(public_dir, clean_path)
    
    if os.path.exists(full_path):
        existing_files.append(img_path)
    else:
        missing_files.append(img_path)

print(f"\n✅ Imagens encontradas: {len(existing_files)}")
print(f"❌ Imagens faltando: {len(missing_files)}")

if missing_files:
    print("\nLista de imagens FALTANTES:")
    for missing in missing_files:
        print(f" - {missing}")
else:
    print("\n🎉 Todas as imagens estão presentes!")
