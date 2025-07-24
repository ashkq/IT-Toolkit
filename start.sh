#!/bin/bash

# IT Hero Start Script
# This script starts both backend and frontend servers

echo "🦸‍♂️ Starting IT Hero 🔨⚒️"
echo "============================"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   macOS: brew services start mongodb-community"
    echo "   Ubuntu: sudo systemctl start mongod"
    echo "   Windows: net start MongoDB"
    echo ""
    read -p "Press Enter after starting MongoDB..."
fi

# Kill any existing processes on ports 3000 and 8001
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

echo "🚀 Starting backend server..."
cd backend
source ../venv/bin/activate 2>/dev/null || echo "Virtual environment not found, using system Python"
uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🎨 Starting frontend server..."
cd frontend
yarn start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ IT Hero is starting up!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit
}

# Trap Ctrl+C
trap cleanup INT

# Wait for both processes
wait