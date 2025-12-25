import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Wifi, Coffee, Car, Loader2, AlertCircle } from 'lucide-react';
import { hotelAPI } from '../services/api';

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
        const data = await hotelAPI.getHotelById(id);
        setHotel(data);
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
      // If payments are configured, create a checkout session and redirect
      const paymentResponse = await hotelAPI.createCheckoutSession(id, bookingData);
      if (paymentResponse?.sessionId) {
        // Use client-side Checkout page to redirect via Stripe
        navigate('/checkout', { state: { hotelId: id, bookingData } });
        return;
      }
      const result = await hotelAPI.bookHotel(id, bookingData);
      alert(`Booking successful! Reference: ${result.id}`);
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black text-blue-900 hover:text-black transition">
          Visit Jordan
        </Link>
        <Link to="/" className="text-blue-900 font-bold hover:underline">
          ← Back to Hotels
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-900 transition">Home</Link>
          {' / '}
          <span>{hotel.location}</span>
          {' / '}
          <span className="text-black font-semibold">{hotel.name}</span>
        </nav>

        {/* Amazing Image Gallery Grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px] mb-10 overflow-hidden rounded-2xl">
          <div className="col-span-2 row-span-2">
            <img 
              src={hotel.image} 
              className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer" 
              alt="Main" 
            />
          </div>
          <div className="col-span-1 row-span-1">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800" 
              className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer"
              alt="Room"
            />
          </div>
          <div className="col-span-1 row-span-1">
            <img 
              src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800" 
              className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer"
              alt="Amenities"
            />
          </div>
          <div className="col-span-1 row-span-1">
            <img 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800" 
              className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer"
              alt="View"
            />
          </div>
          <div className="col-span-1 row-span-1 bg-gray-900 relative">
            <img 
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800" 
              className="w-full h-full object-cover opacity-50"
              alt="More photos"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:opacity-80 transition">
              +12 Photos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column: Info */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-black text-blue-900 mb-2">{hotel.name}</h1>
            <p className="flex items-center gap-1 text-gray-600 mb-4">
              <MapPin className="w-5 h-5" /> {hotel.location}, Jordan
            </p>
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