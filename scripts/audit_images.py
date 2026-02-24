import os
import re

project_root = r"C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus-GitHub"
public_dir = os.path.join(project_root, "public")
src_dir = os.path.join(project_root, "src")

# Collect all files in public as URL paths
public_files = set()
for root, dirs, files in os.walk(public_dir):
    for f in files:
        full_path = os.path.join(root, f)
        relative = full_path.replace(public_dir, "").replace("\\", "/")
        public_files.add(relative)

# Find all image references in TS/TSX source files
pattern = re.compile(r"image:\s*'(/[^']+)'")
missing = {}  # img_path -> list of (file, line)
found = {}    # img_path -> list of (file, line)
seen_missing = set()

skip_extensions = {".bak.ts"}
skip_files = {"acupressurePoints.bak.ts"}

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if not (f.endswith(".ts") or f.endswith(".tsx")):
            continue
        if f in skip_files or f.endswith(".bak.ts"):
            continue
        full_path = os.path.join(root, f)
        rel_path = full_path.replace(project_root + "\\", "")
        with open(full_path, "r", encoding="utf-8", errors="ignore") as fh:
            for i, line in enumerate(fh, 1):
                m = pattern.search(line)
                if m:
                    img = m.group(1)
                    if img in public_files:
                        found.setdefault(img, []).append((rel_path, i))
                    else:
                        missing.setdefault(img, []).append((rel_path, i))

print(f"=== IMAGE AUDIT ===")
print(f"Total public files: {len(public_files)}")
print(f"Unique missing images: {len(missing)}")
print(f"Unique OK images: {len(found)}")
print()
print("=== MISSING IMAGES (unique, with one example location) ===")
for img_path in sorted(missing.keys()):
    ex_file, ex_line = missing[img_path][0]
    count = len(missing[img_path])
    print(f"  {img_path}  (used {count}x, first in {ex_file}:{ex_line})")
print()
print("=== FOUND / WORKING IMAGES ===")
for img_path in sorted(found.keys()):
    print(f"  OK  {img_path}")
