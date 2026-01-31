import os
from PIL import Image, ImageDraw, ImageOps

source_logo = r"public/Logo Xzenpress oficial.png"
android_res_dir = r"android/app/src/main/res"

sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

def generate_icons():
    if not os.path.exists(source_logo):
        print(f"Error: Source logo not found at {source_logo}")
        return

    try:
        img = Image.open(source_logo).convert("RGBA")
        print(f"Opened source logo: {img.size}")

        for folder, size in sizes.items():
            target_dir = os.path.join(android_res_dir, folder)
            if not os.path.exists(target_dir):
                print(f"Creating directory: {target_dir}")
                os.makedirs(target_dir)
            
            # multiple files to update
            # ic_launcher.png (square/legacy)
            # ic_launcher_round.png (round)
            # ic_launcher_foreground.png (adaptive foreground)
            
            # 1. Standard Laucher (Square-ish)
            # Resize
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(os.path.join(target_dir, "ic_launcher.png"))
            print(f"Saved {folder}/ic_launcher.png ({size}x{size})")

            # 2. Round Launcher
            # Create a circular mask
            mask = Image.new('L', (size, size), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((0, 0, size, size), fill=255)
            
            # Apply mask
            rounded = ImageOps.fit(img, (size, size), centering=(0.5, 0.5))
            rounded.putalpha(mask)
            rounded.save(os.path.join(target_dir, "ic_launcher_round.png"))
            print(f"Saved {folder}/ic_launcher_round.png ({size}x{size})")
            
            # 3. Foreground (for adaptive)
            # Usually distinct, but we'll use the logo as foreground
            # Adaptive icons are usually 108x108 for mdpi, etc.
            # But the 'sizes' dict above is for standard icons. 
            # Adaptive sizes are: mdpi:108, hdpi:162, xhdpi:216, xxhdpi:324, xxxhdpi:432
            # We'll valid approximation using the standard map for now to fix the main visual.
            # actually foreground needs to be larger. 
            # multiplier = 108/48 = 2.25
            
            adaptive_size = int(size * 108 / 48)
            resized_adaptive = img.resize((adaptive_size, adaptive_size), Image.Resampling.LANCZOS)
            resized_adaptive.save(os.path.join(target_dir, "ic_launcher_foreground.png"))
            print(f"Saved {folder}/ic_launcher_foreground.png ({adaptive_size}x{adaptive_size})")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_icons()
