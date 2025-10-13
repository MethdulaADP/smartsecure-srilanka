@echo off
echo ========================================
echo   FREE DEPLOYMENT SETUP - Firebase
echo   SmartSecure Sri Lanka
echo ========================================
echo.

echo Step 1: Installing Firebase CLI...
echo.
call npm install -g firebase-tools
echo.
echo ✅ Firebase CLI installed!
echo.

echo Step 2: Building Frontend...
echo.
cd frontend
call npm install
call npm run build
cd ..
echo.
echo ✅ Frontend built!
echo.

echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Run: firebase login
echo 2. Run: firebase init
echo 3. Run: firebase deploy
echo.
echo 📖 Full guide: docs\FREE_DEPLOYMENT.md
echo.
pause
