@echo off
setlocal
color 0A

cd /d "%~dp0"

echo ============================================
echo  BACKEND STARTUP (AUTO-SETUP)
echo ============================================
echo.

where python >nul 2>&1
if errorlevel 1 (
	echo [ERROR] Python is not installed or not in PATH.
	pause
	exit /b 1
)

if not exist "venv\Scripts\python.exe" (
	echo [1/3] Creating backend virtual environment...
	python -m venv venv
	if errorlevel 1 (
		echo [ERROR] Failed to create virtual environment.
		pause
		exit /b 1
	)
)

echo [2/3] Installing/updating backend dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul 2>&1
python -m pip install -r requirements.txt
if errorlevel 1 (
	echo [ERROR] Failed to install backend dependencies.
	pause
	exit /b 1
)

echo [3/3] Starting backend API server...
echo.
python main.py
