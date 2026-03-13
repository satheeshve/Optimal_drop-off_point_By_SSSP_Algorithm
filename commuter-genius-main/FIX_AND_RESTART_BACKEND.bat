@echo off
title Commuter Genius - Backend Fix and Restart
color 0A

cd /d "%~dp0backend"

echo ============================================
echo   BACKEND RESTART WITH FIXES
echo ============================================
echo.
echo [1/3] Stopping any running backend...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Backend*" 2>nul
timeout /t 2 >nul

echo.
echo [2/3] Starting backend on port 8000...
echo.
start "Backend API Server" cmd /k "python main.py"

echo.
echo [3/3] Waiting for backend to start...
timeout /t 5 >nul

echo.
echo ============================================
echo   TESTING BACKEND API
echo ============================================
echo.
echo Testing health endpoint...
curl.exe -s http://localhost:8000/api/health

echo.
echo.
echo ============================================
echo   BACKEND STATUS
echo ============================================
echo.
echo  Backend API: http://localhost:8000
echo  API Docs: http://localhost:8000/api/docs
echo  Health Check: http://localhost:8000/api/health
echo.
echo  Now you can:
echo  1. Refresh your frontend (http://localhost:8080)
echo  2. Try the Police Patrol CRUD operations again
echo.
echo ============================================
echo.
pause
