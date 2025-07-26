#!/usr/bin/env python3
"""
Simple icon converter for IT Hero
Converts PNG to ICO format for better Windows support
"""

import os
from PIL import Image

def convert_png_to_ico(png_path, ico_path):
    """Convert PNG to ICO format"""
    try:
        # Open the PNG image
        img = Image.open(png_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Resize to common icon sizes
        sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        icons = []
        
        for size in sizes:
            icon = img.resize(size, Image.Resampling.LANCZOS)
            icons.append(icon)
        
        # Save as ICO
        icons[0].save(ico_path, format='ICO', sizes=[(icon.width, icon.height) for icon in icons])
        print(f"✅ Created: {ico_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting icon: {e}")
        return False

def main():
    assets_dir = "assets"
    png_path = os.path.join(assets_dir, "icon.png")
    ico_path = os.path.join(assets_dir, "icon.ico")
    
    if not os.path.exists(png_path):
        print(f"❌ Icon not found: {png_path}")
        print("Please place your icon.png file in the assets/ directory")
        return
    
    print("🎨 Converting icon.png to icon.ico...")
    if convert_png_to_ico(png_path, ico_path):
        print("✅ Icon conversion complete!")
        print(f"✅ Windows icon ready: {ico_path}")
    else:
        print("❌ Icon conversion failed!")

if __name__ == "__main__":
    main()