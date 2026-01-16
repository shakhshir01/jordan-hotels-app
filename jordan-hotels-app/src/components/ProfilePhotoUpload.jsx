import React, { useState, useRef } from 'react';
import { UploadCloud, X, Check } from 'lucide-react';
import { hotelAPI } from '../services/api';
import { showSuccess, showError } from '../services/toastService';

export default function ProfilePhotoUpload({ currentAvatarUrl, onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentAvatarUrl || null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return showError('Please upload an image file');
    setLoading(true);
    try {
      const filename = `profile_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const { url, key } = await hotelAPI.getS3UploadUrl(filename, file.type);
      await hotelAPI.uploadFileToSignedUrl(url, file);
      // Persist avatar key on user profile - backend should expose final URL from key
      const updated = await hotelAPI.updateUserProfile({ avatarKey: key });
      const newAvatarUrl = updated?.avatarUrl || updated?.avatar || null;
      setPreview(newAvatarUrl || URL.createObjectURL(file));
      showSuccess('Profile photo updated');
      onUploaded && onUploaded(updated);
    } catch (err) {
      console.error('Upload error', err);
      // Fallback for demo mode or API failures
      if (err?.message?.includes('CORS') || err?.message?.includes('502') || err?.message?.includes('Network Error')) {
        console.warn('API upload failed, using local preview for demo mode');
        setPreview(URL.createObjectURL(file));
        showSuccess('Profile photo updated (demo mode)');
        onUploaded && onUploaded({ avatarUrl: URL.createObjectURL(file) });
      } else {
        showError(err?.message || 'Failed to upload image');
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const f = e.target.files && e.target.files[0];
    handleFile(f);
  };

  const onPick = () => inputRef.current?.click();

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-500">No photo</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
        <div className="flex gap-2">
          <button type="button" onClick={onPick} disabled={loading} className="btn-primary inline-flex items-center gap-2 px-4 py-2 min-h-[44px]">
            <UploadCloud size={16} />
            {loading ? 'Uploading...' : 'Change Photo'}
          </button>
          <button
            type="button"
            onClick={async () => {
              // Remove photo
              if (!window.confirm('Remove profile photo?')) return;
              try {
                setLoading(true);
                const updated = await hotelAPI.updateUserProfile({ avatarKey: null });
                setPreview(null);
                showSuccess('Profile photo removed');
                onUploaded && onUploaded(updated);
              } catch (err) {
                showError('Failed to remove photo');
              } finally {
                setLoading(false);
              }
            }}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 min-h-[44px]"
            disabled={loading || !preview}
          >
            <X size={16} /> Remove
          </button>
        </div>
        {preview && <div className="text-sm text-slate-500">Tip: square images work best.</div>}
      </div>
    </div>
  );
}
