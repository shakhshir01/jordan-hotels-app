import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Wifi, Coffee, Car, Loader2, AlertCircle } from 'lucide-react';
import realHotelsAPI from '../services/realHotelsData';
import { hotelAPI } from '../services/api';
import WishlistButton from '../components/WishlistButton';
import Seo from '../components/Seo.jsx';
import {
  createHotelImageOnErrorHandler,
  GENERIC_HOTEL_FALLBACK_IMAGES,
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
        let data = null;
        let seed = null;
        let apiData = null;

        try {
          seed = await realHotelsAPI.getHotelById(id);
        } catch {
          seed = null;
        }

        try {
          apiData = await hotelAPI.getHotelById(id);
        } catch (apiErr) {
          console.warn('hotelAPI.getHotelById failed, falling back to realHotelsAPI:', apiErr.message || apiErr);
        }

        // Prefer the curated dataset when available so routing always shows the correct hotel.
        data = seed || apiData;

        if (!data) {
          data = seed || (await realHotelsAPI.getHotelById(id));
        }

        if (!data) {
          setHotel(null);
          setError('Hotel not found.');
        } else {
          const normalized = normalizeHotel(data);
          const seedNormalized = seed ? normalizeHotel(seed) : null;
          const apiNormalized = apiData ? normalizeHotel(apiData) : null;

          // If the API returns no real photos (or only our generic fallbacks),
          // prefer the curated dataset photos (e.g., Marriott/Mövenpick URLs).
          const fallbackSet = new Set(GENERIC_HOTEL_FALLBACK_IMAGES);
          const apiImages = Array.isArray(normalized?.images) ? normalized.images : [];
          const apiHasRealImage = apiImages.some((u) => typeof u === 'string' && u.trim() && !fallbackSet.has(u.trim()));

          if (seedNormalized && apiNormalized) {
            // If we're showing the API hotel but it lacks real imagery, merge in curated images.
            // If we're showing the curated hotel, still merge any additional non-generic API images.
            const seedImages = Array.isArray(seedNormalized?.images) ? seedNormalized.images : [];
            const apiImages2 = Array.isArray(apiNormalized?.images) ? apiNormalized.images : [];

            const merged = [];
            const addUnique = (arr) => {
              for (const u of arr) {
                if (typeof u !== 'string') continue;
                const s = u.trim();
                if (!s) continue;
                if (merged.includes(s)) continue;
                merged.push(s);
              }
            };

            // Start from whichever object we're currently using
            const base = normalized;

            // Always include current images first
            addUnique(Array.isArray(base?.images) ? base.images : []);

            // If base is API and it's missing real images, add seed images.
            if (!apiHasRealImage) addUnique(seedImages);

            // If base is seed, add any API images that are not generic fallbacks.
            const fallbackSet2 = new Set(GENERIC_HOTEL_FALLBACK_IMAGES);
            const apiRealOnly = apiImages2.filter((u) => typeof u === 'string' && u.trim() && !fallbackSet2.has(u.trim()));
            addUnique(apiRealOnly);

            const next = {
              ...base,
              images: merged.length ? merged : (base.images || []),
            };
            next.image = next.images?.[0] || base.image || seedNormalized.image || apiNormalized.image || '';
            setHotel(next);
          } else {
            setHotel(normalized);
          }
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
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-900" size={48} />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
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
    <div className="bg-transparent">
      <Seo
        title={`${hotelName} | VisitJo`}
        description={descriptionText}
        canonicalUrl={canonicalUrl}
        jsonLd={jsonLdGraph}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-jordan-blue transition">{t('nav.home')}</Link>
          {' / '}
          <span>{hotel.location}</span>
          {' / '}
          <span className="text-black font-semibold">{hotelName}</span>
        </nav>

        {/* Gallery with all hotel images */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">{t('hotelDetails.gallery.title')}</h2>
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
        </div>

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
          <div className="md:col-span-2">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-black text-blue-900 mb-2">{hotelName}</h1>
                <p className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-5 h-5" /> {hotel.location}, {t('hotelDetails.location.country')}
                </p>
              </div>
              <WishlistButton item={hotel} />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center text-orange-500 font-bold">
                <Star size={20} fill="currentColor" /> {hotel.rating}
              </div>
              <span className="text-gray-500">(124 {t('hotels.reviews')})</span>
            </div>
            
            <div className="border-t border-b py-8 mb-8">
              <h3 className="text-2xl font-bold mb-6">{t('hotelDetails.offers.title')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Wifi className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{t('hotelDetails.offers.wifi.title')}</p>
                    <p className="text-sm text-gray-500">{t('hotelDetails.offers.wifi.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Coffee className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{t('hotelDetails.offers.breakfast.title')}</p>
                    <p className="text-sm text-gray-500">{t('hotelDetails.offers.breakfast.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Car className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{t('hotelDetails.offers.parking.title')}</p>
                    <p className="text-sm text-gray-500">{t('hotelDetails.offers.parking.subtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <CheckCircle className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{t('hotelDetails.offers.frontDesk.title')}</p>
                    <p className="text-sm text-gray-500">{t('hotelDetails.offers.frontDesk.subtitle')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">{t('hotelDetails.about.title')}</h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {hotel.description || t('hotelDetails.about.fallbackDescription')}
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                {t('hotelDetails.about.extra')}
              </p>
            </div>
          </div>

          {/* Right Column: Booking Sidebar */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8 md:sticky md:top-24 h-fit">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl font-black text-blue-900">{hotel.price} JOD</span>
                <span className="text-sm font-medium text-gray-500">/{t('hotels.perNight')}</span>
              </div>
              <p className="text-sm text-gray-600">{t('hotelDetails.booking.averagePrice')}</p>
            </div>
            
            <form onSubmit={handleBooking} className="space-y-6">
              {/* Check-in Date */}
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">{t('hotelDetails.booking.checkIn')}</label>
                <input 
                  type="date" 
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-900 transition"
                  required
                />
              </div>

              {/* Number of Guests */}
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">{t('hotelDetails.booking.guests')}</label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-900 transition bg-white"
                >
                  <option value="1">{t('hotelDetails.booking.guestCount', { count: 1 })}</option>
                  <option value="2">{t('hotelDetails.booking.guestCount', { count: 2 })}</option>
                  <option value="3">{t('hotelDetails.booking.guestCount', { count: 3 })}</option>
                  <option value="4">{t('hotelDetails.booking.guestCount', { count: 4 })}</option>
                  <option value="5">{t('hotelDetails.booking.guestCountPlus')}</option>
                </select>
              </div>

              {/* Total Price */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">
                    {hotel.price} JOD × {guests} {t('hotelDetails.booking.nights', { count: Number(guests) })}
                  </span>
                  <span className="font-bold text-lg">
                    {(hotel.price * parseInt(guests)).toLocaleString()} JOD
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={bookingLoading || !checkInDate}
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? t('hotelDetails.booking.bookingLoading') : t('hotelDetails.booking.reserveNow')}
              </button>

              <p className="text-center text-gray-500 text-xs">
                {t('hotelDetails.booking.noChargeYet')}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;