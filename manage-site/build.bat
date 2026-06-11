@echo off
cd /d "%~dp0\..\vue-sites"
echo -- Step 1/3: copy-notes.js --
call node scripts/copy-notes.js
if %ERRORLEVEL% neq 0 (
    echo copy-notes FAILED with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo -- Step 2/3: vite build --
call node_modules\.bin\vite.cmd build
if %ERRORLEVEL% neq 0 (
    echo vite build FAILED with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo -- Step 3/3: copy-404.js --
call node scripts/copy-404.js
if %ERRORLEVEL% neq 0 (
    echo copy-404 FAILED with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
echo -- Build SUCCESS --
exit /b 0
