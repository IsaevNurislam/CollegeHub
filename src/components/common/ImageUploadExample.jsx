import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

/**
 * ✅ COMPLETE EXAMPLE - How to use ImageUpload component
 * 
 * This example shows:
 * 1. Upload image through backend to Cloudinary
 * 2. Get URL from Cloudinary
 * 3. Display uploaded image in component
 * 4. Store URL in state for further use
 */
export default function ImageUploadExample() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isDisplaying, setIsDisplaying] = useState(false);

  const handleUploadSuccess = (url) => {
    console.log('✅ Image uploaded successfully!');
    console.log('🔗 Cloudinary URL:', url);
    setUploadedImageUrl(url);
    setIsDisplaying(true);
  };

  const handleUploadError = (error) => {
    console.error('❌ Upload failed:', error);
    setIsDisplaying(false);
  };

  const removeImage = () => {
    setUploadedImageUrl(null);
    setIsDisplaying(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ☁️ Cloudinary Image Upload
        </h1>
        <p className="text-gray-600">
          Upload images via backend to Cloudinary with secure authentication
        </p>
      </div>

      {/* Upload Component */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📸 Upload Image</h2>
        <ImageUpload
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          maxSize={5242880} // 5MB
        />
      </div>

      {/* Display Uploaded Image */}
      {isDisplaying && uploadedImageUrl && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">📷 Uploaded Image</h2>
            <button
              onClick={removeImage}
              className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
            >
              Remove
            </button>
          </div>

          {/* Image Preview */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={uploadedImageUrl}
              alt="Uploaded from Cloudinary"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Cloudinary URL:
            </p>
            <div className="bg-gray-50 border border-gray-300 rounded p-3 overflow-x-auto">
              <code className="text-xs text-gray-700 break-all">
                {uploadedImageUrl}
              </code>
            </div>
            
            {/* Copy Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(uploadedImageUrl);
                alert('URL copied to clipboard!');
              }}
              className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium transition"
            >
              📋 Copy URL to Clipboard
            </button>
          </div>

          {/* Usage Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-900">💡 How to use this URL:</p>
            <pre className="text-xs bg-white p-2 rounded border border-blue-200 overflow-x-auto text-gray-700">
{`// In React component:
<img 
  src="${uploadedImageUrl}" 
  alt="From Cloudinary" 
/>

// Or store in database:
const club = {
  name: "My Club",
  backgroundUrl: "${uploadedImageUrl}",
  // ... other fields
};`}
            </pre>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-sky-900">ℹ️ How It Works</h3>
        
        <div className="space-y-3 text-sm text-sky-800">
          <div className="flex gap-3">
            <span className="text-lg">1️⃣</span>
            <div>
              <p className="font-semibold">Select Image</p>
              <p className="text-sky-700">Choose image from your device or drag & drop</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg">2️⃣</span>
            <div>
              <p className="font-semibold">Upload to Backend</p>
              <p className="text-sky-700">Frontend sends file to <code className="bg-white px-1 rounded">/api/upload</code></p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg">3️⃣</span>
            <div>
              <p className="font-semibold">Backend Uploads to Cloudinary</p>
              <p className="text-sky-700">Secure upload with folder: "Cloudy"</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg">4️⃣</span>
            <div>
              <p className="font-semibold">Get Cloudinary URL</p>
              <p className="text-sky-700">Backend returns secure HTTPS URL</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg">5️⃣</span>
            <div>
              <p className="font-semibold">Use in App</p>
              <p className="text-sky-700">Display image or save URL to database</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-sky-200 rounded p-3 text-xs space-y-1">
          <p className="font-semibold text-sky-900">🔐 Security:</p>
          <ul className="list-disc list-inside text-sky-700 space-y-1">
            <li>API Secret never exposed to frontend</li>
            <li>Authentication required (JWT token)</li>
            <li>Server-side upload only</li>
            <li>Cloudinary handles CDN distribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
