import React from 'react';
import FileUpload from '../components/FileUpload';

const Files = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
          <p className="text-gray-600 mt-2">Upload, manage, and download your secure files</p>
        </div>
        <FileUpload />
      </div>
    </div>
  );
};

export default Files;