#!/usr/bin/env python3
"""
API Endpoint Testing Script for SmartSecure Sri Lanka
Tests all backend endpoints to ensure they're working correctly
"""

import requests
import json

API_BASE = 'http://localhost:5004'

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f'{API_BASE}/')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check OK: {data['message']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_login():
    """Test the login endpoint"""
    print("\n🔐 Testing login...")
    try:
        response = requests.post(f'{API_BASE}/login', json={
            'username': 'pamith',
            'password': 'admin123'
        })
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Login successful for user: {data['user']['username']}")
                return data['token']
            else:
                print(f"❌ Login failed: {data.get('message')}")
                return None
        else:
            print(f"❌ Login HTTP error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_authenticated_endpoints(token):
    """Test all authenticated endpoints"""
    headers = {'Authorization': f'Bearer {token}'}
    
    endpoints = [
        ('/files', 'GET', 'Files endpoint'),
        ('/files/storage-stats', 'GET', 'Storage stats endpoint'),
        ('/analytics', 'GET', 'Analytics endpoint'),
        ('/admin/analytics', 'GET', 'Admin analytics endpoint'),
        ('/admin/stats', 'GET', 'Admin stats endpoint'),
        ('/admin/audit-logs', 'GET', 'Admin audit logs endpoint'),
        ('/admin/security-alerts', 'GET', 'Admin security alerts endpoint'),
        ('/security/status', 'GET', 'Security status endpoint'),
        ('/security/audit-logs', 'GET', 'Security audit logs endpoint'),
        ('/stats', 'GET', 'Stats endpoint')
    ]
    
    results = []
    
    for endpoint, method, description in endpoints:
        print(f"\n🔍 Testing {description} ({method} {endpoint})...")
        try:
            response = requests.get(f'{API_BASE}{endpoint}', headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {description} working - Status: 200")
                if isinstance(data, dict) and 'success' in data:
                    print(f"   Success: {data['success']}")
                results.append((endpoint, True, None))
            else:
                print(f"❌ {description} failed - Status: {response.status_code}")
                results.append((endpoint, False, f"HTTP {response.status_code}"))
        except Exception as e:
            print(f"❌ {description} error: {e}")
            results.append((endpoint, False, str(e)))
    
    return results

def main():
    """Main testing function"""
    print("🚀 === SmartSecure Sri Lanka API Testing ===")
    print("Testing all backend endpoints...\n")
    
    # Test health check
    if not test_health_check():
        print("❌ Server appears to be down. Please start the backend server.")
        return
    
    # Test login and get token
    token = test_login()
    if not token:
        print("❌ Login failed. Cannot test authenticated endpoints.")
        return
    
    print(f"🔑 Token obtained: {token[:20]}...")
    
    # Test all authenticated endpoints
    results = test_authenticated_endpoints(token)
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    total_tests = len(results)
    passed_tests = sum(1 for _, success, _ in results if success)
    failed_tests = total_tests - passed_tests
    
    print(f"Total endpoints tested: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    
    if failed_tests > 0:
        print("\n🔍 Failed endpoints:")
        for endpoint, success, error in results:
            if not success:
                print(f"   ❌ {endpoint}: {error}")
    
    success_rate = (passed_tests / total_tests) * 100
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 Excellent! All critical endpoints are working.")
    elif success_rate >= 75:
        print("✅ Good! Most endpoints are working.")
    else:
        print("⚠️ Warning! Several endpoints need attention.")

if __name__ == '__main__':
    main()