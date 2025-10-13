#!/bin/bash
# SmartSecure Sri Lanka - Quick Start Script (Linux/Mac)

echo "==============================================="
echo "     SmartSecure Sri Lanka - Quick Start"
echo "==============================================="
echo

echo "🚀 Starting Backend Server..."
cd "$(dirname "$0")/backend"
python3 final_working_server.py &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🌐 Starting Frontend Server..."
cd "../frontend"
npm run dev &
FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start..."
sleep 5

echo
echo "✅ SmartSecure Sri Lanka is running!"
echo
echo "📡 Backend API: http://localhost:5004"
echo "🌐 Frontend App: http://localhost:5173 (or next available port)"
echo
echo "🔑 LOGIN CREDENTIALS:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   OR"
echo "   Username: pamith"
echo "   Password: admin123"
echo
echo "💡 To stop the servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait