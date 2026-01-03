import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Edit2, Check, X, Calendar, Users } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';
import { InlineLoader } from '../components/LoadingSpinner';

// Mock bookings data
const MOCK_BOOKINGS = [
  {
    id: 'BK-001',
    hotelName: 'Dead Sea Marriott Resort & Spa',
    location: 'Dead Sea',
    checkIn: '2026-02-15',
    checkOut: '2026-02-18',
    nights: 3,
    guests: 2,
    totalPrice: 339,
    status: 'Confirmed',
    image: 'https://cache.marriott.com/content/dam/marriott-digital/mc/emea/hws/q/qmdjv/en_us/photo/unlimited/assets/qmdjv-pool-0212.jpg',
  },
  {
    id: 'BK-002',
    hotelName: 'Mövenpick Resort Petra',
    location: 'Petra',
    checkIn: '2026-03-10',
    checkOut: '2026-03-13',
    nights: 3,
    guests: 4,
    totalPrice: 294,
    status: 'Pending',
    image: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/11384965.jpg',
  },
];

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [user, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Extract proper email/username from user object
      const userEmail = user?.email || 'User';
      const isUUID = userEmail.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      const displayName = isUUID ? 'Jordan Hotel User' : userEmail.split('@')[0];
      
      // Use mock data for profile
      setProfile({
        firstName: displayName,
        lastName: '',
        email: isUUID ? 'user@visitjo.com' : userEmail,
        phone: '+962...',
      });
      
      // Use mock bookings
      setBookings(MOCK_BOOKINGS);
      
      setFormData({
        firstName: displayName,
        lastName: '',
        email: isUUID ? 'user@visitjo.com' : userEmail,
        phone: '',
      });
    } catch (error) {
      showError('Failed to load profile');
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Update local state only (backend integration when ready)
      showSuccess('Profile updated successfully');
      setProfile(formData);
      setEditing(false);
    } catch (error) {
      showError('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      showSuccess('Booking cancelled successfully');
      loadUserProfile();
    } catch (error) {
      showError('Failed to cancel booking');
    }
  };

  if (loading) return <InlineLoader message="Loading profile..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-slate-600 flex items-center gap-2 mt-1">
                  <Mail size={18} /> {profile?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Profile Form */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-black transition"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Check size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 font-semibold">First Name</p>
                  <p className="text-lg text-slate-900">{profile?.firstName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Last Name</p>
                  <p className="text-lg text-slate-900">{profile?.lastName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Email</p>
                  <p className="text-lg text-slate-900">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Phone</p>
                  <p className="text-lg text-slate-900">{profile?.phone || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-black mb-6 text-slate-900">My Bookings</h2>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-black transition"
              >
                Start Browsing Hotels
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{booking.hotelName}</h3>
                      <p className="text-sm text-slate-600">ID: {booking.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">CHECK-IN</p>
                        <p className="text-slate-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">CHECK-OUT</p>
                        <p className="text-slate-900">{new Date(booking.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 font-semibold">GUESTS</p>
                        <p className="text-slate-900">{booking.guests}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-semibold">TOTAL</p>
                      <p className="text-lg font-bold text-blue-900">JOD {booking.totalPrice}</p>
                    </div>
                  </div>

                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
