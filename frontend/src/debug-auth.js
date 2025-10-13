// Simple debug version of authService
const API_BASE_URL = 'http://127.0.0.1:5000';

async function debugLogin(username, password) {
    console.log('🚀 Starting login process...');
    console.log('📡 API URL:', API_BASE_URL);
    console.log('👤 Username:', username);
    
    try {
        console.log('📤 Making fetch request...');
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        console.log('📬 Response received:', response);
        console.log('📊 Status:', response.status);
        console.log('📋 Headers:', response.headers);
        
        const data = await response.json();
        console.log('📦 Data:', data);
        
        return data;
        
    } catch (error) {
        console.error('🚨 Fetch error:', error);
        console.error('📋 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Test function to be called from browser console
window.testLogin = function() {
    debugLogin('testuser', 'password123')
        .then(result => console.log('✅ Login result:', result))
        .catch(error => console.error('❌ Login failed:', error));
};

console.log('🔧 Debug login function loaded. Call testLogin() in console to test.');