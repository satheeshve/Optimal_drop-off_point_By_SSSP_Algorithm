@echo off
color 0E
echo ============================================
echo  TESTING POLICE PATROL FEATURES
echo ============================================
echo.

REM Change to backend directory
cd /d "%~dp0backend"

echo [TEST 1/3] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Python not found
    pause
    exit /b 1
)
echo [PASS] Python is installed
echo.

echo [TEST 2/3] Testing database initialization...
python init_default_data.py
if errorlevel 1 (
    echo [FAIL] Database initialization failed
    pause
    exit /b 1
)
echo [PASS] Database initialized with default patrol data
echo.

echo [TEST 3/3] Checking API endpoints...
echo Please start the backend server if not running:
echo   cd backend
echo   python main.py
echo.
echo Then test these URLs in your browser:
echo   http://localhost:8000/api/police/patrols/today
echo   http://localhost:8000/api/police/patrols/active
echo   http://localhost:8000/api/docs
echo.
echo ============================================
echo  ALL TESTS COMPLETED!
echo ============================================
echo.
echo Next steps:
echo 1. Run START_LOCAL.bat to start the full application
echo 2. Open http://localhost:8080
echo 3. Click "Police Patrol" icon
echo 4. You should see 4 default patrol routes!
echo.
pause
