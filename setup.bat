@echo off
REM IT Hero Setup Script for Windows

echo 🦸‍♂️ IT Hero 🔨⚒️ Setup Script (Windows)
echo ================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3 is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if yarn is installed
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Yarn is not installed. Installing yarn...
    npm install -g yarn
)

echo ✅ Prerequisites check passed!

REM Create Python virtual environment
echo 🐍 Setting up Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

REM Install frontend dependencies
echo 🎨 Installing frontend dependencies...
cd frontend
yarn install
cd ..

REM Create environment files if they don't exist
if not exist "backend\.env" (
    echo ⚙️  Creating backend environment file...
    (
        echo MONGO_URL="mongodb://localhost:27017"
        echo DB_NAME="security_toolkit"
        echo.
        echo # Optional API Keys for Enhanced Features
        echo # VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
        echo # GOOGLE_SAFEBROWSING_API_KEY=your_google_api_key_here
    ) > backend\.env
)

if not exist "frontend\.env" (
    echo ⚙️  Creating frontend environment file...
    (
        echo REACT_APP_BACKEND_URL=http://localhost:8001
    ) > frontend\.env
)

echo.
echo 🎉 Setup complete!
echo.
echo 📋 To start the application:
echo 1. Start MongoDB on your system: net start MongoDB
echo 2. Run: start.bat
echo.
echo 🌐 Then open: http://localhost:3000

pause