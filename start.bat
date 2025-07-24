@echo off
REM IT Hero Start Script for Windows

echo 🦸‍♂️ Starting IT Hero 🔨⚒️
echo ============================

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  MongoDB is not running. Please start MongoDB first:
    echo    net start MongoDB
    echo.
    pause
)

echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>NUL
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>NUL

echo 🚀 Starting backend server...
cd backend
call ..\venv\Scripts\activate.bat
start "IT Hero Backend" cmd /k "uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
cd ..

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo 🎨 Starting frontend server...
cd frontend
start "IT Hero Frontend" cmd /k "yarn start"
cd ..

echo.
echo ✅ IT Hero is starting up!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8001
echo.
echo Press any key to close this window...
pause >nul