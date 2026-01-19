import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Edit2, Check, X, Calendar, Users, Heart, ArrowRight } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';
import { InlineLoader } from '../components/LoadingSpinner';
import { hotelAPI } from '../services/api';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload.jsx';
import OptimizedImage from '../components/OptimizedImage';

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
  const { preferences, setPreferences } = usePreferences();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showEnableOptions, setShowEnableOptions] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const loadUserProfile = React.useCallback(async () => {
    console.log('Loading user profile, user:', user);
    try {
      setLoading(true);
      const userEmail = user?.email || user?.attributes?.email || 'User';
      console.log('userEmail:', userEmail);
      const isUUID = userEmail.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      console.log('Fetching API profile');
      const apiProfile = await hotelAPI.getUserProfile();
      console.log('API profile received:', apiProfile);

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

      const avatarUrl = apiProfile?.avatarUrl || apiProfile?.avatar || null;

      setProfile({
        firstName,
        lastName,
        email,
        phone,
        avatarUrl,
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
  }, [user, userProfile?.firstName, userProfile?.hasCustomName, userProfile?.lastName, userProfile?.avatarUrl]);

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

  const handleSavePreferences = async () => {
    try {
      // The context's setPreferences already handles API and localStorage saving
      showSuccess('Preferences saved successfully');
      setEditingPreferences(false);
    } catch (_error) {
      showError('Failed to save preferences');
    }
  };

  const handleCancelBooking = async (_bookingId) => {
    try {
      // TODO: Implement booking cancellation API call
      // await hotelAPI.cancelBooking(bookingId);
      showSuccess('Booking cancellation is not yet implemented. Please contact support.');
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
    <div className="min-h-screen bg-light-premium dark:bg-dark-premium py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Card */}
        <div className="glass-card card-modern p-8 mb-8 animate-fade-in bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-3xl shadow-2xl border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <ProfilePhotoUpload
                      currentAvatarUrl={profile?.avatarUrl || profile?.avatar}
                      onUploaded={(updated) => {
                        // Refresh local profile when avatar changes
                        if (updated) {
                          setProfile((p) => ({ ...p, ...(updated.avatarUrl ? { avatarUrl: updated.avatarUrl } : {}), ...(updated.avatar ? { avatar: updated.avatar } : {}) }));
                        }
                      }}
                    />
                    <div>
                      <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                        {profile?.firstName} {profile?.lastName}
                      </h1>
                      <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-2 text-lg">
                        <Mail size={20} className="text-blue-500" /> {profile?.email}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          Premium Member ✨
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          Jordan Explorer 🏛️
                        </div>
                      </div>
                    </div>
                  </div>
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="btn-secondary flex items-center gap-2 px-6 py-3 hover:scale-105 transition-all duration-300 min-h-[48px] inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg"
            >
              <LogOut size={20} />
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

                {/* Two-Factor Authentication Section */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                  <h3 className="text-lg font-semibold gradient-text mb-4">Two-Factor Authentication</h3>
                  
                  {!mfaEnabled && !showEnableOptions && (
                    <div className="space-y-4">
                      <p className="text-slate-600 dark:text-slate-400">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowEnableOptions(true)}
                        className="btn-primary px-4 py-2 hover:scale-105 transition-all duration-300 min-h-[44px]"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  )}

                  {!mfaEnabled && showEnableOptions && (
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold gradient-text">Choose your 2FA method:</h4>
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
                      <div className="flex justify-end">
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

                  {mfaEnabled && (
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
                  )}
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
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Two-Factor Authentication</p>
                  <div className="flex items-center gap-3 mt-1">
                    {mfaEnabled ? (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-lg text-slate-900 dark:text-slate-100 font-semibold">Enabled</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          ({mfaMethod === 'EMAIL' ? 'Email verification' : mfaMethod === 'TOTP' ? 'Authenticator app' : 'Unknown method'})
                        </span>
                      </>
                    ) : (
                      <span className="text-lg text-slate-900 dark:text-slate-100">Not enabled</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="glass-card card-modern p-8 mb-8 animate-fade-in bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border border-rose-100 dark:border-rose-800/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-rose-500">
                <Heart size={24} className="fill-current" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">My Wishlist</h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/wishlist')}
              className="btn-primary flex items-center gap-2 px-6 py-3 hover:scale-105 transition-all duration-300 min-h-[48px] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/20"
            >
              View Wishlist
              <ArrowRight size={20} />
            </button>
          </div>

          {wishlist.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x">
              {wishlist.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate('/wishlist')}
                  className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700 relative group cursor-pointer hover:scale-105 transition-transform duration-300 snap-start"
                >
                  <OptimizedImage 
                    src={item.image} 
                    alt={item.name || item.hotelName || 'Wishlist item'} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                    <span className="text-white text-xs font-bold truncate w-full">{item.name || item.hotelName}</span>
                  </div>
                </div>
              ))}
              {wishlist.length > 5 && (
                <div 
                  onClick={() => navigate('/wishlist')}
                  className="flex-shrink-0 w-32 h-32 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-rose-300 dark:border-rose-700 flex flex-col items-center justify-center text-rose-500 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors snap-start"
                >
                  <span className="text-2xl font-black">+{wishlist.length - 5}</span>
                  <span className="text-xs font-medium">More</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 mb-3">Your wishlist is empty</p>
              <button 
                onClick={() => navigate('/')}
                className="text-sm font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 underline"
              >
                Start exploring hotels
              </button>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className="glass-card card-modern p-8 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold gradient-text">Preferences</h2>
            <button
              onClick={() => setEditingPreferences(!editingPreferences)}
              aria-label={editingPreferences ? "Cancel editing preferences" : "Edit preferences"}
              className="btn-primary flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all duration-300 min-h-[44px] inline-flex items-center justify-center"
            >
              <Edit2 size={18} />
              {editingPreferences ? 'Cancel' : 'Edit Preferences'}
            </button>
          </div>

          {editingPreferences ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300"
                  >
                    <option value="JOD">Jordanian Dinar (JOD)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Room Preferences</label>
                  <select
                    value={preferences.roomPreference}
                    onChange={(e) => setPreferences({...preferences, roomPreference: e.target.value})}
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300"
                  >
                    <option value="no-preference">No Preference</option>
                    <option value="smoking">Smoking Room</option>
                    <option value="non-smoking">Non-Smoking Room</option>
                    <option value="accessible">Accessible Room</option>
                    <option value="quiet">Quiet Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bed Preference</label>
                  <select
                    value={preferences.bedPreference}
                    onChange={(e) => setPreferences({...preferences, bedPreference: e.target.value})}
                    className="w-full px-4 py-3 glass-card border border-slate-200 dark:border-slate-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-slate-100 dark:bg-slate-900 transition-all duration-300"
                  >
                    <option value="no-preference">No Preference</option>
                    <option value="king">King Bed</option>
                    <option value="queen">Queen Bed</option>
                    <option value="twin">Twin Beds</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold gradient-text">Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.emailBookings}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {...preferences.notifications, emailBookings: e.target.checked}
                      })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Email booking confirmations</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.emailPromotions}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {...preferences.notifications, emailPromotions: e.target.checked}
                      })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Email promotions and deals</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.smsReminders}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {...preferences.notifications, smsReminders: e.target.checked}
                      })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">SMS booking reminders</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.pushNotifications}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: {...preferences.notifications, pushNotifications: e.target.checked}
                      })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Push notifications</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSavePreferences}
                  aria-label="Save preferences"
                  className="btn-primary flex items-center gap-2 px-6 py-2 hover:scale-105 transition-all duration-300 min-h-[44px] inline-flex items-center justify-center"
                >
                  <Check size={18} />
                  Save Preferences
                </button>
                <button
                  onClick={() => {
                    setEditingPreferences(false);
                  }}
                  aria-label="Cancel editing preferences"
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
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Currency</p>
                <p className="text-lg text-slate-900 dark:text-slate-100">{preferences.currency}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Language</p>
                <p className="text-lg text-slate-900 dark:text-slate-100">
                  {preferences.language === 'en' ? 'English' :
                   preferences.language === 'fr' ? 'Français' :
                   preferences.language === 'de' ? 'Deutsch' :
                   preferences.language === 'ar' ? 'العربية' : preferences.language}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Room Preference</p>
                <p className="text-lg text-slate-900 dark:text-slate-100">
                  {preferences.roomPreference === 'no-preference' ? 'No Preference' :
                   preferences.roomPreference === 'smoking' ? 'Smoking Room' :
                   preferences.roomPreference === 'non-smoking' ? 'Non-Smoking Room' :
                   preferences.roomPreference === 'accessible' ? 'Accessible Room' :
                   preferences.roomPreference === 'quiet' ? 'Quiet Room' : preferences.roomPreference}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">Bed Preference</p>
                <p className="text-lg text-slate-900 dark:text-slate-100">
                  {preferences.bedPreference === 'no-preference' ? 'No Preference' :
                   preferences.bedPreference === 'king' ? 'King Bed' :
                   preferences.bedPreference === 'queen' ? 'Queen Bed' :
                   preferences.bedPreference === 'twin' ? 'Twin Beds' : preferences.bedPreference}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold mb-2">Notification Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.notifications.emailBookings && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Email Bookings</span>
                  )}
                  {preferences.notifications.emailPromotions && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Email Promotions</span>
                  )}
                  {preferences.notifications.smsReminders && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">SMS Reminders</span>
                  )}
                  {preferences.notifications.pushNotifications && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Push Notifications</span>
                  )}
                </div>
              </div>
            </div>
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
