@echo off
echo Starting Stockify Development Servers...

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d c:\Users\Dhava\Documents\GitHub\stockify\backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d c:\Users\Dhava\Documents\GitHub\stockify\frontend && npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
