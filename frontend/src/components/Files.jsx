import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import authService from '../services/authService';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storageStats, setStorageStats] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadFiles();
    loadStorageStats();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await authService.getFiles();
      if (response.success) {
        setFiles(response.files || []);
      } else {
        setError(response.error || 'Failed to load files');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      const response = await fetch(`${authService.getApiUrl()}/files/storage-stats`, {
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      if (response.ok) {
        const stats = await response.json();
        setStorageStats(stats);
      }
    } catch (err) {
      console.error('Failed to load storage stats:', err);
    }
  };

  const handleFileUpload = async () => {
    await loadFiles();
    await loadStorageStats();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar':
      case '7z': return '📦';
      case 'txt': return '📋';
      default: return '📁';
    }
  };

  const handleDownload = async (file) => {
    try {
      const downloadUrl = `${authService.getApiUrl()}${file.downloadUrl}?token=${authService.getToken()}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Download failed: ' + err.message);
    }
  };

  const isImage = (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = filename.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };

  const ImagePreview = ({ file }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const previewUrl = `${authService.getApiUrl()}${file.previewUrl}?token=${authService.getToken()}`;

    return (
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
        {!imageError ? (
          <img
            src={previewUrl}
            alt={file.filename}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getFileIcon(file.filename)}
          </div>
        )}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    );
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch(`${authService.getApiUrl()}/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      
      if (response.ok) {
        await loadFiles();
        await loadStorageStats();
      } else {
        setError('Failed to delete file');
      }
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const handleSecurityScan = async (fileId) => {
    try {
      const response = await fetch(`${authService.getApiUrl()}/security/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ fileId })
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`Security Scan Complete!\nThreat Level: ${result.file.threatLevel}\nSafe: ${result.file.safe ? 'Yes' : 'No'}`);
        await loadFiles();
      } else {
        setError('Security scan failed');
      }
    } catch (err) {
      setError('Scan failed: ' + err.message);
    }
  };

  return (
    <div className="files-page min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            📁 My Files
          </h1>
          <p className="text-slate-600 text-lg">
            Secure file storage with AI-powered threat detection
          </p>
        </div>

        {/* Storage Stats */}
        {storageStats && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Storage Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{storageStats.totalFiles}</div>
                <div className="text-sm text-slate-600">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatFileSize(storageStats.totalSize)}</div>
                <div className="text-sm text-slate-600">Used Space</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatFileSize(storageStats.avgFileSize)}</div>
                <div className="text-sm text-slate-600">Avg File Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{storageStats.usagePercentage.toFixed(1)}%</div>
                <div className="text-sm text-slate-600">Storage Used</div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload New Files</h3>
          <FileUpload onUploadComplete={handleFileUpload} />
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Your Files ({files.length})</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}
                >
                  ☰
                </button>
              </div>
              <button
                onClick={loadFiles}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No files yet</h3>
              <p className="text-slate-600">Upload your first file to get started!</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.map((file) => (
                <div key={file.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="text-center mb-3">
                    {isImage(file.filename) ? (
                      <ImagePreview file={file} />
                    ) : (
                      <div className="text-4xl mb-2">{getFileIcon(file.filename)}</div>
                    )}
                    <h4 className="font-medium text-slate-800 truncate mt-2" title={file.filename}>
                      {file.filename}
                    </h4>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div>Size: {formatFileSize(file.file_size)}</div>
                    <div>Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</div>
                    <div className={`font-medium ${file.safe ? 'text-green-600' : 'text-red-600'}`}>
                      {file.safe ? '✅ Safe' : '⚠️ Needs Review'}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      📥 Download
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSecurityScan(file.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        🔍 Scan
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Security</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isImage(file.filename) ? (
                            <div className="w-12 h-12 mr-3 rounded-lg overflow-hidden">
                              <ImagePreview file={file} />
                            </div>
                          ) : (
                            <span className="text-2xl mr-3">{getFileIcon(file.filename)}</span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-900">{file.filename}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          file.safe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {file.safe ? '✅ Safe' : '⚠️ Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(file)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            📥 Download
                          </button>
                          <button
                            onClick={() => handleSecurityScan(file.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            🔍 Scan
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Files;