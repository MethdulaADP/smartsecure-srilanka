$ErrorActionPreference = "Stop"

Write-Host "=== Starting SmartSecure Backend ===" -ForegroundColor Cyan

# Change to backend directory
Set-Location "C:\Users\user\smartsecure-srilanka\backend"

# Verify database exists
if (Test-Path ".\smartsecure.db") {
    Write-Host "✅ Database found" -ForegroundColor Green
} else {
    Write-Host "❌ Database not found, creating..." -ForegroundColor Yellow
    python create_fresh_database.py
}

# Start the server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
python final_working_server.py
