@echo off
color 0E
title Commuter Genius - Manual Testing Guide

REM ============================================
REM  MANUAL TESTING STARTUP HELPER
REM ============================================

cd /d "%~dp0"

echo ============================================
echo  COMMUTER GENIUS - MANUAL TESTING
echo ============================================
echo.
echo  This script will start the application
echo  and open your testing checklist
echo.
echo ============================================
echo.

REM Check if backend is already running
curl -s http://localhost:8000/api/health >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Backend already running on port 8000
    goto check_frontend
)

echo [1/3] Starting Backend API...
start "Backend API - Port 8000" cmd /k "cd /d "%~dp0backend" && call START_BACKEND.bat"
echo Waiting for backend to start...
timeout /t 10 >nul

:check_frontend

REM Check if frontend is already running
curl -s http://localhost:8080 >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Frontend already running on port 8080
    goto open_resources
)

echo.
echo [2/3] Starting Frontend...
start "Frontend Dev Server - Port 8080" cmd /k "npm run dev"
echo Waiting for frontend to start...
timeout /t 10 >nul

:open_resources

echo.
echo [3/3] Opening Testing Resources...
timeout /t 3 >nul

REM Open the main application
start http://localhost:8080

REM Wait a bit then open API docs
timeout /t 2 >nul
start http://localhost:8000/api/docs

REM Open GTFS live endpoint for quick validation
timeout /t 2 >nul
start http://localhost:8000/api/transit/live-feed

REM Open the testing checklist
timeout /t 2 >nul
if exist "MANUAL_TESTING_CHECKLIST.md" (
    start MANUAL_TESTING_CHECKLIST.md
)

echo.
echo ============================================
echo  TESTING ENVIRONMENT READY!
echo ============================================
echo.
echo  Application:  http://localhost:8080
echo  API Docs:     http://localhost:8000/api/docs
echo  Backend API:  http://localhost:8000
echo.
echo  Testing Checklist: MANUAL_TESTING_CHECKLIST.md
echo.
echo ============================================
echo  TESTING TIPS
echo ============================================
echo.
echo  1. Follow the testing checklist systematically
echo  2. Test each feature thoroughly
echo  3. Check both success and error scenarios
echo  4. Test on different screen sizes (resize browser)
echo  5. Try language switching (EN/TA)
echo  6. Note any issues in a separate file
echo.
echo  Press Ctrl+C in the terminal windows to stop
echo.
echo ============================================
echo.

pause
