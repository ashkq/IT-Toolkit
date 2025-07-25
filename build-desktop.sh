#!/bin/bash

# IT Hero Desktop Build Script
echo "🦸‍♂️ Building IT Hero Desktop Application 🛠️"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install desktop dependencies
echo "📦 Installing desktop dependencies..."
yarn add electron electron-builder express --dev

# Build React app
echo "🏗️ Building React application..."
yarn build

# Copy desktop package.json
echo "⚙️ Setting up desktop configuration..."
cp package-desktop.json package.json

# Create assets directory and icon placeholder
mkdir -p assets
if [ ! -f "assets/icon.png" ]; then
    echo "⚠️ Note: Place your app icon as assets/icon.png for better branding"
fi

# Build desktop application
echo "🔨 Building desktop executable..."
yarn electron-pack

echo ""
echo "✅ Build complete!"
echo "📁 Check the 'dist' folder for your executable files:"
echo "   - Windows: IT-Hero-Setup.exe"
echo "   - macOS: IT-Hero.dmg"  
echo "   - Linux: IT-Hero.AppImage"
echo ""
echo "🚀 Users can now download and run these files directly!"