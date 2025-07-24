#!/bin/bash

# IT Hero Setup Script
# This script sets up the IT Hero Security & Diagnostic Toolkit

echo "🦸‍♂️ IT Hero 🔨⚒️ Setup Script"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Installing yarn..."
    npm install -g yarn
fi

echo "✅ Prerequisites check passed!"

# Create Python virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend
yarn install
cd ..

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating backend environment file..."
    cat > backend/.env << EOL
MONGO_URL="mongodb://localhost:27017"
DB_NAME="security_toolkit"

# Optional API Keys for Enhanced Features
# VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
# GOOGLE_SAFEBROWSING_API_KEY=your_google_api_key_here
EOL
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚙️  Creating frontend environment file..."
    cat > frontend/.env << EOL
REACT_APP_BACKEND_URL=http://localhost:8001
EOL
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 To start the application:"
echo "1. Start MongoDB on your system"
echo "2. Run: ./start.sh"
echo ""
echo "Or manually:"
echo "Terminal 1: cd backend && source ../venv/bin/activate && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo "Terminal 2: cd frontend && yarn start"
echo ""
echo "🌐 Then open: http://localhost:3000"