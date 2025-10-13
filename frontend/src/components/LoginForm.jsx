import { useState } from 'react';

function LoginForm({ onLogin, switchToRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { username: formData.username });
      console.log('Backend URL:', 'http://localhost:5004/login');
      
      // Make actual API call to backend
      const response = await fetch('http://localhost:5004/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // Success - save user info and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          username: data.user.username,
          email: data.user.email,
          id: data.user.id,
          role: data.user.role,
          loginTime: new Date().toISOString()
        }));
        
        console.log('Login successful, calling onLogin');
        onLogin({
          username: data.user.username,
          email: data.user.email,
          id: data.user.id,
          role: data.user.role,
          token: data.token
        });
      } else {
        console.error('Login failed:', data);
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError(`Network error: ${error.message}. Please check if the server is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">SS</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-lg">Sign in to SmartSecure Sri Lanka</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all duration-200 group-hover:border-gray-300"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 group-hover:border-gray-300"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-200 shadow-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed transform scale-95' 
                : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-105 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"></div>
                Signing in...
              </div>
            ) : (
              <span className="flex items-center justify-center">
                🚀 Sign In
              </span>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-lg">
            Don't have an account?{' '}
            <button
              onClick={switchToRegister}
              className="text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text hover:from-emerald-700 hover:to-blue-700 font-bold transition-all duration-200 hover:underline"
            >
              Create Account →
            </button>
          </p>
        </div>

        {/* Development Info */}
        <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl px-4 py-3">
            <p className="text-sm text-emerald-700 text-center flex items-center justify-center">
              <span className="mr-2">�</span>
              Demo Credentials: admin/admin123 or pamith/admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;