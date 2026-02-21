@echo off
REM Goal Achiever Development Startup Script (Windows)
REM This script starts both frontend and backend services for local development

echo 🚀 Starting Goal Achiever Development Environment...
echo.

REM Check if .env files exist
if not exist backend\.env (
    echo ⚠️  Warning: backend\.env not found!
    echo    Create backend\.env with DATABASE_URL, JWT_SECRET, and OPENAI_API_KEY
    echo.
)

if not exist frontend\.env.local (
    echo ⚠️  Warning: frontend\.env.local not found!
    echo    Create frontend\.env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
    echo.
)

echo 📦 Starting PostgreSQL with Docker Compose...
docker-compose up -d postgres

echo ⏳ Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak > nul

echo.
echo 🐍 Starting FastAPI backend on http://localhost:8000...
cd backend

if not exist venv (
    echo    Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and start backend
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo    Running database migrations...
alembic upgrade head

start "Backend Server" cmd /k "venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

cd ..

echo.
echo ⚛️  Starting Next.js frontend on http://localhost:3000...
cd frontend

if not exist node_modules (
    echo    Installing npm dependencies...
    call npm install
)

start "Frontend Server" cmd /k "npm run dev"

cd ..

echo.
echo ✅ Development servers started!
echo.
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo Close the server windows to stop the services
echo.
pause
