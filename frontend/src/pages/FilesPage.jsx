import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function FilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem('smartsecure_token');
      const response = await fetch('http://localhost:5004/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('smartsecure_token');
        const response = await fetch('http://localhost:5004/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      await loadFiles();
      setError('');
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const token = localStorage.getItem('smartsecure_token');
      const response = await fetch(`http://localhost:5004/download/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Download failed');
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'pdf': '📄',
      'doc': '📝', 'docx': '📝',
      'xls': '📊', 'xlsx': '📊',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
      'zip': '📦', 'rar': '📦',
      'mp4': '🎥', 'avi': '🎥',
      'mp3': '🎵',
      'txt': '📃'
    };
    return icons[ext] || '📄';
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toUpperCase();
    return ext;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    const ext = file.filename.split('.').pop().toLowerCase();
    if (filter === 'images') return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
    if (filter === 'documents') return ['pdf', 'doc', 'docx', 'txt'].includes(ext);
    if (filter === 'archives') return ['zip', 'rar'].includes(ext);
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Loading your files...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📁 My Files</h1>
            <p className="text-gray-600">Manage, upload, and download your secure files</p>
          </div>
          
          <label className={`px-6 py-3 rounded-xl font-bold text-white cursor-pointer transition-all shadow-lg ${
            uploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105'
          }`}>
            {uploading ? '⏳ Uploading...' : '📤 Upload Files'}
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
              accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx,.zip,.csv,.xlsx,.xls"
            />
          </label>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Uploading...</span>
              <span className="text-sm font-semibold text-blue-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{width: `${uploadProgress}%`}}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Files ({files.length})
          </button>
          <button
            onClick={() => setFilter('images')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'images'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🖼️ Images
          </button>
          <button
            onClick={() => setFilter('documents')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'documents'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📄 Documents
          </button>
          <button
            onClick={() => setFilter('archives')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'archives'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📦 Archives
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No files yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first file to get started with secure storage
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group"
            >
              {/* File Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{getFileIcon(file.filename)}</div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {getFileType(file.filename)}
                </span>
              </div>

              {/* File Name */}
              <h3 className="font-bold text-gray-900 mb-2 truncate" title={file.filename}>
                {file.filename}
              </h3>

              {/* File Info */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-semibold text-gray-900">
                    {formatFileSize(file.file_size)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(file.uploaded_at || file.upload_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="flex items-center space-x-1">
                    <span className="text-green-600">✓</span>
                    <span className="font-semibold text-green-600">Safe</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleDownload(file.secure_filename || file.filename)}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                ⬇️ Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
