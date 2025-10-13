@echo off
title SmartSecure Sri Lanka - Enhanced Mode

echo ===== SmartSecure Sri Lanka Enhanced Mode =====
echo Starting enhanced backend server...
echo.

cd /d "%~dp0"

echo Starting enhanced server on port 5004...
python backend\enhanced_server.py