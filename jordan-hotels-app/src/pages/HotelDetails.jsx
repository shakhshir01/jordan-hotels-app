import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Wifi, Coffee, Car, Loader2, AlertCircle } from 'lucide-react';
import hotelsService from '../services/hotelsService';
import WishlistButton from '../components/WishlistButton';
import Seo from '../components/Seo.jsx';
import {
  createHotelImageOnErrorHandler,
} from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';

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
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [guests, setGuests] = useState('1');
  const [bookingLoading, setBookingLoading] = useState(false);

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

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!checkInDate) {
      alert(t('hotelDetails.errors.selectCheckIn'));
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        checkInDate,
        numberOfGuests: parseInt(guests),
        totalPrice: hotel.price * parseInt(guests),
      };
      // Navigate to checkout with hotel and booking data
      navigate('/checkout', { state: { hotelId: id, bookingData, hotel } });
    } catch (err) {
      alert(err.message || t('hotelDetails.errors.bookingFailed'));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-jordan-blue" size={48} />
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
    const price = hotel?.price ? `${hotel.price} JOD` : 'great rates';
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
        priceRange: hotel?.price ? `${hotel.price} JOD` : undefined,
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
    <div className="space-y-10">
      <Seo
        title={`${hotelName} | VisitJo`}
        description={descriptionText}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLdGraph}
      />
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <Link to="/" className="hover:text-jordan-blue transition">{t('nav.home')}</Link>
        {' / '}
        <span>{hotel.location}</span>
        {' / '}
        <span className="text-slate-900 dark:text-slate-100 font-semibold">{hotelName}</span>
      </nav>

      {/* Gallery with all hotel images */}
      <section className="surface p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">{t('hotelDetails.gallery.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden rounded-2xl">
            {hotel.images && hotel.images.length > 0 ? (
              hotel.images.slice(0, 8).map((img, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition group h-48 md:h-56">
                  <img 
                    src={img}
                    onError={createHotelImageOnErrorHandler(`${hotel.id}:${idx}`, FALLBACK_IMG)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    alt={t('hotelDetails.gallery.imageAlt', { name: hotelName, index: idx + 1 })}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))
            ) : (
              <div className="md:col-span-4 h-64 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <p className="text-gray-500">{t('hotelDetails.gallery.none')}</p>
              </div>
            )}
          </div>
          {hotel.images && hotel.images.length > 8 && (
            <p className="text-center text-gray-500 mt-4">
              + {hotel.images.length - 8} {t('hotelDetails.gallery.morePhotos')}
            </p>
          )}
      </section>

        {/* Replace flaky Unsplash gallery with one reliable hero image + placeholders */}
        <div className="hidden grid-cols-1 md:grid-cols-3 gap-4 mb-10 overflow-hidden rounded-2xl">
          <div className="md:col-span-2">
            <img
              src={hotel.image || FALLBACK_IMG}
              onError={createHotelImageOnErrorHandler(hotel.id, FALLBACK_IMG)}
              className="w-full h-[420px] object-cover rounded-2xl"
              alt={hotelName}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid gap-4">
            <div className="h-[200px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-100" />
            <div className="h-[200px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-100" />
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
        {/* Left Column: Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="page-title gradient-text">{hotelName}</h1>
              <p className="page-subtitle mt-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> {hotel.location}, {t('hotelDetails.location.country')}
              </p>
            </div>
            <WishlistButton item={hotel} />
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200 font-semibold">
              <Star size={18} fill="currentColor" className="text-amber-500" />
              <span>{hotel.rating}</span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">(124 {t('hotels.reviews')})</span>
          </div>

          <section className="surface p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">{t('hotelDetails.offers.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <Wifi className="text-jordan-blue" size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{t('hotelDetails.offers.wifi.title')}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('hotelDetails.offers.wifi.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <Coffee className="text-jordan-blue" size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{t('hotelDetails.offers.breakfast.title')}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('hotelDetails.offers.breakfast.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <Car className="text-jordan-blue" size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{t('hotelDetails.offers.parking.title')}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('hotelDetails.offers.parking.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <CheckCircle className="text-jordan-blue" size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{t('hotelDetails.offers.frontDesk.title')}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('hotelDetails.offers.frontDesk.subtitle')}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="surface p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">{t('hotelDetails.about.title')}</h3>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base sm:text-lg mb-4">
              {hotel.description || t('hotelDetails.about.fallbackDescription')}
            </p>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base sm:text-lg">
              {t('hotelDetails.about.extra')}
            </p>
          </section>
        </div>

        {/* Right Column: Booking Sidebar */}
        <aside className="surface p-6 sm:p-8 md:sticky md:top-24 h-fit">
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2 gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-50">{hotel.price} JOD</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/{t('hotels.perNight')}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('hotelDetails.booking.averagePrice')}</p>
          </div>

          <form onSubmit={handleBooking} className="space-y-6">
            {/* Check-in Date */}
            <div>
              <label className="label-premium">{t('hotelDetails.booking.checkIn')}</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-premium"
                required
              />
            </div>

            {/* Number of Guests */}
            <div>
              <label className="label-premium">{t('hotelDetails.booking.guests')}</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="input-premium"
              >
                <option value="1">{t('hotelDetails.booking.guestCount', { count: 1 })}</option>
                <option value="2">{t('hotelDetails.booking.guestCount', { count: 2 })}</option>
                <option value="3">{t('hotelDetails.booking.guestCount', { count: 3 })}</option>
                <option value="4">{t('hotelDetails.booking.guestCount', { count: 4 })}</option>
                <option value="5">{t('hotelDetails.booking.guestCountPlus')}</option>
              </select>
            </div>

            {/* Total Price */}
            <div className="border-t border-slate-200/70 dark:border-slate-700/60 pt-6">
              <div className="flex justify-between items-center mb-4 gap-4">
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {hotel.price} JOD × {guests} {t('hotelDetails.booking.nights', { count: Number(guests) })}
                </span>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-50">
                  {(hotel.price * parseInt(guests)).toLocaleString()} JOD
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading || !checkInDate}
              className="btn-primary w-full disabled:opacity-50"
            >
              {bookingLoading ? t('hotelDetails.booking.bookingLoading') : t('hotelDetails.booking.reserveNow')}
            </button>

            <p className="text-center text-slate-500 dark:text-slate-400 text-xs">
              {t('hotelDetails.booking.noChargeYet')}
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default HotelDetails;