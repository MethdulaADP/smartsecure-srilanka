@echo off
REM Build script for Windows - Single-URL deployment

echo 🔨 Building SmartSecure Sri Lanka for single-URL deployment...

REM Step 1: Build frontend
echo 📦 Step 1: Building frontend...
cd frontend
call npm install
call npm run build
cd ..

echo ✅ Build complete! Ready to deploy to Railway.
echo 📁 Frontend build is in: frontend/dist
echo 🚀 Backend will serve everything from one URL

pause
