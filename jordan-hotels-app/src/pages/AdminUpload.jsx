import React, { useState } from 'react';
import { hotelAPI } from '../services/api';

const AdminUpload = () => {
  const [hotelId, setHotelId] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!hotelId || !file) return setStatus('Please provide a hotel ID and image file.');

    try {
      setBusy(true);
      setStatus('Requesting upload URL...');
      const { url, key } = await hotelAPI.getS3UploadUrl(file.name, file.type);

      setStatus('Uploading to S3...');
      await hotelAPI.uploadFileToSignedUrl(url, file);

      setStatus('Registering image with backend...');
      await hotelAPI.registerHotelImage(hotelId, key);

      setStatus('Upload complete.');
    } catch (err) {
      setStatus(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleUpload} className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow w-full max-w-md border border-slate-100">
        <h2 className="text-xl font-bold mb-4">Admin: Upload Hotel Image</h2>
        <input
          placeholder="Hotel ID"
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
        <button disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold disabled:opacity-60">
          {busy ? 'Working...' : 'Upload'}
        </button>
        {status && <p className="mt-4 text-sm">{status}</p>}
      </form>
    </div>
  );
};

export default AdminUpload;
