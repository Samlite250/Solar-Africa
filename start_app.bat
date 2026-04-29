@echo off
echo =========================================
echo ☀️  Starting Solar Africa Platform
echo =========================================

REM Check if node is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js to run the server.
    pause
    exit /b
)

echo [INFO] Starting backend API...
start cmd /k "cd backend && npm start"

echo [INFO] Starting modern React frontend...
start cmd /k "cd frontend-react && npm run dev"

echo [INFO] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo [INFO] Opening application in your default browser...
start http://localhost:5173

echo =========================================
echo ✅ Setup Complete! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo =========================================
pause
