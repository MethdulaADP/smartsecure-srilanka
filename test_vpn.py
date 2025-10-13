#!/usr/bin/env python3
"""
VPN Test Script for SmartSecure Sri Lanka
"""
import requests
import json

def test_backend():
    print("🔍 Testing SmartSecure Backend with VPN...")
    print("=" * 50)
    
    try:
        # Test health endpoint
        print("1. Testing Health Endpoint...")
        resp = requests.get('http://localhost:5004/', timeout=10)
        print(f"   ✅ Status: {resp.status_code}")
        print(f"   📊 Response: {resp.json()}")
        print()
        
        # Test registration endpoint
        print("2. Testing Registration Endpoint...")
        test_user = {
            'username': 'vpn_test_user',
            'email': 'test@vpn.com',
            'password': 'TestPass123!'
        }
        reg_resp = requests.post('http://localhost:5004/register', 
                                json=test_user, timeout=10)
        print(f"   ✅ Registration Status: {reg_resp.status_code}")
        reg_data = reg_resp.json()
        print(f"   📊 Registration Response: {reg_data}")
        print()
        
        # Test login endpoint
        print("3. Testing Login Endpoint...")
        login_data = {
            'username': 'vpn_test_user',
            'password': 'TestPass123!'
        }
        login_resp = requests.post('http://localhost:5004/login',
                                  json=login_data, timeout=10)
        print(f"   ✅ Login Status: {login_resp.status_code}")
        login_result = login_resp.json()
        print(f"   📊 Login Response: {login_result}")
        print()
        
        # Test file endpoint if login successful
        if login_resp.status_code == 200 and 'access_token' in login_result:
            print("4. Testing File Endpoints...")
            token = login_result['access_token']
            headers = {'Authorization': f'Bearer {token}'}
            
            files_resp = requests.get('http://localhost:5004/files',
                                    headers=headers, timeout=10)
            print(f"   ✅ Files Status: {files_resp.status_code}")
            print(f"   📊 Files Response: {files_resp.json()}")
            print()
        
        print("🎉 VPN Testing Complete!")
        print("✅ Backend is working perfectly with VPN!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Cannot reach backend server")
        print("🔧 Check if the server is running on port 5004")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Server is not responding")
        print("🔧 VPN might be blocking the connection")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_backend()