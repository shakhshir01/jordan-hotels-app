import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { hotelAPI } from '../services/api';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';
import { useTranslation } from 'react-i18next';

const AdminUpload = () => {
  const { t } = useTranslation();
  const [hotelId, setHotelId] = useState('');
  const [experienceId, setExperienceId] = useState('');
  const [uploadType, setUploadType] = useState('hotel'); // 'hotel' or 'experience'
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [completedUploads, setCompletedUploads] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const targetId = uploadType === 'hotel' ? hotelId : experienceId;
    if (!targetId.trim()) {
      showError(`Please enter a ${uploadType} ID`);
      return;
    }

    if (files.length === 0) {
      showError('Please select at least one image');
      return;
    }

    setUploading(true);
    setUploadProgress({});
    setCompletedUploads([]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${Date.now()}-${i}`;

        setUploadProgress(prev => ({ ...prev, [fileId]: 'Getting upload URL...' }));

        try {
          // Get signed URL for upload
          const { url, key } = await hotelAPI.getS3UploadUrl(file.name, file.type);

          setUploadProgress(prev => ({ ...prev, [fileId]: 'Uploading to S3...' }));

          // Upload file to S3
          await hotelAPI.uploadFileToSignedUrl(url, file);

          setUploadProgress(prev => ({ ...prev, [fileId]: 'Registering with backend...' }));

          // Register image with backend
          if (uploadType === 'hotel') {
            await hotelAPI.registerHotelImage(targetId, key);
          } else {
            await hotelAPI.registerExperienceImage(targetId, key);
          }

          setCompletedUploads(prev => [...prev, fileId]);
          setUploadProgress(prev => ({ ...prev, [fileId]: 'Complete' }));

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [fileId]: `Failed: ${error.message}` }));
          showError(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      showSuccess(`Successfully uploaded ${completedUploads.length} of ${files.length} images`);

      // Clear completed files
      setFiles([]);
      setUploadProgress({});
      setCompletedUploads([]);

    } catch (error) {
      showError('Upload process failed');
    } finally {
      setUploading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
            Admin Image Upload
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Upload images for hotels and experiences
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          {/* Upload Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Upload Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="hotel"
                  checked={uploadType === 'hotel'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                Hotel Images
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="experience"
                  checked={uploadType === 'experience'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                Experience Images
              </label>
            </div>
          </div>

          {/* ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {uploadType === 'hotel' ? 'Hotel ID' : 'Experience ID'}
            </label>
            <input
              type="text"
              value={uploadType === 'hotel' ? hotelId : experienceId}
              onChange={(e) => uploadType === 'hotel' ? setHotelId(e.target.value) : setExperienceId(e.target.value)}
              placeholder={`Enter ${uploadType} ID`}
              className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
              required
            />
          </div>

          {/* File Dropzone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Images
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Drop the images here...
                </p>
              ) : (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Supports JPEG, PNG, WebP, GIF (max 10MB each)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={uploading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Upload Progress
              </h3>
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([fileId, status]) => (
                  <div key={fileId} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    {status === 'Complete' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : status.includes('Failed') ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    <span className={`text-sm ${
                      status === 'Complete' ? 'text-green-600 dark:text-green-400' :
                      status.includes('Failed') ? 'text-red-600 dark:text-red-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0 || !(uploadType === 'hotel' ? hotelId : experienceId).trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white p-4 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-slate-400 disabled:hover:to-slate-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:translate-y-0"
          >
            <span className="flex items-center justify-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload {files.length} Image{files.length !== 1 ? 's' : ''}
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;
