/**
 * Enhanced Authentication Service for SmartSecure Sri Lanka
 * Phase 2 - JWT Token Management & Security Features
 * Universal Configuration - Works at University & Home with VPN
 */

const API_BASE_URL = 'http://localhost:5004';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('smartsecure_token');
    this.user = JSON.parse(localStorage.getItem('smartsecure_user') || 'null');
    this.tokenExpiryCheck();
  }

  // Set authorization headers for API requests
  getAuthHeaders() {
    // Always read fresh token from localStorage to handle re-initialization
    const freshToken = localStorage.getItem('smartsecure_token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (freshToken) {
      headers['Authorization'] = `Bearer ${freshToken}`;
      this.token = freshToken; // Update instance token
    }
    
    return headers;
  }

  // Enhanced login with JWT
  async login(username, password) {
    try {
      console.log('🔐 Attempting login to:', `${API_BASE_URL}/login`);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        this.token = data.token;
        this.user = data.user;
        
        // Store securely
        localStorage.setItem('smartsecure_token', this.token);
        localStorage.setItem('smartsecure_user', JSON.stringify(this.user));
        localStorage.setItem('smartsecure_expires', Date.now() + (data.expires_in * 1000));
        
        console.log('✅ Login successful!');
        return { success: true, user: this.user, token: this.token };
      }
      
      console.log('❌ Login failed:', data.error);
      return { success: false, error: data.error };
    } catch (error) {
      console.error('🚨 Login network error:', error);
      return { success: false, error: 'Network error during login' };
    }
  }

  // Enhanced registration with JWT
  async register(username, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.token;
        this.user = data.user;
        
        // Store securely
        localStorage.setItem('smartsecure_token', this.token);
        localStorage.setItem('smartsecure_user', JSON.stringify(this.user));
        localStorage.setItem('smartsecure_expires', Date.now() + (data.expires_in * 1000));
        
        return { success: true, user: this.user, token: this.token };
      }
      
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error during registration' };
    }
  }

  // Secure logout
  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless
      this.token = null;
      this.user = null;
      localStorage.removeItem('smartsecure_token');
      localStorage.removeItem('smartsecure_user');
      localStorage.removeItem('smartsecure_expires');
    }
  }

  // Token refresh functionality
  async refreshToken() {
    try {
      if (!this.token) return false;

      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.token;
        localStorage.setItem('smartsecure_token', this.token);
        localStorage.setItem('smartsecure_expires', Date.now() + (data.expires_in * 1000));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Check token expiry and auto-refresh
  tokenExpiryCheck() {
    const expiryTime = localStorage.getItem('smartsecure_expires');
    if (expiryTime && this.token) {
      const timeToExpiry = parseInt(expiryTime) - Date.now();
      
      // If token expires in less than 5 minutes, refresh it
      if (timeToExpiry < 5 * 60 * 1000 && timeToExpiry > 0) {
        this.refreshToken();
      } else if (timeToExpiry <= 0) {
        // Token expired, clear session
        this.logout();
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Always read fresh data from localStorage
    this.token = localStorage.getItem('smartsecure_token');
    this.user = JSON.parse(localStorage.getItem('smartsecure_user') || 'null');
    this.tokenExpiryCheck();
    return !!(this.token && this.user);
  }

  // Get current user
  getCurrentUser() {
    // Always return fresh user data from localStorage
    this.user = JSON.parse(localStorage.getItem('smartsecure_user') || 'null');
    return this.user;
  }

  // Enhanced file upload with JWT
  async uploadFile(file, onProgress = null) {
    try {
      // Get fresh token from localStorage
      const token = localStorage.getItem('smartsecure_token');
      
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      return new Promise((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = function() {
          reject(new Error('Network error during upload'));
        };

        xhr.open('POST', `${API_BASE_URL}/upload`);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Get user files
  async getFiles() {
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Get files error:', error);
      return { success: false, error: 'Failed to fetch files' };
    }
  }

  // Get analytics
  async getAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Get analytics error:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }

  // Get security status
  async getSecurityStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/security/status`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Get security status error:', error);
      return { success: false, error: 'Failed to fetch security status' };
    }
  }

  // Get audit logs
  async getAuditLogs() {
    try {
      const response = await fetch(`${API_BASE_URL}/security/audit-logs`, {
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Get audit logs error:', error);
      return { success: false, error: 'Failed to fetch audit logs' };
    }
  }

  // Get API URL for external use
  getApiUrl() {
    return API_BASE_URL;
  }

  // Get token for external use
  getToken() {
    // Always return fresh token from localStorage
    this.token = localStorage.getItem('smartsecure_token');
    return this.token;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;