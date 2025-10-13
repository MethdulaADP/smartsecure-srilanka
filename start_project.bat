@echo off
echo ===============================================
echo     SmartSecure Sri Lanka - Quick Start
echo ===============================================
echo.

echo 🚀 Starting Backend Server...
start "SmartSecure Backend" cmd /k "cd /d C:\Users\user\smartsecure-srilanka\backend && python final_working_server.py"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Server...
start "SmartSecure Frontend" cmd /k "cd /d C:\Users\user\smartsecure-srilanka\frontend && npm run dev"

echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak > nul

echo.
echo ✅ SmartSecure Sri Lanka is starting up!
echo.
echo 📡 Backend API: http://localhost:5004
echo 🌐 Frontend App: http://localhost:5189 (or next available port)
echo.
echo 🔑 LOGIN CREDENTIALS:
echo    Username: admin
echo    Password: admin123
echo    OR
echo    Username: pamith  
echo    Password: admin123
echo.
echo 💡 The application will open automatically in separate windows.
echo    Close this window when both servers are running.
echo.
pause