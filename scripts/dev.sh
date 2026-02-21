#!/bin/bash

# Goal Achiever Development Startup Script
# This script starts both frontend and backend services for local development

echo "🚀 Starting Goal Achiever Development Environment..."
echo ""

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "⚠️  Warning: backend/.env not found!"
    echo "   Create backend/.env with DATABASE_URL, JWT_SECRET, and OPENAI_API_KEY"
    echo ""
fi

if [ ! -f frontend/.env.local ]; then
    echo "⚠️  Warning: frontend/.env.local not found!"
    echo "   Create frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:8000"
    echo ""
fi

# Check if Docker is running (for Postgres)
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker to run Postgres."
    exit 1
fi

echo "📦 Starting PostgreSQL with Docker Compose..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Start backend
echo ""
echo "🐍 Starting FastAPI backend on http://localhost:8000..."
cd backend
if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
pip install -q -r requirements.txt

# Run migrations
echo "   Running database migrations..."
alembic upgrade head

# Start backend in background
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo ""
echo "⚛️  Starting Next.js frontend on http://localhost:3000..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing npm dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interruption
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
