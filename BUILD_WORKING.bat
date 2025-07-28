@echo off
echo 🦸‍♂️ IT Hero Desktop Builder - WORKING VERSION
echo ==============================================
echo.

cd frontend

echo 📦 Installing React dependencies...
npm install

echo 🏗️ Building React application...
npm run build

echo 📦 Installing desktop dependencies...
npm install electron electron-builder express --save-dev

echo 🔨 Building desktop application...
npx electron-builder --win --publish=never

echo.
echo ✅ BUILD COMPLETE!
echo 📁 Check frontend\dist\ folder for installer files
echo.
pause