@echo off
echo NCAA 14 Roster Tool - Starting...
echo.
echo Installing dependencies (first time only)...
call npm install
echo.
echo Starting application...
echo.
echo The app will open at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm run dev
pause
