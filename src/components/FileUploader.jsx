import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';

const FileUploader = ({
  onFilesSelected,
  accept = "image/*,.pdf,.doc,.docx",
  multiple = true,
  maxFiles = 5,
  maxSizePerFile = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // File type configurations
  const fileTypeConfig = {
    'image/jpeg': { icon: Image, color: 'text-green-500', label: 'JPEG Image' },
    'image/png': { icon: Image, color: 'text-green-500', label: 'PNG Image' },
    'image/gif': { icon: Image, color: 'text-green-500', label: 'GIF Image' },
    'image/webp': { icon: Image, color: 'text-green-500', label: 'WebP Image' },
    'application/pdf': { icon: File, color: 'text-red-500', label: 'PDF Document' },
    'application/msword': { icon: File, color: 'text-blue-500', label: 'Word Document' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
      icon: File, color: 'text-blue-500', label: 'Word Document' 
    },
    'default': { icon: File, color: 'text-gray-500', label: 'Document' }
  };

  // Validate file
  const validateFile = (file) => {
    const errors = [];
    
    if (file.size > maxSizePerFile) {
      errors.push(`File size must be less than ${formatFileSize(maxSizePerFile)}`);
    }
    
    // Check file type if accept is specified
    if (accept && accept !== "*/*") {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });
      
      if (!isAccepted) {
        errors.push('File type not supported');
      }
    }
    
    return errors;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle files
  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    // Check max files limit
    if (selectedFiles.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      setErrors(newErrors);
      return;
    }

    fileArray.forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(`${file.name}: ${fileErrors.join(', ')}`);
      } else {
        // Add unique ID to file
        const fileWithId = Object.assign(file, {
          id: `${Date.now()}-${index}`,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
        validFiles.push(fileWithId);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
    }

    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
      setSelectedFiles(updatedFiles);
      onFilesSelected && onFilesSelected(updatedFiles);
    }
  }, [selectedFiles, maxFiles, maxSizePerFile, accept, multiple, onFilesSelected]);

  // Drag handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Input change handler
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (fileId) => {
    const updatedFiles = selectedFiles.filter(file => file.id !== fileId);
    setSelectedFiles(updatedFiles);
    onFilesSelected && onFilesSelected(updatedFiles);
    
    // Revoke object URL to prevent memory leaks
    const removedFile = selectedFiles.find(file => file.id === fileId);
    if (removedFile && removedFile.preview) {
      URL.revokeObjectURL(removedFile.preview);
    }
  };

  // Clear all files
  const clearFiles = () => {
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setSelectedFiles([]);
    setErrors([]);
    setUploadProgress({});
    onFilesSelected && onFilesSelected([]);
  };

  // Get file type info
  const getFileTypeInfo = (file) => {
    return fileTypeConfig[file.type] || fileTypeConfig.default;
  };

  // Render file preview
  const renderFilePreview = (file) => {
    const typeInfo = getFileTypeInfo(file);
    const Icon = typeInfo.icon;
    const progress = uploadProgress[file.id];

    return (
      <div key={file.id} className="relative bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center space-x-3">
          {file.preview ? (
            <img
              src={file.preview}
              alt={file.name}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
              <Icon className={`w-6 h-6 ${typeInfo.color}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {typeInfo.label}
            </p>
            
            {progress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => removeFile(file.id)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label={`Remove ${file.name}`}
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-label="File upload"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {dragActive ? 'Drop files here' : 'Upload files'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>Maximum {maxFiles} files, {formatFileSize(maxSizePerFile)} per file</p>
          <p>Supported formats: Images, PDF, Word documents</p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                Upload Errors
              </h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({selectedFiles.length}/{maxFiles})
            </h4>
            <button
              onClick={clearFiles}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map(renderFilePreview)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;