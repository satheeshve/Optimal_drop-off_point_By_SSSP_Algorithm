@echo off
color 0A

REM Change to the script's directory
cd /d "%~dp0"

echo ============================================
echo  COMMUTER GENIUS - Quick Start
echo ============================================
echo.
echo  Features: Safety-Aware Routing + Police Patrol
echo            Real GTFS Bus/Train Live Tracking
echo  Database: SQLite (No PostgreSQL required!)
echo.
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python 3.9+
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist "backend\venv" (
    echo Setting up Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
)
echo Dependencies OK!
echo.

echo [2/4] Starting Backend API (SQLite)...
start "Backend API - Port 8000" cmd /k "cd /d "%~dp0backend" && call START_BACKEND.bat"
timeout /t 8 >nul

echo [3/4] Starting Frontend (Vite)...
start "Frontend Dev Server" cmd /k "npm run dev"
timeout /t 8 >nul

echo [4/4] Opening Browser...
timeout /t 3 >nul
start http://localhost:8080

echo.
echo ============================================
echo  PROJECT IS RUNNING!
echo ============================================
echo.
echo  Frontend:  http://localhost:8080
echo  Backend:   http://localhost:8000
echo  API Docs:  http://localhost:8000/api/docs
echo  GTFS Live: http://localhost:8000/api/transit/live-feed
echo.
echo ============================================
echo  QUICK GUIDE
echo ============================================
echo.
echo  1. Homepage shows ICON DASHBOARD
echo  2. Click "Police Patrol" to add patrol data
echo  3. Calculate a route and open Route Map tab
echo  4. Use GTFS section to track bus/train number live
echo  5. Check NAVIGATION_GUIDE.md for details
echo.
echo  Press Ctrl+C in each terminal to stop
echo.
pause
