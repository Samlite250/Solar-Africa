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

echo [INFO] Starting backend server...
start cmd /k "cd backend && npm start"

echo [INFO] Waiting for server to initialize...
timeout /t 3 /nobreak >nul

echo [INFO] Opening application in your default browser...
start http://localhost:3000

echo =========================================
echo ✅ Setup Complete! 
echo If you see 'email rate limit exceeded' when registering, 
echo please wait or disable Email Confirmations in Supabase.
echo =========================================
pause
