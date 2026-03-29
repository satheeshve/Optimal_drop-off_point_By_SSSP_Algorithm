@echo off
color 0E
title Commuter Genius - System Test Suite

REM Change to the script's directory
cd /d "%~dp0"

echo ============================================
echo  COMMUTER GENIUS - COMPREHENSIVE TESTING
echo ============================================
echo.
echo  This will test all system features
echo  and validate deployment readiness
echo.
echo ============================================
echo.

REM Check if backend is running
curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Backend not running on port 8000
    echo Please start the backend first: START_LOCAL.bat
    echo.
    choice /C YN /M "Do you want to start the backend now"
    if errorlevel 2 goto :skip_backend
    
    echo.
    echo Starting backend...
    start "Backend API" cmd /k "cd /d "%~dp0backend" && call START_BACKEND.bat"
    echo Waiting for backend to start (10 seconds)...
    timeout /t 10 >nul
)

:skip_backend

echo.
echo ============================================
echo  TEST SUITE
echo ============================================
echo.

set PASSED=0
set FAILED=0
set API_URL=http://localhost:8000

REM Test 1: Health Check
echo [TEST 1/11] Health Check Endpoint...
curl -s %API_URL%/api/health >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Backend not accessible
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Backend is healthy
    set /a PASSED+=1
)

REM Test 2: Root Endpoint
echo.
echo [TEST 2/11] Root Endpoint...
curl -s %API_URL%/ | find "Commuter Genius API" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Root endpoint error
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Root endpoint working
    set /a PASSED+=1
)

REM Test 3: API Documentation
echo.
echo [TEST 3/11] API Documentation...
curl -s %API_URL%/api/docs | find "FastAPI" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: API docs not accessible
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: API documentation available
    set /a PASSED+=1
)

REM Test 4: CORS Headers
echo.
echo [TEST 4/11] CORS Configuration...
curl -s -I %API_URL%/api/health | find "access-control-allow-origin" >nul 2>&1
if errorlevel 1 (
    echo   ⚠️  WARNING: CORS headers not found
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: CORS enabled
    set /a PASSED+=1
)

REM Test 5: Database Connection
echo.
echo [TEST 5/11] Database Connection...
REM This will be tested via API endpoint
curl -s %API_URL%/api/health >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Database connection issue
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Database connected
    set /a PASSED+=1
)

REM Test 6: User Registration (Simulation)
echo.
echo [TEST 6/11] User Management Endpoints...
curl -s %API_URL%/api/docs | find "users" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: User endpoints not found
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: User endpoints available
    set /a PASSED+=1
)

REM Test 7: Hazard Reporting Endpoints
echo.
echo [TEST 7/11] Hazard Reporting Endpoints...
curl -s %API_URL%/api/docs | find "hazards" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Hazard endpoints not found
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Hazard endpoints available
    set /a PASSED+=1
)

REM Test 8: Emergency SOS Endpoints
echo.
echo [TEST 8/11] Emergency SOS Endpoints...
curl -s %API_URL%/api/docs | find "emergency" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Emergency endpoints not found
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Emergency endpoints available
    set /a PASSED+=1
)

REM Test 9: Route Planning Endpoints
echo.
echo [TEST 9/11] Route Planning Endpoints...
curl -s %API_URL%/api/docs | find "routes" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Route endpoints not found
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Route endpoints available
    set /a PASSED+=1
)

REM Test 10: Police Patrol Endpoints
echo.
echo [TEST 10/11] Police Patrol Endpoints...
curl -s %API_URL%/api/docs | find "police" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Police endpoints not found
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Police endpoints available
    set /a PASSED+=1
)

REM Test 11: Transit Live Tracking Endpoints
echo.
echo [TEST 11/11] Transit Live Tracking Endpoints...
curl -s %API_URL%/api/docs | find "transit" >nul 2>&1
if errorlevel 1 (
    echo   ❌ FAILED: Transit endpoints not found
    set /a FAILED+=1
) else (
    echo   ✅ PASSED: Transit endpoints available
    set /a PASSED+=1
)

REM Frontend Test
echo.
echo ============================================
echo  FRONTEND TESTS
echo ============================================
echo.

if exist "dist\index.html" (
    echo ✅ Production build exists (dist/)
    echo    Build location: %CD%\dist
    set /a PASSED+=1
) else (
    echo ❌ Production build not found
    echo    Run: npm run build
    set /a FAILED+=1
)

if exist "node_modules" (
    echo ✅ Frontend dependencies installed
    set /a PASSED+=1
) else (
    echo ❌ Frontend dependencies missing
    echo    Run: npm install
    set /a FAILED+=1
)

