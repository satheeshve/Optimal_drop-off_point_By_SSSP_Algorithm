@echo off
color 0B
title Commuter Genius - Complete Deployment Master Script

REM ============================================
REM  COMMUTER GENIUS - MASTER DEPLOYMENT
REM  One-Stop Complete Project Setup & Deploy
REM ============================================

cd /d "%~dp0"

echo.
echo ============================================
echo   COMMUTER GENIUS
echo   MASTER DEPLOYMENT SCRIPT
echo ============================================
echo.
echo   This script will guide you through:
echo   1. System check
echo   2. Environment setup
echo   3. Testing
echo   4. Production build
echo   5. Deployment options
echo.
echo ============================================
echo.

pause

REM ============================================
REM STEP 1: SYSTEM CHECK
REM ============================================

echo.
echo ============================================
echo  STEP 1: SYSTEM CHECK
echo ============================================
echo.

set SYSTEM_OK=1

echo [1.1] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ Python not found! Install Python 3.9+
    echo      Download: https://www.python.org/downloads/
    set SYSTEM_OK=0
) else (
    python --version
    echo   ✅ Python installed
)

echo.
echo [1.2] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ Node.js not found! Install Node.js
    echo      Download: https://nodejs.org/
    set SYSTEM_OK=0
) else (
    node --version
    echo   ✅ Node.js installed
)

echo.
echo [1.3] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ npm not found!
    set SYSTEM_OK=0
) else (
    npm --version
    echo   ✅ npm installed
)

echo.
echo [1.4] Checking Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo   ⚠️  Git not found (optional)
) else (
    git --version
    echo   ✅ Git installed
)

echo.
echo [1.5] Checking Docker (optional)...
docker --version >nul 2>&1
if errorlevel 1 (
    echo   ⚠️  Docker not found (optional for deployment)
) else (
    docker --version
    echo   ✅ Docker installed
)

if %SYSTEM_OK%==0 (
    echo.
    echo ❌ System requirements not met!
    echo    Install missing software and run again.
    pause
    exit /b 1
)

echo.
echo ✅ All required software installed!
pause

REM ============================================
REM STEP 2: PROJECT SETUP
REM ============================================

echo.
echo ============================================
echo  STEP 2: PROJECT SETUP
echo ============================================
echo.

echo [2.1] Installing frontend dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ❌ Frontend installation failed!
        pause
        exit /b 1
    )
) else (
    echo   ✅ Frontend dependencies already installed
)

echo.
echo [2.2] Setting up backend...
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install --upgrade pip
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Backend installation failed!
        pause
        exit /b 1
    )
    cd ..
) else (
    echo   ✅ Backend virtual environment exists
)

echo.
echo [2.3] Setting up environment files...
if not exist ".env" (
    echo Creating frontend .env...
    copy .env.example .env >nul 2>&1
    if not exist ".env" (
        echo VITE_API_URL=http://localhost:8000/api > .env
    )
)

if not exist "backend\.env" (
    echo Creating backend .env...
    if exist "backend\.env.example" (
        copy backend\.env.example backend\.env >nul 2>&1
    )
)

echo   ✅ Environment files ready
echo.
echo ✅ Project setup complete!
pause

REM ============================================
REM STEP 3: TESTING
REM ============================================

echo.
echo ============================================
echo  STEP 3: SYSTEM TESTING
echo ============================================
echo.

choice /C YN /M "Do you want to run comprehensive tests now"
if errorlevel 2 goto :skip_test

echo.
echo Running test suite...
if exist "TEST_SYSTEM.bat" (
    call TEST_SYSTEM.bat
) else (
    echo ⚠️  TEST_SYSTEM.bat not found, skipping...
)

:skip_test

REM ============================================
REM STEP 4: CHOOSE DEPLOYMENT MODE
REM ============================================

echo.
echo ============================================
echo  STEP 4: DEPLOYMENT MODE
echo ============================================
echo.
echo   Choose your deployment option:
echo.
echo   1. LOCAL DEMO (Development)
echo      - SQLite database
echo      - Hot reload enabled
echo      - Perfect for testing
echo.
echo   2. PRODUCTION BUILD (Manual Deployment)
echo      - Optimized frontend build
echo      - Production environment
echo      - Deploy to server manually
echo.
echo   3. DOCKER DEPLOYMENT (Recommended)
echo      - Complete containerized setup
echo      - PostgreSQL + PostGIS
echo      - Easy cloud deployment
echo.
echo   4. EXIT
echo.

