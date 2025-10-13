#!/bin/bash
# Build script for single-deployment

echo "🔨 Building SmartSecure Sri Lanka for single-URL deployment..."

# Step 1: Build frontend
echo "📦 Step 1: Building frontend..."
cd frontend
npm install
npm run build

# Step 2: Copy to backend
echo "📋 Step 2: Copying frontend build to backend..."
# The Flask app will serve from frontend/dist

echo "✅ Build complete! Ready to deploy to Railway."
echo "📁 Frontend build is in: frontend/dist"
echo "🚀 Backend will serve everything from one URL"
