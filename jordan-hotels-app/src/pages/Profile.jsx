import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Edit2, Check, X, Calendar, Users, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';
import { InlineLoader } from '../components/LoadingSpinner';
import { hotelAPI } from '../services/api';

// Email MFA UI is handled in the MFA modal now; inline manager removed.

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
    const diff = end.getTime() - start.getTime();
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
  const { user, userProfile, updateUserProfileName, logout, mfaEnabled, openEmailSetup, disableMfa, mfaMethod, setupTotp } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showEnableOptions, setShowEnableOptions] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const loadUserProfile = React.useCallback(async () => {
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
  }, [user, userProfile?.firstName, userProfile?.hasCustomName, userProfile?.lastName]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [user, navigate, loadUserProfile]);

  // Reload profile when MFA status changes
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [mfaEnabled, user, loadUserProfile]);

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

  const handleLogout = async () => {
    try {
      const res = await logout();
      // If MFA was required, the MFA modal will be shown by global state.
      if (!res?.mfaRequired) {
        navigate('/');
      }
    } catch (e) {
      console.error('Logout error:', e);
      // Fallback to immediate navigation after attempt
      navigate('/');
    }
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

  // Inline component to choose enable method
  function Enable2FaChooser({ setupTotp }) {
    const [loading, setLoading] = React.useState(false);
    const startTotp = async () => {
      console.log('Starting TOTP setup from Profile...');
      try {
        setLoading(true);
        await setupTotp();
        console.log('TOTP setup completed successfully');
        // Reload profile to get updated MFA status
        await loadUserProfile();
        showSuccess('Follow the modal instructions to finish setting up your authenticator app.');
      } catch (err) {
        console.error('TOTP setup error', err);
        showError(err?.message || 'Failed to start 2FA setup');
      } finally {
        setLoading(false);
        setShowEnableOptions(false);
      }
    };

    const chooseEmail = () => {
      setShowEnableOptions(false);
      // open Email MFA setup inside the centralized MFA modal
      openEmailSetup?.();
    };

    return (
      <div className="relative">
        <button onClick={() => setShowEnableOptions((s) => !s)} aria-label="Enable two factor authentication options" className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[44px] inline-flex items-center justify-center">
          <Check size={16} />
          Enable 2FA
        </button>
        {showEnableOptions && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 z-50">
            <p className="text-sm font-semibold mb-2">Choose 2FA method</p>
              <div className="flex flex-col gap-2">
                <button onClick={startTotp} disabled={loading} aria-label="Set up authenticator app (TOTP)" className="px-3 py-2 text-left rounded-lg hover:bg-slate-50 min-h-[44px]">Authenticator app (TOTP)</button>
                <button onClick={chooseEmail} aria-label="Set up email two factor authentication" className="px-3 py-2 text-left rounded-lg hover:bg-slate-50 min-h-[44px]">Email (alternate address)</button>
              </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) return <InlineLoader message="Loading profile..." />;

  const totalNights = bookings.reduce((sum, b) => sum + (b.nights || 0), 0);
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="min-h-screen gradient-hero py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Email Verification Alert */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-yellow-900 font-bold text-sm">Email Verification Temporarily Unavailable</p>
            <p className="text-yellow-800 text-sm">We're working to restore email verification. Please contact support if you need assistance with account verification.</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card card-modern p-8 mb-8 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-glow-purple animate-pulse-glow">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black gradient-text animate-gradient">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-1">
                  <Mail size={18} /> {profile?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="btn-secondary flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 min-h-[44px] inline-flex items-center justify-center"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Profile Form */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold gradient-text">Profile Information</h2>
              {!editing && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    aria-label="Edit profile"
                    className="btn-primary flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 min-h-[44px] inline-flex items-center justify-center"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>

                  {/* Small MFA badge only — main enable/disable actions live in the MFA section below */}
                  {mfaEnabled && (
                    <div className="flex items-center gap-2 px-3 py-2 glass-card border border-green-200 bg-green-50 text-green-800 rounded-lg shadow-glow">
                      <Check size={16} />
                      <span>2FA Enabled{mfaMethod && ` (${mfaMethod === 'EMAIL' ? 'Email' : mfaMethod === 'TOTP' ? 'App' : mfaMethod})`}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email-based 2FA is configured via the MFA modal when choosing Email from Enable 2FA */}

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300 hover:shadow-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300 hover:shadow-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300 hover:shadow-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300 hover:shadow-glow"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    aria-label="Save profile changes"
                    className="btn-primary flex items-center gap-2 px-6 py-2 hover:scale-105 transition-all duration-300 min-h-[44px] inline-flex items-center justify-center"
                  >
                    <Check size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    aria-label="Cancel profile edit"
                    className="btn-secondary flex items-center gap-2 px-6 py-2 hover:scale-105 transition-all duration-300 min-h-[44px] inline-flex items-center justify-center"
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

        {/* MFA Section */}
        <div className="glass-card card-modern p-8 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold gradient-text">Two-Factor Authentication</h2>
            {!mfaEnabled && !showEnableOptions && (
              <button
                type="button"
                onClick={() => setShowEnableOptions(true)}
                className="btn-primary px-4 py-2 hover:scale-105 transition-all duration-300 min-h-[44px]"
              >
                Enable 2FA
              </button>
            )}
          </div>

          {!mfaEnabled && showEnableOptions && (
            <div className="mb-6 p-4 glass-card rounded-lg border border-purple-200/50">
              <h3 className="text-lg font-semibold gradient-text mb-4">Choose your 2FA method:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={openEmailSetup}
                  className="p-4 glass-card border border-slate-300 dark:border-slate-600 rounded-lg hover:shadow-glow hover:scale-105 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-blue-600 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Email Verification</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive verification codes via email. No additional app required.
                  </p>
                </button>

                <button
                  onClick={async () => {
                    try {
                      setShowEnableOptions(false);
                      await setupTotp();
                    } catch (err) {
                      showError(err?.message || 'Failed to start TOTP setup');
                    }
                  }}
                  className="p-4 glass-card border border-slate-300 dark:border-slate-600 rounded-lg hover:shadow-glow hover:scale-105 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-green-600 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Authenticator App</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use Google Authenticator, Authy, or similar apps for secure 2FA.
                  </p>
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEnableOptions(false)}
                  className="btn-secondary px-3 py-1 text-sm hover:scale-105 transition-all duration-300 min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {mfaEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">2FA is enabled</span>
                <span className="text-slate-600 dark:text-slate-400">
                  ({mfaMethod === 'EMAIL' ? 'Email verification' : mfaMethod === 'TOTP' ? 'Authenticator app' : 'Unknown method'})
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
                    try {
                      await disableMfa();
                      showSuccess('2FA disabled');
                    } catch (_error) {
                      showError('Failed to disable 2FA');
                    }
                  }
                }}
                className="btn-secondary px-4 py-2 hover:scale-105 transition-all duration-300 min-h-[44px]"
              >
                Disable 2FA
              </button>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
          )}
        </div>

        {/* Bookings Section */}
        <div className="glass-card card-modern p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black gradient-text">My Bookings</h2>
            <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="glass-card px-3 py-2 rounded-lg">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Nights</p>
                <p className="text-lg font-bold gradient-text">{totalNights}</p>
              </div>
              <div className="glass-card px-3 py-2 rounded-lg">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Total spend</p>
                <p className="text-lg font-bold gradient-text">JOD {totalSpent}</p>
              </div>
            </div>
          </div>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-300 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary px-6 py-2 hover:scale-105 transition-all duration-300"
              >
                Start Browsing Hotels
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="glass-card border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-glow hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-900">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold gradient-text">{booking.hotelName}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">ID: {booking.id}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold shadow-glow ${
                        (booking.status || '').toLowerCase() === 'confirmed'
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : (booking.status || '').toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}
                    >
                      {(booking.status || 'pending').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">CHECK-IN</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">CHECK-OUT</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users size={16} className="text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">GUESTS</p>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{booking.guests}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">TOTAL</p>
                      <p className="text-lg font-bold gradient-text">JOD {booking.totalPrice}</p>
                    </div>
                  </div>

                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm hover:scale-105 transition-all duration-300"
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