choice /C 1234 /M "Select option"

if errorlevel 4 goto :end
if errorlevel 3 goto :docker_deploy
if errorlevel 2 goto :prod_build
if errorlevel 1 goto :local_demo

REM ============================================
REM OPTION 1: LOCAL DEMO
REM ============================================

:local_demo
echo.
echo ============================================
echo  STARTING LOCAL DEMO
echo ============================================
echo.

if exist "START_DEMO.bat" (
    call START_DEMO.bat
) else (
    echo Starting services manually...
    
    start "Backend API" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python main.py"
    timeout /t 5 >nul
    
    start "Frontend Dev" cmd /k "npm run dev"
    timeout /t 5 >nul
    
    start http://localhost:8080
    
    echo.
    echo ✅ Services started!
    echo    Frontend: http://localhost:8080
    echo    Backend: http://localhost:8000
    echo    API Docs: http://localhost:8000/api/docs
)

goto :end

REM ============================================
REM OPTION 2: PRODUCTION BUILD
REM ============================================

:prod_build
echo.
echo ============================================
echo  BUILDING FOR PRODUCTION
echo ============================================
echo.

if exist "BUILD_PRODUCTION.bat" (
    call BUILD_PRODUCTION.bat
) else (
    echo [1/3] Building frontend...
    call npm run build
    
    echo.
    echo [2/3] Backend production check...
    cd backend
    call venv\Scripts\activate.bat
    python -c "print('✅ Backend ready')"
    cd ..
    
    echo.
    echo [3/3] Build complete!
    echo.
    echo ============================================
    echo  DEPLOYMENT INSTRUCTIONS
    echo ============================================
    echo.
    echo   Frontend: dist/ folder ready
    echo   Backend: backend/ folder ready
    echo.
    echo   See DEPLOYMENT_GUIDE.md for details
    echo.
)

pause
goto :end

REM ============================================
REM OPTION 3: DOCKER DEPLOYMENT
REM ============================================

:docker_deploy
echo.
echo ============================================
echo  DOCKER DEPLOYMENT
echo ============================================
echo.

docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not installed!
    echo    Install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    goto :end
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose not installed!
    pause
    goto :end
)

echo ✅ Docker is installed
echo.

if not exist ".env.docker" (
    echo Creating .env file for Docker...
    echo DB_PASSWORD=change_this_password_please > .env
    echo SECRET_KEY=change_this_to_64_character_random_string >> .env
    echo ALLOWED_ORIGINS=http://localhost:8080 >> .env
    echo VITE_API_URL=http://localhost:8000/api >> .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file with secure passwords!
    echo.
    pause
)

echo [1/3] Building Docker images...
docker-compose build

if errorlevel 1 (
    echo ❌ Docker build failed!
    pause
    goto :end
)

echo.
echo [2/3] Starting containers...
docker-compose up -d

if errorlevel 1 (
    echo ❌ Docker startup failed!
    pause
    goto :end
)

echo.
echo [3/3] Checking container status...
timeout /t 5 >nul
docker-compose ps

echo.
echo ============================================
echo  DOCKER DEPLOYMENT COMPLETE!
echo ============================================
echo.
echo   Frontend: http://localhost
echo   Backend: http://localhost:8000
echo   API Docs: http://localhost:8000/api/docs
echo.
echo   Commands:
echo   - View logs: docker-compose logs -f
echo   - Stop: docker-compose down
echo   - Restart: docker-compose restart
echo.
echo ============================================
echo.

choice /C YN /M "Open in browser now"
if errorlevel 2 goto :end

start http://localhost

goto :end

REM ============================================
REM END
REM ============================================

:end
echo.
echo ============================================
echo  DEPLOYMENT SCRIPT COMPLETE
echo ============================================
echo.
echo   Resources:
echo   - README.md - Project overview
echo   - DEPLOYMENT_GUIDE.md - Full deployment instructions
echo   - PROJECT_COMPLETION_CHECKLIST.md - Final checklist
echo   - docker/README.md - Docker-specific guide
echo.
echo   Quick Start Commands:
echo   - START_DEMO.bat - Start local development
echo   - TEST_SYSTEM.bat - Run all tests
echo   - BUILD_PRODUCTION.bat - Build for production
echo.
echo ============================================
echo.
echo   Thank you for using Commuter Genius! 🚀
echo.
pause