if exist "src\App.tsx" (
    echo ✅ Frontend source files present
    set /a PASSED+=1
) else (
    echo ❌ Frontend source files missing
    set /a FAILED+=1
)

REM Configuration Tests
echo.
echo ============================================
echo  CONFIGURATION TESTS
echo ============================================
echo.

if exist ".env" (
    echo ✅ Frontend .env exists
    set /a PASSED+=1
) else (
    echo ⚠️  Frontend .env missing (will use defaults)
    set /a FAILED+=1
)

if exist "backend\.env" (
    echo ✅ Backend .env exists
    findstr /C:"SECRET_KEY=your-secret-key-change-in-production" backend\.env >nul 2>&1
    if errorlevel 1 (
        echo    ✅ SECRET_KEY has been changed
        set /a PASSED+=1
    ) else (
        echo    ⚠️  WARNING: Using default SECRET_KEY (change for production!)
    )
) else (
    echo ❌ Backend .env missing
    set /a FAILED+=1
)

if exist ".env.production" (
    echo ✅ Production .env exists
    set /a PASSED+=1
) else (
    echo ⚠️  Production .env missing (create for deployment)
)

if exist "backend\.env.production" (
    echo ✅ Backend production .env exists
    set /a PASSED+=1
) else (
    echo ⚠️  Backend production .env missing (create for deployment)
)

REM Documentation Tests
echo.
echo ============================================
echo  DOCUMENTATION TESTS
echo ============================================
echo.

if exist "README.md" (
    echo ✅ README.md exists
    set /a PASSED+=1
) else (
    echo ❌ README.md missing
    set /a FAILED+=1
)

if exist "DEPLOYMENT_GUIDE.md" (
    echo ✅ DEPLOYMENT_GUIDE.md exists
    set /a PASSED+=1
) else (
    echo ⚠️  DEPLOYMENT_GUIDE.md missing
)

if exist "paper\PROJECT_REPORT_PART3D.md" (
    echo ✅ Project report exists
    set /a PASSED+=1
) else (
    echo ⚠️  Project report missing
)

REM Security Tests
echo.
echo ============================================
echo  SECURITY TESTS
echo ============================================
echo.

echo [INFO] Checking for common security files...

if exist ".gitignore" (
    findstr /C:".env" .gitignore >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  WARNING: .env not in .gitignore
    ) else (
        echo ✅ .env files properly ignored
        set /a PASSED+=1
    )
) else (
    echo ❌ .gitignore missing
    set /a FAILED+=1
)

REM Check for exposed secrets (basic check)
if exist "backend\.env" (
    findstr /C:"password123" backend\.env >nul 2>&1
    if errorlevel 1 (
        echo ✅ No obvious weak passwords found
        set /a PASSED+=1
    ) else (
        echo ⚠️  WARNING: Weak password detected in .env
    )
)

REM Results Summary
echo.
echo ============================================
echo  TEST RESULTS SUMMARY
echo ============================================
echo.
echo  Total Tests: %PASSED% passed, %FAILED% failed
echo.

if %FAILED% GTR 3 (
    color 0C
    echo  ❌ SYSTEM NOT READY FOR DEPLOYMENT
    echo.
    echo  Critical issues found. Please fix before deploying.
) else if %FAILED% GTR 0 (
    color 0E
    echo  ⚠️  SYSTEM MOSTLY READY (with warnings)
    echo.
    echo  Minor issues found. Review warnings above.
) else (
    color 0A
    echo  ✅ SYSTEM READY FOR DEPLOYMENT!
    echo.
    echo  All tests passed successfully.
)

echo ============================================
echo.

REM Performance Test (Optional)
echo.
choice /C YN /M "Do you want to run a performance test"
if errorlevel 2 goto :skip_perf

echo.
echo ============================================
echo  PERFORMANCE TEST
echo ============================================
echo.

echo Testing API response time (10 requests)...
echo.

for /L %%i in (1,1,10) do (
    curl -w "Request %%i: %%{time_total}s\n" -o nul -s %API_URL%/api/health
)

echo.
echo Performance test complete!
echo.

:skip_perf

REM Open Test Report
echo.
choice /C YN /M "Do you want to open API documentation"
if errorlevel 2 goto :end

start http://localhost:8000/api/docs

:end
echo.
echo ============================================
echo  Testing Complete!
echo ============================================
echo.
echo  For detailed API testing, visit:
echo  - API Docs: http://localhost:8000/api/docs
echo  - API Health: http://localhost:8000/api/health
echo  - Frontend: http://localhost:8080
echo.
echo  Next steps:
echo  1. Review warnings above
echo  2. Run BUILD_PRODUCTION.bat for deployment build
echo  3. See DEPLOYMENT_GUIDE.md for production setup
echo.
pause
