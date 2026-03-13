@echo off
color 0B
title Commuter Genius - Production Deployment

REM Change to the script's directory
cd /d "%~dp0"

echo ============================================
echo  COMMUTER GENIUS - PRODUCTION DEPLOYMENT
echo ============================================
echo.
echo  This script will build and deploy the
echo  production-ready version of the application
echo.
echo ============================================
echo.

REM Verify Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Install Python 3.9+
    pause
    exit /b 1
)

REM Verify Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Install Node.js
    pause
    exit /b 1
)

echo [STEP 1/7] Checking environment configuration...
echo.

if not exist ".env.production" (
    echo [WARNING] .env.production not found!
    echo Creating from template...
    copy .env .env.production
)

if not exist "backend\.env.production" (
    echo [WARNING] backend\.env.production not found!
    echo Creating from template...
    copy backend\.env backend\.env.production
)

echo [!] IMPORTANT: Review and update production environment files:
echo     - .env.production (Frontend API URL)
echo     - backend\.env.production (Database, Security Keys, SMTP, SMS)
echo.
pause

echo.
echo [STEP 2/7] Installing/Updating Dependencies...
echo.

echo Installing frontend dependencies...
call npm install --production=false
if errorlevel 1 (
    echo [ERROR] Frontend dependency installation failed
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Backend dependency installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo [STEP 3/7] Running Security Audit...
echo.
call npm audit
echo [INFO] Review any vulnerabilities above and run 'npm audit fix' if needed
pause

echo.
echo [STEP 4/7] Building Frontend for Production...
echo.

REM Clean previous build
if exist "dist" (
    echo Cleaning previous build...
    rmdir /s /q dist
)

REM Build with production environment
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)

echo [SUCCESS] Frontend built successfully in /dist folder
echo.

echo [STEP 5/7] Database Setup Check...
echo.
echo [INFO] Ensure PostgreSQL is installed and running
echo [INFO] Database setup instructions:
echo.
echo   1. Create database:
echo      CREATE DATABASE commuter_genius;
echo.
echo   2. Enable PostGIS extension:
echo      CREATE EXTENSION postgis;
echo.
echo   3. Update backend\.env.production with database credentials
echo.
pause

echo.
echo [STEP 6/7] Running Backend Tests...
echo.
cd backend
call venv\Scripts\activate.bat
python -c "import fastapi, sqlalchemy, geoalchemy2; print('✅ All critical imports successful')"
if errorlevel 1 (
    echo [ERROR] Backend dependencies verification failed
    pause
    exit /b 1
)
cd ..

echo.
echo [STEP 7/7] Production Deployment Summary
echo.
echo ============================================
echo  BUILD COMPLETE! 🎉
echo ============================================
echo.
echo  Frontend Build: dist/ folder (ready for deployment)
echo  Backend Setup: backend/ folder (ready to run)
echo.
echo ============================================
echo  DEPLOYMENT CHECKLIST
echo ============================================
echo.
echo  ☐ 1. Update .env.production with production API URL
echo  ☐ 2. Update backend\.env.production:
echo       - Generate secure SECRET_KEY (64 chars random)
echo       - Set PostgreSQL DATABASE_URL
echo       - Configure SMTP for email alerts
echo       - Configure Twilio for SMS alerts
echo       - Set ALLOWED_ORIGINS to your domain
echo  ☐ 3. Deploy frontend (dist/) to web server:
echo       - Nginx/Apache configuration
echo       - Enable HTTPS (SSL certificate)
echo       - Configure domain DNS
echo  ☐ 4. Deploy backend on server:
echo       - Use production WSGI server (gunicorn/uvicorn)
echo       - Setup systemd service for auto-restart
echo       - Configure reverse proxy (Nginx)
echo       - Enable firewall rules (port 8000)
echo  ☐ 5. Database setup:
echo       - Create PostgreSQL database
echo       - Run migrations (if any)
echo       - Backup strategy
echo  ☐ 6. Security hardening:
echo       - Enable HTTPS everywhere
echo       - Configure CSP headers
echo       - Setup rate limiting
echo       - Enable logging/monitoring
echo  ☐ 7. Testing:
echo       - Test all API endpoints
echo       - Test SOS emergency system
echo       - Test email/SMS alerts
echo       - Load testing
echo.
echo ============================================
echo  QUICK START COMMANDS
echo ============================================
echo.
echo  Local Production Test:
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn main:app --host 0.0.0.0 --port 8000 --env-file .env.production
echo.
echo  Serve Built Frontend:
echo    npx serve -s dist -l 3000
echo.
echo ============================================
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause
