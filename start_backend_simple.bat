@echo off
chcp 65001 >nul
cd /d "%~dp0backend"

echo Starting SmartSecure Backend...
python final_working_server.py
