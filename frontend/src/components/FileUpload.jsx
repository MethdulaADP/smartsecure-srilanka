import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import authService from '../services/authService';

const FileUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    }
  });

  const uploadFile = async (fileItem) => {
    try {
      setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));
      
      const result = await authService.uploadFile(fileItem.file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: progress }));
      });

      if (result.success) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed', result }
            : f
        ));
        
        // Notify parent component of successful upload
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: result.error || 'Upload failed' }
            : f
        ));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', error: error.message || 'Upload failed' }
          : f
      ));
    }
  };

  const uploadAllFiles = async () => {
    setUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const fileItem of pendingFiles) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading' }
          : f
      ));
      await uploadFile(fileItem);
    }
    
    setUploading(false);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">⏳</div>;
      case 'uploading':
        return <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse flex items-center justify-center">⬆️</div>;
      case 'completed':
        return <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">✅</div>;
      case 'error':
        return <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">❌</div>;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">📁</span>
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900">
              {isDragActive ? 'Drop files here!' : 'Upload your files'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports: Images, PDFs, Documents, Archives (Max: 100MB each)
            </p>
          </div>
        </div>
      </div>

      {/* File Queue */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">
              📋 Upload Queue ({files.filter(f => f.status !== 'completed').length} pending)
            </h4>
            <div className="space-x-2">
              {files.some(f => f.status === 'pending') && (
                <button
                  onClick={uploadAllFiles}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? '⏳ Uploading...' : '🚀 Upload All'}
                </button>
              )}
              {files.some(f => f.status === 'completed') && (
                <button
                  onClick={clearCompleted}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ✨ Clear Completed
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(fileItem.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{fileItem.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                    {fileItem.error && (
                      <p className="text-xs text-red-600 mt-1">❌ {fileItem.error}</p>
                    )}
                    {fileItem.status === 'completed' && fileItem.result && (
                      <p className="text-xs text-green-600 mt-1">✅ Upload successful!</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {fileItem.status === 'uploading' && uploadProgress[fileItem.id] !== undefined && (
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[fileItem.id]}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{Math.round(uploadProgress[fileItem.id])}%</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Remove file"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;