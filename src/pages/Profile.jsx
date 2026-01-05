import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Edit2, Check, X, Calendar, Users } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';
import { InlineLoader } from '../components/LoadingSpinner';
import { hotelAPI } from '../services/api';

const normalizeBooking = (booking, index = 0) => {
  if (!booking) return null;

  const id = booking.id || booking.bookingId || `BK-${index + 1}`;
  const hotelName =
    booking.hotelName ||
    booking.hotel ||
    booking.hotelTitle ||
    booking.hotelId ||
    'Jordan stay';
  const location = booking.location || booking.destination || booking.city || 'Jordan';

  const checkIn =
    booking.checkIn ||
    booking.checkInDate ||
    booking.startDate ||
    booking.dateFrom ||
    null;
  const checkOut =
    booking.checkOut ||
    booking.checkOutDate ||
    booking.endDate ||
    booking.dateTo ||
    null;

  const guests =
    booking.guests ||
    booking.numberOfGuests ||
    booking.guestCount ||
    2;
  const totalPrice =
    booking.totalPrice ||
    booking.total ||
    booking.amount ||
    0;

  let nights = booking.nights;
  if ((!nights || nights <= 0) && checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end - start;
    if (!Number.isNaN(diff) && diff > 0) {
      nights = Math.round(diff / (1000 * 60 * 60 * 24));
    }
  }

  const status = (booking.status || 'confirmed').toLowerCase();

  return {
    ...booking,
    id,
    hotelName,
    location,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    nights: nights || 0,
    status,
  };
};

const Profile = () => {
  const { user, userProfile, updateUserProfileName, logout } = useAuth();
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
      const userEmail = user?.email || user?.attributes?.email || 'User';
      const isUUID = userEmail.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      const apiProfile = await hotelAPI.getUserProfile();

      const fullName = apiProfile?.name || '';
      const [firstFromName, ...restName] = fullName.split(' ');
      const derivedFirstFromEmail = isUUID ? '' : (userEmail.split('@')[0] || '');
      const localFirstName = userProfile?.hasCustomName ? userProfile?.firstName : '';
      const localLastName = userProfile?.hasCustomName ? userProfile?.lastName : '';

      const firstName =
        localFirstName ||
        apiProfile?.firstName ||
        firstFromName ||
        derivedFirstFromEmail;
      const lastName =
        localLastName ||
        apiProfile?.lastName ||
        restName.join(' ');
      const email = apiProfile?.email || userEmail;
      const phone = apiProfile?.phone || '';

      setProfile({
        firstName,
        lastName,
        email,
        phone,
      });

      setFormData({
        firstName,
        lastName,
        email,
        phone,
      });

      // If backend profile provides an explicit name, sync it to the auth profile
      // so the navbar shows "FirstName LastName". If the backend provides no name,
      // keep the email-derived fallback behavior.
      const apiHasName = Boolean(apiProfile?.firstName || apiProfile?.lastName || apiProfile?.name);
      if (apiHasName && !(userProfile?.hasCustomName)) {
        updateUserProfileName?.({ firstName, lastName });
      }

      const userBookings = await hotelAPI.getUserBookings();
      const normalized = Array.isArray(userBookings)
        ? userBookings.map((b, index) => normalizeBooking(b, index)).filter(Boolean)
        : [];
      setBookings(normalized);
    } catch (error) {
      showError('Failed to load profile');
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Persist for navbar/profile display even if API update fails.
      updateUserProfileName?.({ firstName: formData.firstName, lastName: formData.lastName });

      const updated = await hotelAPI.updateUserProfile(formData);
      setProfile({
        firstName: updated.firstName || formData.firstName,
        lastName: updated.lastName || formData.lastName,
        email: updated.email || formData.email,
        phone: updated.phone || formData.phone,
      });
      setFormData({
        firstName: updated.firstName || formData.firstName,
        lastName: updated.lastName || formData.lastName,
        email: updated.email || formData.email,
        phone: updated.phone || formData.phone,
      });
      showSuccess('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      showError('Failed to update profile');
      console.error('Update profile error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await hotelAPI.cancelBooking(bookingId);
      showSuccess('Booking cancelled successfully');
      setBookings((prev) => prev.filter((b) => (b.id || b.bookingId) !== bookingId));
    } catch (error) {
      showError('Failed to cancel booking');
      console.error('Cancel booking error:', error);
    }
  };

  if (loading) return <InlineLoader message="Loading profile..." />;

  const totalNights = bookings.reduce((sum, b) => sum + (b.nights || 0), 0);
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-900 dark:bg-slate-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-1">
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
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Profile Information</h2>
              {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-900 dark:bg-slate-800 text-white rounded-lg hover:bg-black dark:hover:bg-slate-700 transition"
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
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900"
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
                    className="flex items-center gap-2 px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">First Name</p>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{profile?.firstName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Last Name</p>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{profile?.lastName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Email</p>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Phone</p>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{profile?.phone || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">My Bookings</h2>
            <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <p className="font-semibold">Nights</p>
                <p className="text-slate-900 dark:text-slate-100">{totalNights}</p>
              </div>
              <div>
                <p className="font-semibold">Total spend</p>
                <p className="text-slate-900 dark:text-slate-100">JOD {totalSpent}</p>
              </div>
            </div>
          </div>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-300 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-900 dark:bg-slate-800 text-white rounded-lg hover:bg-black dark:hover:bg-slate-700 transition"
              >
                Start Browsing Hotels
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-slate-900">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{booking.hotelName}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">ID: {booking.id}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        (booking.status || '').toLowerCase() === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : (booking.status || '').toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {(booking.status || 'pending').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">CHECK-IN</p>
                        <p className="text-slate-900 dark:text-slate-100">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">CHECK-OUT</p>
                        <p className="text-slate-900 dark:text-slate-100">{new Date(booking.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">GUESTS</p>
                        <p className="text-slate-900 dark:text-slate-100">{booking.guests}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">TOTAL</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-300">JOD {booking.totalPrice}</p>
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
