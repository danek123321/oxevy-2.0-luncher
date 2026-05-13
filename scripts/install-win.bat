@echo off
setlocal enabledelayedexpansion
echo =============================================
echo   Oxevy Launcher - Auto Installer for Windows
echo =============================================
echo.

cd /d "%~dp0\.."

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is required but not installed.
    echo Please install Node.js 20+ LTS from: https://nodejs.org/
    echo Then re-run this script.
    pause
    exit /b 1
)
echo [1/4] Node.js found: 
for /f "tokens=*" %%i in ('node -v') do echo   %%i

:: Install dependencies
echo.
echo [2/4] Installing npm dependencies...
call npm install --silent 2>&1

:: Build frontend
echo.
echo [3/4] Building frontend...
call npx vite build 2>&1

:: Package for Windows
echo.
echo [4/4] Packaging installer...
call npx electron-builder --win 2>&1

:: Done
echo.
echo =============================================
echo   Build complete!
echo =============================================
echo.
echo Installer: dist-electron\Oxevy Launcher Setup 1.0.0.exe
echo.
pause