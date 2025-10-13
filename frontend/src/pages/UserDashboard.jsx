import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsed: 0,
    recentUploads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect admins to admin dashboard
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    
    loadUserStats();
  }, [user, navigate]);

  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem('smartsecure_token');
      
      // Get user's files
      const filesResponse = await fetch('http://localhost:5004/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        const files = filesData.files || [];
        
        const totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0);
        const recentFiles = files.filter(f => {
          const uploadDate = new Date(f.uploaded_at || f.upload_date);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return uploadDate > dayAgo;
        }).length;
        
        setStats({
          totalFiles: files.length,
          storageUsed: totalSize,
          recentUploads: recentFiles
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}! 👋</h1>
        <p className="text-blue-100 text-lg">
          Your secure dashboard for SmartSecure Sri Lanka
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Files */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📁</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{stats.totalFiles}</div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            All your uploaded files
          </div>
        </div>

        {/* Storage Used */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💾</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {(stats.storageUsed / 1024 / 1024).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">MB Used</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Storage space consumed
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">📤</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{stats.recentUploads}</div>
              <div className="text-sm text-gray-500">Last 24h</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Files uploaded recently
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/files')}
            className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📤</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Files</h3>
            <p className="text-sm text-gray-600">
              Upload and manage your secure files
            </p>
          </button>

          <button
            onClick={() => navigate('/files')}
            className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📂</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Files</h3>
            <p className="text-sm text-gray-600">
              View, download, and organize your files
            </p>
          </button>

          <button
            onClick={() => navigate('/security')}
            className="p-6 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔒</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Security Status</h3>
            <p className="text-sm text-gray-600">
              Check your account security and scan files
            </p>
          </button>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👤</span>
              <div>
                <div className="font-semibold text-gray-900">Account Status</div>
                <div className="text-sm text-gray-600">Your account is active and secure</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              ✓ Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <div>
                <div className="font-semibold text-gray-900">Security Level</div>
                <div className="text-sm text-gray-600">All files are encrypted and protected</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              🛡️ Protected
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-semibold text-gray-900">Storage Quota</div>
                <div className="text-sm text-gray-600">
                  {(stats.storageUsed / 1024 / 1024).toFixed(2)} MB of 100 MB used
                </div>
              </div>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{width: `${Math.min((stats.storageUsed / 1024 / 1024 / 100) * 100, 100)}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
