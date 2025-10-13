import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Brand */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">SS</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SmartSecure</h1>
                  <p className="text-xs text-gray-500">Sri Lanka</p>
                </div>
              </div>

              {/* Main Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/files"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/files')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📁 Files
                </Link>
                <Link
                  to="/security"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive('/security')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🔒 Security
                </Link>
              </div>
            </div>

            {/* Right: Public Pages Link + User Menu */}
            <div className="flex items-center space-x-4">
              {/* Quick Access to Public Pages */}
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500">Quick Access:</span>
                <Link to="/" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  Home
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/services" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  Services
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/about" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  About
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/contact" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  Contact
                </Link>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 border-l pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'User Account'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all text-sm"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
