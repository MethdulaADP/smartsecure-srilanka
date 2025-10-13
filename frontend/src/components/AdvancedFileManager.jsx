import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import authService from '../services/authService';
import './AdvancedFileManager.css';

const AdvancedFileManager = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [storageStats, setStorageStats] = useState({
    used: 0,
    total: 1000000000, // 1GB
    files: 0
  });

  useEffect(() => {
    loadFiles();
    loadStorageStats();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch(`${authService.getApiUrl()}/files`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const loadStorageStats = async () => {
    try {
      const response = await fetch(`${authService.getApiUrl()}/files/storage-stats`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setStorageStats(stats);
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newUploads = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));
    
    setUploadQueue(prev => [...prev, ...newUploads]);
    
    // Start uploading files one by one
    newUploads.forEach(upload => uploadFile(upload));
  }, []);

  const uploadFile = async (upload) => {
    const formData = new FormData();
    formData.append('file', upload.file);

    try {
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === upload.id 
            ? { ...item, status: 'uploading' }
            : item
        )
      );

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadQueue(prev => 
            prev.map(item => 
              item.id === upload.id 
                ? { ...item, progress }
                : item
            )
          );
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadQueue(prev => 
            prev.map(item => 
              item.id === upload.id 
                ? { ...item, status: 'completed', progress: 100 }
                : item
            )
          );
          loadFiles();
          loadStorageStats();
          
          // Remove completed upload after 3 seconds
          setTimeout(() => {
            setUploadQueue(prev => prev.filter(item => item.id !== upload.id));
          }, 3000);
        } else {
          setUploadQueue(prev => 
            prev.map(item => 
              item.id === upload.id 
                ? { ...item, status: 'error' }
                : item
            )
          );
        }
      };

      xhr.onerror = () => {
        setUploadQueue(prev => 
          prev.map(item => 
            item.id === upload.id 
              ? { ...item, status: 'error' }
              : item
          )
        );
      };

      xhr.open('POST', `${authService.getApiUrl()}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${authService.getToken()}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === upload.id 
            ? { ...item, status: 'error' }
            : item
        )
      );
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.csv'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/zip': ['.zip', '.rar', '.7z']
    },
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const deleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`${authService.getApiUrl()}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      if (response.ok) {
        loadFiles();
        loadStorageStats();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await fetch(`${authService.getApiUrl()}/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
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
      console.error('Failed to download file:', error);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(file => file.id)));
    }
  };

  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;
    if (!window.confirm(`Delete ${selectedFiles.size} selected files?`)) return;

    try {
      const deletePromises = Array.from(selectedFiles).map(fileId =>
        fetch(`${authService.getApiUrl()}/files/${fileId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        })
      );

      await Promise.all(deletePromises);
      setSelectedFiles(new Set());
      loadFiles();
      loadStorageStats();
    } catch (error) {
      console.error('Failed to delete selected files:', error);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      ppt: '📊', pptx: '📊',
      txt: '📄', md: '📄',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', bmp: '🖼️',
      mp4: '🎥', avi: '🎥', mov: '🎥',
      mp3: '🎵', wav: '🎵',
      zip: '📦', rar: '📦', '7z': '📦'
    };
    return iconMap[ext] || '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files
    .filter(file => {
      if (filter === 'all') return true;
      if (filter === 'images') return /\.(jpg|jpeg|png|gif|bmp)$/i.test(file.filename);
      if (filter === 'documents') return /\.(pdf|doc|docx|txt|md)$/i.test(file.filename);
      if (filter === 'archives') return /\.(zip|rar|7z)$/i.test(file.filename);
      return true;
    })
    .filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.filename.localeCompare(b.filename);
      if (sortBy === 'size') return b.file_size - a.file_size;
      if (sortBy === 'date') return new Date(b.upload_date) - new Date(a.upload_date);
      return 0;
    });

  const openPreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const storagePercentage = (storageStats.used / storageStats.total) * 100;

  return (
    <div className="advanced-file-manager">
      <div className="file-manager-header">
        <div className="header-content">
          <h1>📁 Advanced File Manager</h1>
          <div className="storage-info">
            <div className="storage-text">
              {formatFileSize(storageStats.used)} / {formatFileSize(storageStats.total)} used
            </div>
            <div className="storage-bar">
              <div 
                className="storage-fill" 
                style={{ 
                  width: `${storagePercentage}%`,
                  backgroundColor: storagePercentage > 90 ? '#e74c3c' : storagePercentage > 70 ? '#f39c12' : '#27ae60'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="upload-section">
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <div className="dropzone-icon">☁️</div>
            <div className="dropzone-text">
              {isDragActive ? (
                <p>Drop files here...</p>
              ) : (
                <>
                  <p><strong>Drag & drop files here</strong> or <span className="browse-link">browse</span></p>
                  <p className="dropzone-hint">Supports: Images, Documents, Archives (Max: 100MB each)</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="upload-queue">
            <h3>📤 Uploading Files</h3>
            {uploadQueue.map(upload => (
              <div key={upload.id} className="upload-item">
                <div className="upload-info">
                  <span className="upload-icon">{getFileIcon(upload.file.name)}</span>
                  <span className="upload-name">{upload.file.name}</span>
                  <span className="upload-size">{formatFileSize(upload.file.size)}</span>
                </div>
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${upload.progress}%`,
                        backgroundColor: upload.status === 'error' ? '#e74c3c' : upload.status === 'completed' ? '#27ae60' : '#3498db'
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {upload.status === 'completed' && '✅ Complete'}
                    {upload.status === 'error' && '❌ Failed'}
                    {upload.status === 'uploading' && `${upload.progress}%`}
                    {upload.status === 'pending' && 'Pending...'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="file-controls">
        <div className="controls-left">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Files</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="archives">Archives</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>

        <div className="controls-right">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⚏ Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
          </div>

          {selectedFiles.size > 0 && (
            <div className="bulk-actions">
              <span className="selection-count">{selectedFiles.size} selected</span>
              <button onClick={deleteSelectedFiles} className="delete-selected-btn">
                🗑️ Delete Selected
              </button>
            </div>
          )}

          <button onClick={selectAllFiles} className="select-all-btn">
            {selectedFiles.size === filteredFiles.length ? '❌ Deselect All' : '✅ Select All'}
          </button>
        </div>
      </div>

      {/* File List */}
      <div className={`file-list ${viewMode}`}>
        {filteredFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No files found</h3>
            <p>Upload some files or adjust your search criteria</p>
          </div>
        ) : (
          filteredFiles.map(file => (
            <div 
              key={file.id} 
              className={`file-item ${selectedFiles.has(file.id) ? 'selected' : ''}`}
            >
              <div className="file-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                />
              </div>
              
              <div className="file-icon" onClick={() => openPreview(file)}>
                {getFileIcon(file.filename)}
              </div>
              
              <div className="file-info" onClick={() => openPreview(file)}>
                <div className="file-name">{file.filename}</div>
                <div className="file-meta">
                  <span className="file-size">{formatFileSize(file.file_size)}</span>
                  <span className="file-date">{formatDate(file.upload_date)}</span>
                </div>
              </div>
              
              <div className="file-actions">
                <button 
                  onClick={() => openPreview(file)}
                  className="action-btn preview-btn"
                  title="Preview"
                >
                  👁️
                </button>
                <button 
                  onClick={() => downloadFile(file.id, file.filename)}
                  className="action-btn download-btn"
                  title="Download"
                >
                  ⬇️
                </button>
                <button 
                  onClick={() => deleteFile(file.id)}
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <div className="preview-modal" onClick={() => setShowPreview(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>{previewFile.filename}</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="close-preview-btn"
              >
                ✕
              </button>
            </div>
            
            <div className="preview-body">
              {/\.(jpg|jpeg|png|gif|bmp)$/i.test(previewFile.filename) ? (
                <img 
                  src={`${authService.getApiUrl()}/download/${previewFile.id}`}
                  alt={previewFile.filename}
                  className="preview-image"
                />
              ) : (
                <div className="preview-placeholder">
                  <div className="placeholder-icon">{getFileIcon(previewFile.filename)}</div>
                  <h4>{previewFile.filename}</h4>
                  <p>Size: {formatFileSize(previewFile.file_size)}</p>
                  <p>Uploaded: {formatDate(previewFile.upload_date)}</p>
                  <button 
                    onClick={() => downloadFile(previewFile.id, previewFile.filename)}
                    className="download-preview-btn"
                  >
                    ⬇️ Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFileManager;