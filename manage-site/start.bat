@echo off
set PYTHONIOENCODING=utf-8
title Notes Blog Manager
cd /d "%~dp0"

echo ========================================
echo   Notes Blog -- Management Dashboard
echo ========================================
echo.

:: Check uv
where uv >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] uv is not installed.
    echo Install it with: pip install uv
    echo Or visit: https://github.com/astral-sh/uv
    pause
    exit /b 1
)

:: Sync dependencies (first run or after updates)
if not exist ".venv\Scripts\python.exe" (
    echo First run -- installing dependencies...
    uv sync
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] uv sync failed. Check your Python/uv installation.
        pause
        exit /b 1
    )
    echo.
)

:: Launch the GUI manager
if exist "NotesBlogManager.exe" (
    start "" "NotesBlogManager.exe"
) else if exist ".venv\Scripts\pythonw.exe" (
    start "" ".venv\Scripts\pythonw.exe" launcher.py --autostart
) else (
    start "" ".venv\Scripts\python.exe" launcher.py --autostart
)

:: Hide this CMD window after GUI launches
timeout /t 2 /nobreak >nul
exit
