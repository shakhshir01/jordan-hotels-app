import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Wifi, Coffee, Car, Loader2, AlertCircle, X, ArrowRight } from 'lucide-react';
import hotelsService from '../services/hotelsService';
import WishlistButton from '../components/WishlistButton';
import HotelGallery from '../components/HotelGallery';
import Seo from '../components/Seo.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import {
} from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';
import { showError } from '../services/toastService';
import { usePreferences } from '../context/PreferencesContext';
import { formatPrice } from '../utils/hotelPricing';

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#d67d61"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,.92)" font-family="Arial" font-size="56" text-anchor="middle" dominant-baseline="middle">VisitJo Hotel</text>
  </svg>`);

const normalizeHotel = (raw) => {
  if (!raw) return null;
  const location = raw.location || raw.destination || raw.city || 'Jordan';
  const price = raw.price || raw.pricePerNight || raw.nightlyRate || raw.basePrice || 0;
  const rating = raw.rating || raw.score || raw.stars || 0;
  const images = Array.isArray(raw.images)
    ? raw.images
    : raw.image
    ? [raw.image]
    : [];

  return {
    ...raw,
    location,
    price,
    rating,
    images,
  };
};

const HotelDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = usePreferences();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('1');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [reviews, setReviews] = useState([]);
  // Booking fees and policies
  const bookingFees = {
    serviceFee: 15, // JOD
    taxRate: 0.16, // 16% VAT
    cleaningFee: 25, // JOD
  };

  const cancellationPolicy = {
    free: 'Cancel up to 24 hours before check-in for full refund',
    partial: 'Cancel within 24 hours: 50% refund',
    noRefund: 'No refund for cancellations within 6 hours of check-in',
  };

  // Keyboard support for mobile booking modal
  useEffect(() => {
    if (!showMobileBooking) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMobileBooking(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMobileBooking]);

  // Calculate detailed price breakdown
  const calculatePriceBreakdown = () => {
    const selectedRoom = hotel.roomTypes?.find(rt => rt.name === selectedRoomType);
    const basePrice = selectedRoom ? selectedRoom.price : hotel.price;
    const nights = Math.max(
      1,
      Math.ceil((new Date(checkOutDate || Date.now()).getTime() - new Date(checkInDate || Date.now()).getTime()) / (24 * 60 * 60 * 1000))
    );
    
    const subtotal = basePrice * nights;
    const serviceFee = bookingFees.serviceFee;
    const cleaningFee = bookingFees.cleaningFee;
    const subtotalWithFees = subtotal + serviceFee + cleaningFee;
    const tax = Math.round(subtotalWithFees * bookingFees.taxRate);
    const total = subtotalWithFees + tax;

    return {
      basePrice,
      nights,
      subtotal,
      serviceFee,
      cleaningFee,
      tax,
      total,
    };
  };
  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await hotelsService.getHotelById(id);

        if (!data) {
          setHotel(null);
          setError('Hotel not found.');
        } else {
          setHotel(normalizeHotel(data));
        }
      } catch (err) {
        setError(err.message || 'Failed to load hotel details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  // Handle booking intent from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('book') === 'true' && hotel) {
      // Scroll to booking form after hotel loads
      setTimeout(() => {
        const bookingForm = document.querySelector('form');
        if (bookingForm) {
          bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Set default check-in date to tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setCheckInDate(tomorrow.toISOString().split('T')[0]);
          // Set default check-out date to day after tomorrow
          const dayAfterTomorrow = new Date();
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
          setCheckOutDate(dayAfterTomorrow.toISOString().split('T')[0]);
        }
      }, 500);
    }
  }, [hotel, location.search]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!checkInDate) {
      showError(t('hotelDetails.errors.selectCheckIn'));
      return;
    }
    if (!checkOutDate) {
      showError(t('hotelDetails.errors.selectCheckOut') || 'Please select a check-out date');
      return;
    }

    // ensure check-out is after check-in
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      showError(t('hotelDetails.errors.invalidCheckOut') || 'Check-out must be after check-in');
      return;
    }

    setBookingLoading(true);
    try {
      const nights = Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (24 * 60 * 60 * 1000)));
      const selectedRoom = hotel.roomTypes?.find(rt => rt.name === selectedRoomType);
      const roomPrice = selectedRoom ? selectedRoom.price : hotel.price;
      
      const breakdown = calculatePriceBreakdown();
      
      const bookingData = {
        checkInDate,
        checkOutDate,
        nights,
        guests: parseInt(guests, 10),
        roomType: selectedRoomType || 'Standard Room',
        roomPrice,
        breakdown,
        cancellationPolicy,
        totalPrice: breakdown.total,
        userPreferences: preferences, // Include user preferences for checkout
      };
      // Navigate to checkout with hotel and booking data
      navigate('/checkout', { state: { hotelId: id, bookingData, hotel } });

      // Track booking start event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'booking_start', {
          event_category: 'ecommerce',
        });
      }
    } catch (err) {
      showError(err.message || t('hotelDetails.errors.bookingFailed'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 max-w-md w-full">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-red-900 mb-2">{t('hotelDetails.errors.title')}</h3>
              <p className="text-red-700">{error || t('hotelDetails.errors.notFound')}</p>
              <Link to="/" className="text-red-900 font-bold hover:underline mt-4 inline-block">
                ← {t('hotelDetails.errors.backToHotels')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hotelName = getHotelDisplayName(hotel, i18n.language);

  const canonicalUrl = `${window.location.origin}${location.pathname}`;
  const descriptionText = (() => {
    const raw = String(hotel?.description || hotel?.summary || '').trim();
    if (raw) return raw.length > 160 ? `${raw.slice(0, 157)}...` : raw;
    const price = hotel?.price ? formatPrice(hotel.price, preferences.currency) : 'great rates';
    return `Book ${hotelName} in ${hotel.location}. Starting from ${price} per night.`;
  })();

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${window.location.origin}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: hotelName,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'Hotel',
        name: hotelName,
        url: canonicalUrl,
        image: Array.isArray(hotel?.images) ? hotel.images.slice(0, 8) : undefined,
        description: descriptionText,
        address: {
          '@type': 'PostalAddress',
          addressLocality: hotel.location,
          addressCountry: 'JO',
        },
        priceRange: hotel?.price ? formatPrice(hotel.price, preferences.currency) : undefined,
        aggregateRating:
          typeof hotel?.rating === 'number' && hotel.rating > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: hotel.rating,
                bestRating: 5,
              }
            : undefined,
      },
    ],
  };

  return (
    <div className="space-section pb-24 lg:pb-8">
      <Seo
        title={`${hotelName} | VisitJo`}
        description={descriptionText}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLdGraph}
        breadcrumbs={[
          { name: 'Home', url: 'https://visitjo.com' },
          { name: 'Hotels', url: 'https://visitjo.com/hotels' },
          { name: hotelName, url: canonicalUrl }
        ]}
      />

      {/* Mobile Booking Bar - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-700/50 p-4 safe-area-inset-bottom">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-black gradient-text">{hotel.price}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">JOD</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
              {checkInDate && checkOutDate ? `${calculatePriceBreakdown().nights} nights` : 'Select dates'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileBooking(true)}
            aria-label="Open booking panel"
            className="btn-primary px-6 py-3 text-sm font-bold rounded-xl hover-lift touch-manipulation flex-shrink-0 min-h-[44px]"
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Mobile Booking Modal */}
      {showMobileBooking && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileBooking(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[90vh] overflow-y-auto safe-area-inset-bottom" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50 p-4 rounded-t-3xl">
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4"></div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Book Your Stay</h3>
                <button
                  type="button"
                  onClick={() => setShowMobileBooking(false)}
                  aria-label="Close booking"
                  className="p-3 min-h-[44px] min-w-[44px] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Mobile booking form content */}
              <div className="space-y-6">
                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {t('hotelDetails.booking.checkIn')}
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-base touch-manipulation"
                    required
                  />
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {t('hotelDetails.booking.checkOut')}
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-base touch-manipulation"
                    required
                  />
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {t('hotelDetails.booking.guests')}
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-base touch-manipulation"
                  >
                    <option value="1">{t('hotelDetails.booking.guestCount', { count: 1 })}</option>
                    <option value="2">{t('hotelDetails.booking.guestCount', { count: 2 })}</option>
                    <option value="3">{t('hotelDetails.booking.guestCount', { count: 3 })}</option>
                    <option value="4">{t('hotelDetails.booking.guestCount', { count: 4 })}</option>
                    <option value="5">{t('hotelDetails.booking.guestCountPlus')}</option>
                  </select>
                </div>

                {/* Room Type Selection */}
                {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                      {t('hotelDetails.booking.roomType')}
                    </label>
                    <select
                      value={selectedRoomType}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-base touch-manipulation"
                    >
                      <option value="">{t('hotelDetails.booking.selectRoomType')}</option>
                      {hotel.roomTypes.map((roomType, index) => (
                        <option key={index} value={roomType.name}>
                          {roomType.name} - {formatPrice(roomType.price, preferences.currency)} ({t('hotelDetails.booking.capacity')}: {roomType.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="glass-card rounded-2xl p-6 border border-white/20">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 text-lg">💰 Price Breakdown</h3>
                  {(() => {
                    const breakdown = calculatePriceBreakdown();
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-slate-700 dark:text-slate-300">{formatPrice(breakdown.basePrice, preferences.currency)} × {breakdown.nights} nights</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(breakdown.subtotal, preferences.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-slate-600 dark:text-slate-400">
                          <span>Service fee</span>
                          <span>{formatPrice(breakdown.serviceFee, preferences.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-slate-600 dark:text-slate-400">
                          <span>Cleaning fee</span>
                          <span>{formatPrice(breakdown.cleaningFee, preferences.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-slate-600 dark:text-slate-400">
                          <span>Taxes (16% VAT)</span>
                          <span>{formatPrice(breakdown.tax, preferences.currency)}</span>
                        </div>
                        <div className="border-t border-slate-200/70 dark:border-slate-700/60 pt-4 mt-4 flex justify-between items-center">
                          <span className="font-black text-slate-900 dark:text-slate-100 text-xl">Total</span>
                          <span className="font-black gradient-text text-2xl">{formatPrice(breakdown.total, preferences.currency)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Cancellation Policy */}
                <div className="glass-card rounded-2xl p-6 border border-white/20">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                    <AlertCircle size={20} className="text-amber-500" />
                    Cancellation Policy
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{cancellationPolicy.free}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                      <AlertCircle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{cancellationPolicy.partial}</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{cancellationPolicy.noRefund}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || !checkInDate}
                  className="btn-primary w-full py-5 text-lg font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover-lift touch-manipulation"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 size={20} className="animate-spin" />
                      {t('hotelDetails.booking.bookingLoading')}
                    </div>
                  ) : (
                    <span>{t('hotelDetails.booking.reserveNow')}</span>
                  )}
                </button>

                <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                  🔒 {t('hotelDetails.booking.noChargeYet')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Breadcrumbs */}
      <nav className="glass-card rounded-2xl p-4 mb-8 shadow-glow">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium">
            {t('nav.home')}
          </Link>
          <span className="text-slate-400">/</span>
          <Link
            to={`/destinations/${encodeURIComponent(hotel.location)}`}
            className="text-slate-600 dark:text-slate-300 hover:text-jordan-blue transition-colors"
          >
            {hotel.location}
          </Link>
          <span className="text-slate-400">/</span>
          <span className="gradient-text font-semibold">{hotelName}</span>
        </div>
      </nav>

      {/* Gallery with modern design */}
      <section className="card-modern mb-6 overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-8 gradient-text">{t('hotelDetails.gallery.title')}</h2>
          <HotelGallery images={hotel.images} hotelName={hotelName} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 gradient-text leading-tight">{hotelName}</h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <Link
                  to={`/destinations/${encodeURIComponent(hotel.location)}`}
                  className="font-medium hover:text-jordan-blue transition-colors"
                >
                  {hotel.location}, {t('hotelDetails.location.country')}
                </Link>
              </p>
            </div>
            <div className="flex-shrink-0">
              <WishlistButton item={hotel} />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-glow animate-pulse-glow">
              <Star size={20} fill="currentColor" />
              <span className="text-lg">{hotel.rating}</span>
            </div>
            <span className="text-base text-slate-500 dark:text-slate-400 font-medium">({reviews.length} {t('hotels.reviews')})</span>
          </div>

          <section className="card-modern">
            <div className="p-6 sm:p-8 lg:p-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-8 gradient-text">{t('hotelDetails.offers.title')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-glow transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4 rounded-2xl shadow-lg group-hover:shadow-glow transition-all duration-300 flex-shrink-0">
                    <Wifi className="text-white" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg truncate">{t('hotelDetails.offers.wifi.title')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t('hotelDetails.offers.wifi.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-glow transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 sm:p-4 rounded-2xl shadow-lg group-hover:shadow-glow transition-all duration-300 flex-shrink-0">
                    <Coffee className="text-white" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg truncate">{t('hotelDetails.offers.breakfast.title')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t('hotelDetails.offers.breakfast.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:shadow-glow transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-3 sm:p-4 rounded-2xl shadow-lg group-hover:shadow-glow transition-all duration-300 flex-shrink-0">
                    <Car className="text-white" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg truncate">{t('hotelDetails.offers.parking.title')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t('hotelDetails.offers.parking.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 hover:shadow-glow transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-3 sm:p-4 rounded-2xl shadow-lg group-hover:shadow-glow transition-all duration-300 flex-shrink-0">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg truncate">{t('hotelDetails.offers.frontDesk.title')}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t('hotelDetails.offers.frontDesk.subtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="card-modern">
            <div className="p-6 sm:p-8 lg:p-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 gradient-text">{t('hotelDetails.about.title')}</h3>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base sm:text-lg mb-6">
                  {hotel.description || t('hotelDetails.about.fallbackDescription')}
                </p>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base sm:text-lg">
                  {t('hotelDetails.about.extra')}
                </p>
              </div>
            </div>
          </section>

          <section className="card-modern">
            <div className="p-6 sm:p-8 lg:p-10">
              <ReviewsSection
                hotelId={id}
                reviews={reviews}
                onAddReview={handleAddReview}
              />
            </div>
          </section>
        </div>

        {/* Right Column: Booking Sidebar - Desktop Only */}
        <aside className="hidden lg:block card-modern lg:sticky lg:top-24 h-fit">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3 gap-3">
                <span className="text-5xl lg:text-6xl font-black gradient-text">{hotel.price}</span>
                <span className="text-base font-semibold text-slate-500 dark:text-slate-400">JOD</span>
              </div>
              <p className="text-base text-slate-600 dark:text-slate-300 font-medium">/{t('hotels.perNight')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t('hotelDetails.booking.averagePrice')}</p>
            </div>

            <form onSubmit={handleBooking} className="space-y-8">
              {/* Check-in Date */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {t('hotelDetails.booking.checkIn')}
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {t('hotelDetails.booking.checkOut')}
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              {/* Number of Guests */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {t('hotelDetails.booking.guests')}
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="1">{t('hotelDetails.booking.guestCount', { count: 1 })}</option>
                  <option value="2">{t('hotelDetails.booking.guestCount', { count: 2 })}</option>
                  <option value="3">{t('hotelDetails.booking.guestCount', { count: 3 })}</option>
                  <option value="4">{t('hotelDetails.booking.guestCount', { count: 4 })}</option>
                  <option value="5">{t('hotelDetails.booking.guestCountPlus')}</option>
                </select>
              </div>

              {/* Room Type Selection */}
              {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {t('hotelDetails.booking.roomType')}
                  </label>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full px-4 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">{t('hotelDetails.booking.selectRoomType')}</option>
                    {hotel.roomTypes.map((roomType, index) => (
                      <option key={index} value={roomType.name}>
                        {roomType.name} - {formatPrice(roomType.price, preferences.currency)} ({t('hotelDetails.booking.capacity')}: {roomType.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="glass-card rounded-2xl p-6 border border-white/20">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 text-lg">💰 Price Breakdown</h3>

                {(() => {
                  const breakdown = calculatePriceBreakdown();
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-700 dark:text-slate-300">{formatPrice(breakdown.basePrice, preferences.currency)} × {breakdown.nights} nights</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{formatPrice(breakdown.subtotal, preferences.currency)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-slate-600 dark:text-slate-400">
                        <span>Service fee</span>
                        <span>{formatPrice(breakdown.serviceFee, preferences.currency)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-slate-600 dark:text-slate-400">
                        <span>Cleaning fee</span>
                        <span>{formatPrice(breakdown.cleaningFee, preferences.currency)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-slate-600 dark:text-slate-400">
                        <span>Taxes (16% VAT)</span>
                        <span>{formatPrice(breakdown.tax, preferences.currency)}</span>
                      </div>
                      <div className="border-t border-slate-200/70 dark:border-slate-700/60 pt-4 mt-4 flex justify-between items-center">
                        <span className="font-black text-slate-900 dark:text-slate-100 text-xl">Total</span>
                        <span className="font-black gradient-text text-2xl">{formatPrice(breakdown.total, preferences.currency)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Cancellation Policy */}
              <div className="glass-card rounded-2xl p-6 border border-white/20">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-amber-500" />
                  Cancellation Policy
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{cancellationPolicy.free}</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                    <AlertCircle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{cancellationPolicy.partial}</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{cancellationPolicy.noRefund}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading || !checkInDate}
                className="btn-primary w-full py-5 text-lg font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover-lift touch-manipulation"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 size={20} className="animate-spin" />
                    {t('hotelDetails.booking.bookingLoading')}
                  </div>
                ) : (
                  <span>{t('hotelDetails.booking.reserveNow')}</span>
                )}
              </button>

              <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                🔒 {t('hotelDetails.booking.noChargeYet')}
              </p>
            </form>
          </div>
        </aside>
      </div>

      {/* Related Destinations */}
      <section className="mt-16 mb-8">
        <div className="card-modern p-8">
          <h2 className="text-3xl font-black mb-8 gradient-text text-center">
            {t('hotelDetails.relatedDestinations.title', 'Explore More Jordan Destinations')}
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            {t('hotelDetails.relatedDestinations.subtitle', 'Discover other incredible places in Jordan for your next adventure')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Petra', 'Amman', 'Dead Sea', 'Wadi Rum', 'Aqaba'].filter(dest => dest !== hotel.location).slice(0, 3).map((destination) => {
              // Map destination names to their proper IDs
              const destinationIdMap = {
                'Petra': 'd-petra',
                'Amman': 'd-amman',
                'Dead Sea': 'd-dead-sea',
                'Wadi Rum': 'd-wadi-rum',
                'Aqaba': 'd-aqaba'
              };
              const destinationId = destinationIdMap[destination] || destination.toLowerCase().replace(' ', '-');

              return (
                <Link
                  key={destination}
                  to={`/destinations/${destinationId}`}
                  className="group card-modern p-6 hover:shadow-premium transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-jordan-blue to-jordan-teal flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-jordan-blue transition-colors">
                        {destination}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {t(`destinations.${destination.toLowerCase().replace(' ', '')}.desc`, 'Explore this amazing destination')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/destinations"
              className="btn-secondary inline-flex items-center gap-2"
            >
              {t('hotelDetails.relatedDestinations.viewAll', 'View All Destinations')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HotelDetails;