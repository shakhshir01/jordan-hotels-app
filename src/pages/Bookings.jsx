import React, { useState } from 'react';
import { Loader2, Calendar, Users, MapPin, CreditCard } from 'lucide-react';
import realHotelsAPI from '../services/realHotelsData';

const Bookings = () => {
  // Mock bookings data with real hotel info
  const [bookings] = useState([
    {
      id: 'BK-001',
      hotelId: 'dead-sea-marriott',
      hotelName: 'Dead Sea Marriott Resort & Spa',
      location: 'Dead Sea',
      checkInDate: '2025-02-15',
      checkOutDate: '2025-02-18',
      numberOfGuests: 2,
      nights: 3,
      totalPrice: 840,
      status: 'Confirmed',
      bookingReference: 'MR-2025-BK-001'
    },
    {
      id: 'BK-002',
      hotelId: 'mövenpick-petra',
      hotelName: 'Mövenpick Resort Petra',
      location: 'Petra',
      checkInDate: '2025-03-10',
      checkOutDate: '2025-03-13',
      numberOfGuests: 4,
      nights: 3,
      totalPrice: 660,
      status: 'Pending',
      bookingReference: 'MP-2025-BK-002'
    },
    {
      id: 'BK-003',
      hotelId: 'grand-hyatt-amman',
      hotelName: 'Grand Hyatt Amman',
      location: 'Amman',
      checkInDate: '2025-01-20',
      checkOutDate: '2025-01-23',
      numberOfGuests: 3,
      nights: 3,
      totalPrice: 540,
      status: 'Confirmed',
      bookingReference: 'GH-2025-BK-003'
    },
    {
      id: 'BK-004',
      hotelId: 'hilton-aqaba',
      hotelName: 'Hilton Aqaba Resort',
      location: 'Aqaba',
      checkInDate: '2025-04-05',
      checkOutDate: '2025-04-08',
      numberOfGuests: 2,
      nights: 3,
      totalPrice: 450,
      status: 'Pending',
      bookingReference: 'HA-2025-BK-004'
    }
  ]);

  const [hotelImages, setHotelImages] = useState({});
  const [loading, setLoading] = useState(true);

  // Load hotel images on mount
  React.useEffect(() => {
    const loadHotelImages = async () => {
      try {
        const allHotels = await realHotelsAPI.getFeaturedHotels();
        const imageMap = {};
        
        allHotels.forEach(hotel => {
          imageMap[hotel.id] = hotel.image;
        });
        
        setHotelImages(imageMap);
      } catch (error) {
        console.error('Error loading hotel images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHotelImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Your Bookings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track your hotel reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">You have no bookings yet.</p>
            <p className="text-slate-500 dark:text-slate-500 mt-2">Start exploring hotels to make your first booking!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Image */}
                  <div className="md:col-span-1">
                    <img 
                      src={booking.image} 
                      alt={booking.hotelName} 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{booking.hotelName}</h3>
                        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin size={16} />
                          {booking.location}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        booking.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Check-in</p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Check-out</p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Guests</p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Users size={16} />
                          {booking.numberOfGuests}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Nights</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{booking.nights}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Total Price</p>
                        <p className="text-3xl font-bold text-blue-600">{booking.totalPrice} JOD</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Reference: {booking.bookingReference}</p>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                            View Details
                          </button>
                          <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold">
                            Modify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
