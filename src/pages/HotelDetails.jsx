import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Wifi, Coffee, Car, Loader2, AlertCircle } from 'lucide-react';
import realHotelsAPI from '../services/realHotelsData';
import { hotelAPI } from '../services/api';
import WishlistButton from '../components/WishlistButton';

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
  const { id } = useParams();
  const navigate = useNavigate();
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

        try {
          data = await hotelAPI.getHotelById(id);
        } catch (apiErr) {
          console.warn('hotelAPI.getHotelById failed, falling back to realHotelsAPI:', apiErr.message || apiErr);
        }

        if (!data) {
          data = await realHotelsAPI.getHotelById(id);
        }

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
      alert('Please select a check-in date');
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
      alert(err.message || 'Booking failed. Please try again.');
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
              <h3 className="font-bold text-red-900 mb-2">Error Loading Hotel</h3>
              <p className="text-red-700">{error || 'Hotel not found.'}</p>
              <Link to="/" className="text-red-900 font-bold hover:underline mt-4 inline-block">
                ← Back to Hotels
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-jordan-blue transition">Home</Link>
          {' / '}
          <span>{hotel.location}</span>
          {' / '}
          <span className="text-black font-semibold">{hotel.name}</span>
        </nav>

        {/* Gallery with all hotel images */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden rounded-2xl">
            {hotel.images && hotel.images.length > 0 ? (
              hotel.images.slice(0, 8).map((img, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition group h-48 md:h-56">
                  <img 
                    src={img}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    alt={`${hotel.name} - Image ${idx + 1}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))
            ) : (
              <div className="md:col-span-4 h-64 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>
          {hotel.images && hotel.images.length > 8 && (
            <p className="text-center text-gray-500 mt-4">
              + {hotel.images.length - 8} more photos
            </p>
          )}
        </div>

        {/* Replace flaky Unsplash gallery with one reliable hero image + placeholders */}
        <div className="hidden grid-cols-1 md:grid-cols-3 gap-4 mb-10 overflow-hidden rounded-2xl">
          <div className="md:col-span-2">
            <img
              src={hotel.image || FALLBACK_IMG}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
              className="w-full h-[420px] object-cover rounded-2xl"
              alt={hotel.name}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid gap-4">
            <div className="h-[200px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-100" />
            <div className="h-[200px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column: Info */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-black text-blue-900 mb-2">{hotel.name}</h1>
                <p className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-5 h-5" /> {hotel.location}, Jordan
                </p>
              </div>
              <WishlistButton item={hotel} />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center text-orange-500 font-bold">
                <Star size={20} fill="currentColor" /> {hotel.rating}
              </div>
              <span className="text-gray-500">(124 reviews)</span>
            </div>
            
            <div className="border-t border-b py-8 mb-8">
              <h3 className="text-2xl font-bold mb-6">What this place offers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Wifi className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Free High Speed WiFi</p>
                    <p className="text-sm text-gray-500">Available everywhere</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Coffee className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Breakfast Included</p>
                    <p className="text-sm text-gray-500">Every morning</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Car className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">Free Parking</p>
                    <p className="text-sm text-gray-500">On premises</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <CheckCircle className="text-blue-900" size={24} />
                  </div>
                  <div>
                    <p className="font-bold">24/7 Front Desk</p>
                    <p className="text-sm text-gray-500">Always available</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">About this hotel</h3>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {hotel.description || 'Experience the true beauty of Jordan in this luxury stay. Located just minutes away from historical sites, this hotel offers world-class service, traditional Jordanian hospitality, and breathtaking views.'}
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Whether you're visiting the ancient wonders of Petra, relaxing at the Dead Sea, or exploring the vast landscapes of Wadi Rum, this hotel is your perfect base for an unforgettable Jordanian adventure.
              </p>
            </div>
          </div>

          {/* Right Column: Booking Sidebar */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 sticky top-24 h-fit">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl font-black text-blue-900">{hotel.price} JOD</span>
                <span className="text-sm font-medium text-gray-500">/night</span>
              </div>
              <p className="text-sm text-gray-600">Average price based on availability</p>
            </div>
            
            <form onSubmit={handleBooking} className="space-y-6">
              {/* Check-in Date */}
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Check-in Date</label>
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
                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Number of Guests</label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-900 transition bg-white"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>

              {/* Total Price */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">
                    {hotel.price} JOD × {guests} night{guests > 1 ? 's' : ''}
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
                {bookingLoading ? 'Booking...' : 'Reserve Now'}
              </button>

              <p className="text-center text-gray-500 text-xs">
                You won't be charged yet. Click to confirm booking.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;