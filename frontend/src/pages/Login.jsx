import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import authService from '../services/authService';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();
  const [form, setForm] = useState({ username:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Load debug script in development
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/src/debug-auth.js';
    script.type = 'module';
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const submit = async e => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    
    setLoading(true); 
    setError('');
    
    if(!form.username || !form.password) { 
      setError('Username and password are required'); 
      setLoading(false); 
      return; 
    }
    
    try {
      // Use enhanced authService with JWT
      const result = await authService.login(form.username, form.password);
      
      if (result.success) {
        // Update auth context with new user data
        login({ 
          username: result.user.username, 
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          token: result.token 
        });
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          nav('/admin');
        } else {
          nav('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">SS</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">{t('auth.login.title')}</h2>
          <p className="text-gray-600 text-lg">{t('auth.login.subtitle')}</p>
        </div>
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.login.username')}</label>
            <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 bg-white text-gray-800 placeholder-gray-400 outline-none transition-colors" placeholder="Your username" autoComplete="username" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.login.password')}</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white text-gray-800 placeholder-gray-400 outline-none transition-colors" placeholder="••••••••" autoComplete="current-password" required />
          </div>
          <button disabled={loading} className={`w-full py-4 px-6 rounded-xl font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700'}`}>{loading ? t('auth.login.signingIn') : t('auth.login.signIn')}</button>
        </form>
        <div className="text-center mt-8 text-gray-600 text-lg">{t('auth.login.noAccount')} <Link to="/register" className="text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text font-bold hover:underline">{t('auth.login.createAccount')}</Link></div>
        <div className="mt-8 text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{t('auth.login.devMode')}</div>
      </div>
    </div>
  );
}
