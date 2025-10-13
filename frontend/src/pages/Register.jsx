import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    
    setError('');
    
    // Enhanced validation
    if(!form.username || !form.email || !form.password || !form.confirm) {
      return setError('All fields are required');
    }
    if(form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if(form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    if(form.username.length < 3) {
      return setError('Username must be at least 3 characters');
    }
    
    setLoading(true);
    
    try {
      // Use enhanced authService with JWT
      const result = await authService.register(form.username, form.email, form.password);
      
      if (result.success) {
        // Update auth context with new user data
        register({ 
          username: result.user.username, 
          id: result.user.id,
          email: result.user.email,
          token: result.token 
        });
        nav('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">{t('auth.register.title')}</h2>
          <p className="text-gray-600 text-lg">{t('auth.register.subtitle')}</p>
        </div>
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.register.username')}</label>
            <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 bg-white text-gray-800 placeholder-gray-400 outline-none transition-colors" placeholder="Choose a username" autoComplete="username" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.register.email')}</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white text-gray-800 placeholder-gray-400 outline-none transition-colors" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.register.password')}</label>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-400 bg-white text-gray-800 placeholder-gray-400 outline-none transition-colors" placeholder="Create password" autoComplete="new-password" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('auth.register.confirmPassword')}</label>
            <input type="password" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 bg-white text-gray-800 placeholder-gray-400 outline-none transition-colors" placeholder="Repeat password" autoComplete="new-password" required />
          </div>
          <button disabled={loading} className={`w-full py-4 px-6 rounded-xl font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700'}`}>{loading ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}</button>
        </form>
        <div className="text-center mt-8 text-gray-600 text-lg">{t('auth.register.haveAccount')} <Link to="/login" className="text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text font-bold hover:underline">{t('auth.register.signIn')}</Link></div>
        <div className="mt-8 text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{t('auth.register.devMode')}</div>
      </div>
    </div>
  );
}
