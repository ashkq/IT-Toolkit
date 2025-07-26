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

# Clean up previous builds
rm -rf dist node_modules

# Install all dependencies fresh
echo "📦 Installing dependencies..."
npm install

# Install desktop dependencies
echo "📦 Installing desktop dependencies..."
npm install electron electron-builder express get-intrinsic side-channel side-channel-map qs --save-dev

# Build React app
echo "🏗️ Building React application..."
npm run build

# Backup original package.json
cp package.json package.json.backup

# Use desktop package.json for building
cp package-desktop.json package.json

# Install desktop dependencies with the new package.json
echo "📦 Installing desktop build dependencies..."
npm install

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
echo "🚀 UPLOAD THESE FILES TO GITHUB:"
echo "   Just upload the files from frontend/dist/ to your GitHub Releases"
echo "   Users can then download and install directly - no command line needed!"
echo ""