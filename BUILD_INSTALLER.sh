#!/bin/bash

# 🦸‍♂️ IT Hero Desktop Installer Builder
# =====================================
# This script builds the desktop installer for IT Hero
# Run this script to create the installer files that users can download

echo "🦸‍♂️ IT Hero Desktop Installer Builder"
echo "======================================"
echo ""
echo "Building desktop installer for IT Hero Security & Diagnostic Toolkit"
echo "This will create installer files that users can download and run"
echo ""

# Navigate to frontend directory
cd frontend

# Check if assets/icon.png exists
if [ ! -f "assets/icon.png" ]; then
    echo "⚠️  WARNING: No app icon found!"
    echo "   Place your app icon as 'frontend/assets/icon.png' before building"
    echo "   This will be used as the desktop icon users see"
    echo ""
fi

# Install desktop dependencies
echo "📦 Installing desktop dependencies..."
npm install electron electron-builder express --save-dev

# Build React app
echo "🏗️ Building React application..."
npm run build

# Backup original package.json
cp package.json package.json.backup

# Use desktop package.json for building
cp package-desktop.json package.json

# Create icon files for all platforms if PNG exists
if [ -f "assets/icon.png" ]; then
    echo "🎨 Converting icon for all platforms..."
    
    # For Windows (.ico) - you may need to install imagemagick
    # convert assets/icon.png -resize 256x256 assets/icon.ico
    
    # For macOS (.icns) - you may need to install imagemagick
    # convert assets/icon.png -resize 512x512 assets/icon.icns
    
    echo "   Note: Place icon.ico and icon.icns in assets/ for Windows and macOS"
fi

# Build desktop application
echo "🔨 Building desktop executable..."
npx electron-builder --publish=never

# Restore original package.json
mv package.json.backup package.json

echo ""
echo "✅ BUILD COMPLETE!"
echo "📁 Installer files created in 'frontend/dist' folder:"
echo ""
echo "   📥 USERS DOWNLOAD THESE FILES:"
echo "   ================================"
echo "   🪟 Windows: IT-Hero-Setup.exe"
echo "   🍎 macOS: IT-Hero.dmg"
echo "   🐧 Linux: IT-Hero.AppImage"
echo ""
echo "👥 WHAT USERS DO:"
echo "1. Download the appropriate file for their operating system"
echo "2. Double-click the downloaded file"
echo "3. Follow the installation prompts"
echo "4. IT Hero will be installed and ready to use!"
echo ""
echo "🚀 The installed app will automatically:"
echo "   - Start the backend server in the background"
echo "   - Open IT Hero in their default browser"
echo "   - No terminal windows or technical setup required!"