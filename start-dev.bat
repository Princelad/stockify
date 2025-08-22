@echo off
echo Starting Stockify Development Servers...

REM Get the directory where this batch file is located
set "PROJECT_DIR=%~dp0"

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%PROJECT_DIR%backend" && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%PROJECT_DIR%frontend" && npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause
