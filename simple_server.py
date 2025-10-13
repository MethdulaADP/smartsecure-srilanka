#!/usr/bin/env python3
"""
Simple web server to serve the built React application
"""
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configuration
PORT = 5173
FRONTEND_DIST_DIR = "frontend/dist"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_GET(self):
        # Handle SPA routing - serve index.html for any path that doesn't exist
        if self.path != '/' and not os.path.exists(self.translate_path(self.path)):
            self.path = '/'
        return super().do_GET()

def main():
    # Change to the frontend dist directory
    dist_path = Path(__file__).parent / FRONTEND_DIST_DIR
    if not dist_path.exists():
        print(f"❌ Frontend dist directory not found: {dist_path}")
        print("💡 Please run 'cd frontend && npm run build' first")
        return
    
    os.chdir(dist_path)
    
    # Start server
    handler = MyHTTPRequestHandler
    httpd = socketserver.TCPServer(("localhost", PORT), handler)
    
    print(f"🚀 Serving React app at http://localhost:{PORT}")
    print(f"📁 Serving from: {dist_path}")
    print(f"🔧 Backend API: http://localhost:5004")
    print("🌐 Server is running...")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
    finally:
        httpd.server_close()

if __name__ == "__main__":
    main()