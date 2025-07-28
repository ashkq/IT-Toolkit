#!/bin/bash

echo "🦸‍♂️ IT Hero Desktop Builder - FIXED VERSION"
echo "=============================================="
echo ""
echo "Building desktop installer for IT Hero Security & Diagnostic Toolkit"
echo "This creates installer files that users can download and run"
echo ""

# Navigate to frontend directory
cd frontend

# Check if icon files exist (they should be fixed now)
if [ -f "assets/icon.png" ] && [ -f "assets/icon.ico" ] && [ -f "assets/icon.icns" ]; then
    echo "✅ All icon files found and ready!"
else
    echo "⚠️  WARNING: Some icon files are missing!"
    echo "   Icon files should be in frontend/assets/"
fi
echo ""

# Step 1: Build React App
echo "📦 Installing React dependencies..."
yarn install

echo "🏗️ Building React application..."
yarn build

if [ ! -d "build" ]; then
    echo "❌ React build failed! Cannot continue."
    exit 1
fi

echo "✅ React app built successfully!"
echo ""

# Step 2: Backup and Switch to Desktop Config
echo "🔄 Switching to desktop configuration..."
cp package.json package.json.backup
cp package-desktop.json package.json

# Step 3: Install Desktop Dependencies
echo "📦 Installing desktop dependencies..."
yarn install

# Step 4: Build Desktop App
echo "🔨 Building desktop application..."
echo "   This may take a few minutes..."
yarn dist

# Step 5: Restore Original Config
echo "🔄 Restoring original configuration..."
cp package.json.backup package.json

echo ""
echo "✅ BUILD COMPLETE!"
echo "📁 Installer files created in 'frontend/dist' folder:"
echo ""

# Show what was created
if [ -d "dist" ]; then
    echo "   📥 FILES READY FOR UPLOAD:"
    echo "   ==========================="
    ls -la dist/*.AppImage 2>/dev/null && echo "   🐧 Linux: $(basename dist/*.AppImage 2>/dev/null)"
    ls -la dist/*.exe 2>/dev/null && echo "   🪟 Windows: $(basename dist/*.exe 2>/dev/null)"
    ls -la dist/*.dmg 2>/dev/null && echo "   🍎 macOS: $(basename dist/*.dmg 2>/dev/null)"
    echo ""
    echo "🚀 UPLOAD THESE FILES TO GITHUB:"
    echo "   1. Go to your GitHub repo → Releases"
    echo "   2. Click 'Create a new release'"
    echo "   3. Upload the installer files from frontend/dist/"
    echo "   4. Users can then download and install directly!"
    echo ""
    echo "🎨 Your custom icon will appear on users' desktops!"
else
    echo "❌ No dist folder created. Build may have failed."
    echo "   Check the error messages above."
fi

echo ""
echo "📋 NEXT STEPS:"
echo "   1. Test the installer on the target operating system"
echo "   2. Upload to GitHub Releases"
echo "   3. Update your README with download links"
echo ""