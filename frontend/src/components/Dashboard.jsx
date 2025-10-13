import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';

function Dashboard({ user, onLogout }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [files, setFiles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [securityStatus, setSecurityStatus] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const userId = user?.id;

  const refresh = async () => {
    if (!authService.isAuthenticated()) return;
    
    try {
      const [fRes, aRes, sRes] = await Promise.all([
        authService.getFiles(),
        authService.getAnalytics(),
        authService.getSecurityStatus()
      ]);
      
      if (fRes.success) {
        setFiles(fRes.files);
      } else {
        setError(fRes.error || 'Failed to load files');
      }
      
      if (aRes.success) {
        setAnalytics(aRes.analytics);
      } else {
        setError(aRes.error || 'Failed to load analytics');
      }
      
      if (sRes.success) {
        setSecurityStatus(sRes.security_status);
      }
      
      // Load audit logs for security tab
      if (activeTab === 'security') {
        const auditRes = await authService.getAuditLogs();
        if (auditRes.success) {
          setAuditLogs(auditRes.audit_logs);
        }
      }
    } catch (e) {
      console.error('Refresh error:', e);
      setError('Network error');
    }
  };

  useEffect(() => {
    if (authService.isAuthenticated()) {
      refresh();
    }
  }, [userId, activeTab]);

  const handleUploadFiles = async (selected) => {
    if (!selected?.length || !authService.isAuthenticated()) return;
    
    setUploading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      for (const file of selected) {
        const res = await authService.uploadFile(file, (progress) => {
          setUploadProgress(Math.round(progress));
        });
        
        if (!res.success) {
          setError(res.error || 'Upload failed');
          break;
        }
      }
      await refresh();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onFileInput = (e) => {
    handleUploadFiles(Array.from(e.target.files || []));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SmartSecure Sri Lanka</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">{t('dashboard.welcome')}</h2>
          <p className="text-blue-100 mb-6">
            {t('dashboard.subtitle')}
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{analytics?.total_files ?? 0}</div>
              <div className="text-blue-100 text-sm">Files Uploaded</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{((analytics?.total_storage||0)/1024/1024).toFixed(2)} MB</div>
              <div className="text-blue-100 text-sm">Storage Used</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{files.length ? 'Active' : 'Idle'}</div>
              <div className="text-blue-100 text-sm">Status</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'files', label: 'My Files', icon: '📁' },
                { id: 'security', label: 'Security', icon: '🔒' },
                { id: 'ai', label: 'AI Insights', icon: '🤖' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Quick Actions</h4>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => setActiveTab('files')}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">📤</span>
                          <div>
                            <div className="font-medium text-gray-900">Upload Files</div>
                            <div className="text-sm text-gray-500">Add new files to your secure storage</div>
                          </div>
                        </div>
                      </button>

                      <button 
                        onClick={() => setActiveTab('security')}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🛡️</span>
                          <div>
                            <div className="font-medium text-gray-900">Security Scan</div>
                            <div className="text-sm text-gray-500">Run AI security analysis</div>
                          </div>
                        </div>
                      </button>

                      <button 
                        onClick={() => setActiveTab('ai')}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">📈</span>
                          <div>
                            <div className="font-medium text-gray-900">View Insights</div>
                            <div className="text-sm text-gray-500">AI-powered recommendations</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500 text-center py-8">
                        Activity feed coming soon
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.files.title')}</h3>
                  <div className="flex items-center space-x-4">
                    {uploading && (
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{uploadProgress}%</span>
                      </div>
                    )}
                    <label className={`px-4 py-2 rounded-lg font-medium cursor-pointer ${
                      uploading 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                      {uploading ? t('dashboard.files.uploading') : t('dashboard.files.uploadFiles')}
                      <input 
                        type="file" 
                        multiple 
                        onChange={onFileInput} 
                        className="hidden" 
                        disabled={uploading}
                        accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx,.zip,.csv"
                      />
                    </label>
                  </div>
                </div>
                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                {files.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📁</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No files yet</h4>
                    <p className="text-gray-500 mb-2">Use the upload button to add your first file.</p>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left px-4 py-2 font-semibold">Name</th>
                          <th className="text-left px-4 py-2 font-semibold">Size (KB)</th>
                          <th className="text-left px-4 py-2 font-semibold">Uploaded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map(f => (
                          <tr key={f.id} className="border-t">
                            <td className="px-4 py-2 text-gray-800">{f.filename}</td>
                            <td className="px-4 py-2 text-gray-500">{(f.file_size/1024).toFixed(1)}</td>
                            <td className="px-4 py-2 text-gray-500">{new Date(f.uploaded_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.security.title')}</h3>
                
                {/* Security Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className={`border rounded-lg p-6 ${
                    securityStatus?.risk_level === 'LOW' 
                      ? 'bg-green-50 border-green-200' 
                      : securityStatus?.risk_level === 'MEDIUM'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">
                        {securityStatus?.risk_level === 'LOW' ? '✅' : 
                         securityStatus?.risk_level === 'MEDIUM' ? '⚠️' : '🚨'}
                      </span>
                      <h4 className={`font-semibold ${
                        securityStatus?.risk_level === 'LOW' ? 'text-green-800' :
                        securityStatus?.risk_level === 'MEDIUM' ? 'text-yellow-800' :
                        'text-red-800'
                      }`}>
                        Security Status
                      </h4>
                    </div>
                    <p className={`mb-2 ${
                      securityStatus?.risk_level === 'LOW' ? 'text-green-700' :
                      securityStatus?.risk_level === 'MEDIUM' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      Risk Level: {securityStatus?.risk_level || 'Loading...'}
                    </p>
                    <div className="text-sm">
                      {securityStatus?.suspicious_activity ? (
                        <div className="text-red-600">
                          ⚠️ Suspicious activity detected
                        </div>
                      ) : (
                        <div className="text-green-600">
                          ✅ No suspicious activity
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">🔐</span>
                      <h4 className="font-semibold text-blue-800">JWT Authentication</h4>
                    </div>
                    <p className="text-blue-700 mb-2">Token-based security active</p>
                    <div className="text-sm text-blue-600">
                      ✅ Secure session management
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">🛡️</span>
                      <h4 className="font-semibold text-purple-800">File Protection</h4>
                    </div>
                    <p className="text-purple-700 mb-2">Enhanced upload security</p>
                    <div className="text-sm text-purple-600">
                      ✅ Malware scanning active
                    </div>
                  </div>
                </div>

                {/* Security Indicators */}
                {securityStatus?.indicators && securityStatus.indicators.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">⚠️ Security Alerts</h4>
                    <ul className="space-y-2">
                      {securityStatus.indicators.map((indicator, index) => (
                        <li key={index} className="text-yellow-700 text-sm">
                          • {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recent Security Activity */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">📋 Recent Security Activity</h4>
                  {auditLogs.length === 0 ? (
                    <div className="text-gray-500 text-sm">No recent security activity</div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {auditLogs.map((log, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm">
                          <span className="text-blue-500 mt-1">•</span>
                          <div className="flex-1">
                            <div className="text-gray-900">{log.description}</div>
                            <div className="text-gray-500 text-xs">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Insights</h3>
                {!analytics && <div className="text-sm text-gray-500">Loading analytics...</div>}
                {analytics && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white border rounded-lg p-6">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{analytics.total_files}</div>
                      <div className="text-sm text-gray-600">Total Files</div>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{(analytics.total_storage/1024/1024).toFixed(2)} MB</div>
                      <div className="text-sm text-gray-600">Storage Used</div>
                    </div>
                    <div className="bg-white border rounded-lg p-6">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{Object.keys(analytics.by_type || {}).length}</div>
                      <div className="text-sm text-gray-600">File Categories</div>
                    </div>
                    <div className="md:col-span-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">File Type Breakdown</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {Object.entries(analytics.by_type || {}).map(([k,v]) => (
                          <span key={k} className="bg-white/20 px-3 py-1 rounded-full">{k}: {v}</span>
                        ))}
                        {Object.keys(analytics.by_type || {}).length === 0 && <span className="text-white/70">No files yet</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;