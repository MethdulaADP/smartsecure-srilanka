import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if user is already authenticated via authService
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } else {
        // Fallback to localStorage for backward compatibility
        const saved = localStorage.getItem('user');
        if (saved) setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (u) => {
    setUser(u);
    try { localStorage.setItem('user', JSON.stringify(u)); } catch {}
  };

  const login = async (userData) => {
    // This function is now just for updating the context state
    // The actual login is handled by authService
    if (userData && userData.username) {
      const u = { 
        id: userData.id, 
        username: userData.username,
        email: userData.email,
        role: userData.role || 'user',
        token: userData.token 
      };
      persist(u);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid user data' };
  };

  const register = async (userData) => {
    // This function is now just for updating the context state
    // The actual registration is handled by authService
    if (userData && userData.username) {
      const u = { 
        id: userData.id, 
        username: userData.username, 
        email: userData.email,
        token: userData.token 
      };
      persist(u);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid user data' };
  };

  const logout = async () => {
    try {
      // Use authService for secure logout
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    try { 
      localStorage.removeItem('user');
      localStorage.removeItem('smartsecure_token');
      localStorage.removeItem('smartsecure_user');
      localStorage.removeItem('smartsecure_expires');
    } catch {}
  };

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
