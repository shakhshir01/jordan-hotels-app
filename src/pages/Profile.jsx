import React, { useEffect, useState } from 'react';
import { hotelAPI } from '../services/api';
import { Loader2, MapPin } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await hotelAPI.getUserProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="font-bold text-lg">{profile?.name || profile?.email}</p>
        <p className="text-sm text-slate-600">{profile?.email}</p>
        <div className="mt-4">
          <h3 className="font-semibold">Location</h3>
          <p className="flex items-center gap-2 text-slate-600"><MapPin /> {profile?.location || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
