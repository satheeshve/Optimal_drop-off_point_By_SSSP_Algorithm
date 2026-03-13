# Backend Setup Script for Windows
@echo off
echo ========================================
echo Commuter Genius Backend Setup
echo ========================================
echo.

echo [1/5] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Upgrading pip...
python -m pip install --upgrade pip

echo [4/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [5/5] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file - Please edit with your database credentials
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your PostgreSQL credentials
echo 2. Create database: CREATE DATABASE commuter_genius;
echo 3. Enable PostGIS: CREATE EXTENSION postgis;
echo 4. Run: python main.py
echo.
echo API will be available at: http://localhost:8000
echo Documentation: http://localhost:8000/api/docs
echo.
pause
