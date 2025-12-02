import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

/**
 * ImageUpload Component
 * 
 * ✅ Features:
 * - Drag & drop support
 * - File preview before upload
 * - Progress indication
 * - Error handling with details
 * - Cloudinary integration via backend /api/upload
 * 
 * Usage:
 * <ImageUpload 
 *   onSuccess={(url) => setImageUrl(url)}
 *   onError={(error) => console.error(error)}
 * />
 */
export default function ImageUpload({ onSuccess, onError, maxSize = 5242880 }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const fileInputRef = useRef(null);

  const generatePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Пожалуйста выберите изображение');
      return;
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      setErrorMessage(`Размер файла не должен превышать ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    setErrorMessage(null);
    setFile(selectedFile);
    generatePreview(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  const uploadToCloudinary = async () => {
    if (!file) {
      setErrorMessage('Пожалуйста выберите файл');
      return;
    }

    setIsUploading(true);
    setUploadStatus('loading');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'Cloudy'); // Your asset folder

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('You must be logged in to upload images');
      }

      console.log('[ImageUpload] 📤 Uploading file:', file.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('[ImageUpload] 📥 Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
        
        const errorMsg = errorData.message || errorData.error || 'Upload failed';
        console.error('[ImageUpload] ❌ Upload error:', errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('[ImageUpload] ✅ Upload success!');
      console.log('[ImageUpload] 🔗 URL:', data.url);
      console.log('[ImageUpload] 📊 Details:', { 
        size: `${(data.size / 1024).toFixed(2)}KB`,
        format: data.format,
        dimensions: `${data.width}x${data.height}`
      });

      setUploadedUrl(data.url);
      setUploadStatus('success');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
        onSuccess?.(data.url);
      }, 2000);

    } catch (error) {
      console.error('[ImageUpload] ❌ Error:', error);
      setErrorMessage(error.message || 'Failed to upload image');
      setUploadStatus('error');
      onError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setUploadStatus(null);
    setErrorMessage(null);
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sky-400 transition cursor-pointer bg-gray-50 hover:bg-sky-50"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          className="hidden"
        />

        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="space-y-2"
          >
            <Upload size={40} className="mx-auto text-gray-400" />
            <div>
              <p className="font-semibold text-gray-700">
                Перетащите файл или нажмите для выбора
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF до {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
            </div>
          </div>
        ) : (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto rounded"
          />
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{errorMessage}</div>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus === 'loading' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-2 items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-blue-700">Загружаю на Cloudinary...</p>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 items-start">
          <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-700">Изображение успешно загружено!</div>
        </div>
      )}

      {/* Uploaded URL Display */}
      {uploadedUrl && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase">URL Изображения:</p>
          <code className="text-xs bg-white p-2 rounded border border-gray-200 block overflow-x-auto text-gray-700 break-all">
            {uploadedUrl}
          </code>
        </div>
      )}

      {/* Action Buttons */}
      {preview && !uploadStatus && (
        <div className="flex gap-2">
          <button
            onClick={uploadToCloudinary}
            disabled={isUploading}
            className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700 transition disabled:opacity-50"
          >
            {isUploading ? 'Загружаю...' : '📤 Загрузить'}
          </button>
          <button
            onClick={resetForm}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
