import requests
import time

print("🔍 Quick VPN Test Starting...")
time.sleep(2)  # Wait for server

try:
    resp = requests.get('http://localhost:5004/', timeout=5)
    print(f"✅ SUCCESS! Status: {resp.status_code}")
    print(f"📊 Response: {resp.json()}")
    print("🎉 VPN Connection Working!")
except Exception as e:
    print(f"❌ Error: {e}")

print("Test complete.")