/// <reference path="../types/globals.d.ts" />

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
    <text x="50%" y="50%" fill="rgba(255,255,255,.92)" font-family="Arial" font-size="56" text-anchor="middle" dominant-baseline="middle">Visit-Jo Hotel</text>
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

function HotelDetails() {
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
    serviceFee: 10, // JOD
    taxRate: 0.16, // 16% VAT
    cleaningFee: 15, // JOD
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
      // Set default check-in date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCheckInDate(tomorrow.toISOString().split('T')[0]);
      // Set default check-out date to day after tomorrow
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      setCheckOutDate(dayAfterTomorrow.toISOString().split('T')[0]);
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
        title={`${hotelName} | Visit-Jo`}
        description={descriptionText}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLdGraph}
        breadcrumbs={[
          { name: 'Home', url: 'https://vist-jo.com' },
          { name: 'Hotels', url: 'https://vist-jo.com/hotels' },
          { name: hotelName, url: canonicalUrl }
        ]}
      />

      {/* Mobile Booking Bar - Fixed at bottom - Enhanced for mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-700/50 p-3 sm:p-4 safe-area-inset-bottom">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-1.5 sm:gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black gradient-text">{hotel.price}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">JOD</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
              {checkInDate && checkOutDate ? `${calculatePriceBreakdown().nights} nights` : 'Select dates'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileBooking(true)}
            aria-label="Open booking panel"
            className="btn-primary px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-bold rounded-xl hover-lift touch-manipulation flex-shrink-0 min-h-[44px] text-sm sm:text-base"
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Mobile Booking Modal - Enhanced for mobile */}
      {showMobileBooking && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileBooking(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[90vh] overflow-y-auto safe-area-inset-bottom" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50 p-3 sm:p-4 rounded-t-3xl">
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Book Your Stay</h3>
                <button
                  type="button"
                  onClick={() => setShowMobileBooking(false)}
                  aria-label="Close booking"
                  className="p-2.5 sm:p-3 min-h-[44px] min-w-[44px] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors touch-manipulation"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
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
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
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
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
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
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
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
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
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
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">💰 Price Breakdown</h3>
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
                          <span className="font-bold text-blue-600 text-2xl">{formatPrice(breakdown.total, preferences.currency)}</span>
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
                  className="btn-primary w-full py-4 sm:py-5 text-base sm:text-lg font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover-lift touch-manipulation min-h-[48px] sm:min-h-[56px]"
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

      {/* Simple Breadcrumbs */}
      <nav className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-blue-600 hover:text-blue-700 transition-colors duration-300 font-medium">
            {t('nav.home')}
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            to={`/destinations/${encodeURIComponent(hotel.location)}`}
            className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium"
          >
            {hotel.location}
          </Link>
          <span className="text-gray-400">•</span>
          <span className="text-gray-900 dark:text-white font-bold">{hotelName}</span>
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="text-gray-900 dark:text-white">{hotelName}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 flex items-center gap-3 sm:gap-4 mb-8">
                <MapPin className="w-6 h-6 text-gray-500 flex-shrink-0" />
                <Link
                  to={`/destinations/${encodeURIComponent(hotel.location)}`}
                  className="font-semibold hover:text-blue-600 transition-colors duration-300"
                >
                  {hotel.location}, {t('hotelDetails.location.country')}
                </Link>
              </p>
            </div>
            <div className="flex-shrink-0">
              <WishlistButton item={hotel} />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-400 text-black font-bold shadow-md min-h-[48px]">
              <Star size={20} className="sm:w-6 sm:h-6" fill="currentColor" />
              <span className="text-lg sm:text-xl font-extrabold">{hotel.rating}</span>
            </div>
            <span className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-semibold">({reviews.length} {t('hotels.reviews')})</span>
            <div className="w-2 h-2 bg-gradient-to-r from-jordan-gold to-jordan-rose rounded-full animate-pulse"></div>
            <span className="text-base sm:text-lg text-jordan-emerald font-bold">Award-Winning Property</span>
          </div>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="p-8 sm:p-10 lg:p-12">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-10 leading-tight">
                <span className="text-gray-900 dark:text-white">Premium Amenities</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="flex items-center gap-4 sm:gap-5 lg:gap-6 p-6 sm:p-7 lg:p-8 rounded-3xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 min-h-[100px] sm:min-h-[120px] border border-blue-200 dark:border-blue-700 hover:border-blue-300">
                  <div className="bg-blue-500 p-3 sm:p-4 rounded-lg shadow-md flex-shrink-0">
                    <Wifi className="text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-base sm:text-lg lg:text-xl truncate group-hover:text-jordan-blue dark:group-hover:text-jordan-teal transition-colors duration-300">{t('hotelDetails.offers.wifi.title')}</p>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">{t('hotelDetails.offers.wifi.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-5 lg:gap-6 p-6 sm:p-7 lg:p-8 rounded-3xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 min-h-[100px] sm:min-h-[120px] border border-green-200 dark:border-green-700 hover:border-green-300">
                  <div className="bg-green-500 p-3 sm:p-4 rounded-lg shadow-md flex-shrink-0">
                    <Coffee className="text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-base sm:text-lg lg:text-xl truncate group-hover:text-jordan-emerald dark:group-hover:text-green-300 transition-colors duration-300">{t('hotelDetails.offers.breakfast.title')}</p>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">{t('hotelDetails.offers.breakfast.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-5 lg:gap-6 p-6 sm:p-7 lg:p-8 rounded-3xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200 min-h-[100px] sm:min-h-[120px] border border-purple-200 dark:border-purple-700 hover:border-purple-300">
                  <div className="bg-purple-500 p-3 sm:p-4 rounded-lg shadow-md flex-shrink-0">
                    <Car className="text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-base sm:text-lg lg:text-xl truncate group-hover:text-jordan-purple dark:group-hover:text-purple-300 transition-colors duration-300">{t('hotelDetails.offers.parking.title')}</p>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">{t('hotelDetails.offers.parking.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-5 lg:gap-6 p-6 sm:p-7 lg:p-8 rounded-3xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 min-h-[100px] sm:min-h-[120px] border border-red-200 dark:border-red-700 hover:border-red-300">
                  <div className="bg-red-500 p-3 sm:p-4 rounded-lg shadow-md flex-shrink-0">
                    <CheckCircle className="text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-base sm:text-lg lg:text-xl truncate group-hover:text-jordan-rose dark:group-hover:text-rose-300 transition-colors duration-300">{t('hotelDetails.offers.frontDesk.title')}</p>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">{t('hotelDetails.offers.frontDesk.subtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="p-8 sm:p-10 lg:p-12">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 leading-tight">
                <span className="text-gray-900 dark:text-white">About This Property</span>
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-lg sm:text-xl mb-8 font-medium">
                  {hotel.description || t('hotelDetails.about.fallbackDescription')}
                </p>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-lg sm:text-xl font-medium">
                  {t('hotelDetails.about.extra')}
                </p>
              </div>
              <div className="mt-10 pt-8 border-t border-white/20 dark:border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-jordan-blue dark:text-jordan-teal mb-2">5★</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Guest Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-jordan-emerald dark:text-green-400 mb-2">24/7</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Concierge</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-jordan-gold dark:text-amber-400 mb-2">120</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-jordan-rose dark:text-rose-400 mb-2">2010</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Established</div>
                  </div>
                </div>
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

        {/* Premium Booking Sidebar - Desktop Only */}
        <aside className="hidden lg:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 lg:sticky lg:top-24 h-fit rounded-lg shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-10 text-center">
              <div className="inline-flex items-end gap-4 mb-4">
                <span className="text-6xl lg:text-7xl font-black text-gray-900 dark:text-white">{hotel.price}</span>
                <span className="text-lg font-bold text-slate-500 dark:text-slate-400 pb-2">JOD</span>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-semibold">/{t('hotels.perNight')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">{t('hotelDetails.booking.averagePrice')}</p>
              <div className="w-16 h-1 bg-gradient-to-r from-jordan-gold to-jordan-rose mx-auto mt-4 rounded-full"></div>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">
              {/* Check-in Date */}
              <div>
                <label className="block text-base font-bold text-slate-900 dark:text-white mb-4">
                  {t('hotelDetails.booking.checkIn')}
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-5 py-5 bg-white/95 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/50 rounded-3xl focus:ring-2 focus:ring-jordan-gold/50 focus:border-jordan-gold/50 transition-all duration-500 text-slate-900 dark:text-white font-semibold text-lg shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-base font-bold text-slate-900 dark:text-white mb-4">
                  {t('hotelDetails.booking.checkOut')}
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-5 py-5 bg-white/95 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/50 rounded-3xl focus:ring-2 focus:ring-jordan-gold/50 focus:border-jordan-gold/50 transition-all duration-500 text-slate-900 dark:text-white font-semibold text-lg shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* Number of Guests */}
              <div>
                <label className="block text-base font-bold text-slate-900 dark:text-white mb-4">
                  {t('hotelDetails.booking.guests')}
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-5 py-5 bg-white/95 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/50 rounded-3xl focus:ring-2 focus:ring-jordan-gold/50 focus:border-jordan-gold/50 transition-all duration-500 text-slate-900 dark:text-white font-semibold text-lg shadow-sm hover:shadow-md appearance-none"
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
                className="w-full py-6 text-xl font-bold rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-colors duration-200 active:scale-95 min-h-[64px]"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center gap-4">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="font-extrabold">{t('hotelDetails.booking.bookingLoading')}</span>
                  </div>
                ) : (
                  <span className="font-extrabold">{t('hotelDetails.booking.reserveNow')}</span>
                )}
              </button>

              <p className="text-center text-slate-500 dark:text-slate-400 text-base font-semibold mt-4 flex items-center justify-center gap-2">
                <span className="text-jordan-emerald text-lg">🔒</span>
                <span>{t('hotelDetails.booking.noChargeYet')}</span>
              </p>
            </form>
          </div>
        </aside>
      </div>

      {/* Premium Related Destinations */}
      <section className="mt-20 mb-12">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl p-10 sm:p-12 lg:p-16 shadow-premium">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">Explore More Destinations</span>
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
              Discover other incredible places in Jordan for your next unforgettable adventure
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {['Petra', 'Amman', 'Dead Sea', 'Wadi Rum', 'Aqaba'].filter(dest => dest !== hotel.location).slice(0, 3).map((destination) => {
              // Map destination names to their search query format
              const destinationQueryMap = {
                'Petra': 'petra',
                'Amman': 'amman',
                'Dead Sea': 'dead sea',
                'Wadi Rum': 'wadi rum',
                'Aqaba': 'aqaba'
              };
              const destinationQuery = destinationQueryMap[destination] || destination.toLowerCase();

              return (
                <Link
                  key={destination}
                  to={`/search?destination=${encodeURIComponent(destinationQuery)}&topRated=true`}
                  className="group bg-white/95 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-600/30 p-8 rounded-3xl hover:shadow-floating transition-all duration-500 hover:-translate-y-2 hover:scale-105"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-jordan-blue to-jordan-teal flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-premium group-hover:shadow-floating">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white group-hover:text-jordan-blue dark:group-hover:text-jordan-teal transition-colors duration-300 mb-2">
                        {destination}
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                        {t(`destinations.${destination.toLowerCase().replace(' ', '')}.desc`, 'Explore this amazing destination')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-4 px-8 py-4 bg-button-gradient hover:bg-button-hover text-white font-bold rounded-3xl shadow-premium hover:shadow-floating transition-all duration-500 transform hover:scale-105 active:scale-95 border border-white/20 text-lg"
            >
              <span className="font-extrabold">View All Destinations</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default React.memo(HotelDetails);