@echo off
set PYTHONIOENCODING=utf-8
title Building NotesBlogManager.exe...
cd /d "%~dp0"

echo ========================================
echo   Build launcher.exe with PyInstaller
echo ========================================
echo.

:: Ensure dependencies are installed
echo [1/3] Checking dependencies...
uv sync --dev
if %ERRORLEVEL% neq 0 (
    echo [ERROR] uv sync failed
    pause
    exit /b 1
)

:: Clean previous build
echo [2/3] Cleaning previous build...
if exist "dist\NotesBlogManager.exe" del "dist\NotesBlogManager.exe"
if exist "build" rmdir /s /q "build"

:: Run PyInstaller
echo [3/3] Running PyInstaller...
echo.
uv run pyinstaller ^
    --noconsole ^
    --onefile ^
    --name "NotesBlogManager" ^
    --add-data "server.py;." ^
    --distpath "./dist" ^
    --workpath "./build" ^
    --specpath "./build" ^
    launcher.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] PyInstaller build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build SUCCESS!
echo.
echo   EXE location: dist\NotesBlogManager.exe
echo.
echo   Copy it to manage-site\ to run directly:
echo     copy dist\NotesBlogManager.exe .
echo ========================================
echo.
echo Already copying to manage-site\...
copy /y "dist\NotesBlogManager.exe" "NotesBlogManager.exe" >nul
echo Done! Double-click NotesBlogManager.exe to start.
echo.
pause
