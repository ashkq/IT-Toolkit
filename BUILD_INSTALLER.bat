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
)

REM Install desktop dependencies
echo 📦 Installing desktop dependencies...
npm install electron electron-builder express --save-dev

REM Build React app
echo 🏗️ Building React application...
npm run build

REM Backup original package.json
copy package.json package.json.backup

REM Use desktop package.json for building
copy package-desktop.json package.json

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
echo 👥 WHAT USERS DO:
echo 1. Download the appropriate file for their operating system
echo 2. Double-click the downloaded file
echo 3. Follow the installation prompts
echo 4. IT Hero will be installed and ready to use!
echo.
echo 🚀 The installed app will automatically:
echo    - Start the backend server in the background
echo    - Open IT Hero in their default browser
echo    - No terminal windows or technical setup required!

pause