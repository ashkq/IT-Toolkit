@echo off
REM 🦸‍♂️ IT Hero Desktop Installer Builder for Windows
REM ================================================

echo 🦸‍♂️ IT Hero Desktop Installer Builder
echo ======================================
echo.
echo Building desktop installer for IT Hero Security ^& Diagnostic Toolkit
echo This will create installer files that users can download and run
echo.

REM Navigate to frontend directory
cd frontend

REM Check if assets/icon.png exists
if not exist "assets\icon.png" (
    echo ⚠️  WARNING: No app icon found!
    echo    Place your app icon as 'frontend\assets\icon.png' before building
    echo    This will be used as the desktop icon users see
    echo.
) else (
    echo 🎨 Converting icon for Windows...
    python convert_icon.py
)

REM Clean up previous builds
if exist "dist" rmdir /s /q dist
if exist "node_modules" rmdir /s /q node_modules

REM Install all dependencies fresh
echo 📦 Installing dependencies...
npm install

REM Install desktop dependencies
echo 📦 Installing desktop dependencies...
npm install electron electron-builder express get-intrinsic side-channel side-channel-map qs --save-dev

REM Build React app
echo 🏗️ Building React application...
npm run build

REM Backup original package.json
copy package.json package.json.backup

REM Use desktop package.json for building
copy package-desktop.json package.json

REM Install desktop dependencies with the new package.json
echo 📦 Installing desktop build dependencies...
npm install

REM Build desktop application
echo 🔨 Building desktop executable...
npx electron-builder --publish=never

REM Restore original package.json
move package.json.backup package.json

echo.
echo ✅ BUILD COMPLETE!
echo 📁 Installer files created in 'frontend\dist' folder:
echo.
echo    📥 USERS DOWNLOAD THESE FILES:
echo    ================================
echo    🪟 Windows: IT-Hero-Setup.exe
echo    🍎 macOS: IT-Hero.dmg
echo    🐧 Linux: IT-Hero.AppImage
echo.
echo 🚀 UPLOAD THESE FILES TO GITHUB:
echo    Just upload the files from frontend\dist\ to your GitHub Releases
echo    Users can then download and install directly - no command line needed!
echo.

pause