import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Users, MapPin } from 'lucide-react';
import hotelsService from '../services/hotelsService';
import { hotelAPI } from '../services/api';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import OptimizedImage from '../components/OptimizedImage';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hotelById, setHotelById] = useState({});
  const [cancellingId, setCancellingId] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const items = await hotelAPI.getUserBookings();
        if (!cancelled) setBookings(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load bookings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bookingHotelIds = useMemo(
    () => [...new Set(bookings.map((b) => b?.hotelId).filter(Boolean))],
    [bookings]
  );

  useEffect(() => {
    const missing = bookingHotelIds.filter((id) => id && !hotelById[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        missing.map(async (id) => {
          try {
            const h = await hotelsService.getHotelById(id);
            return [id, h];
          } catch {
            return [id, null];
          }
        })
      );
      if (cancelled) return;
      setHotelById((prev) => {
        const next = { ...prev };
        for (const [id, h] of results) next[id] = h;
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingHotelIds, hotelById]);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    setError('');
    try {
      await hotelAPI.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (e) {
      setError(e?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Your Bookings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track your hotel reservations</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            Loading bookings...
          </div>
        )}

        {!loading && bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">You have no bookings yet.</p>
            <p className="text-slate-500 dark:text-slate-500 mt-2">Start exploring hotels to make your first booking!</p>
          </div>
        ) : !loading ? (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const h = booking?.hotelId ? hotelById[booking.hotelId] : null;
              const image = booking?.image || booking?.hotelImage || h?.image || '';
              const name = booking?.hotelName || h?.name || 'Hotel stay';
              const location = booking?.location || h?.location || 'Jordan';
              const status = String(booking?.status || 'confirmed');
              const checkIn = booking?.checkInDate || booking?.checkIn || booking?.startDate;
              const checkOut = booking?.checkOutDate || booking?.checkOut || booking?.endDate;
              const guests = booking?.numberOfGuests || booking?.guests || 2;
              const nights = booking?.nights || 1;
              const total = booking?.totalPrice || booking?.total || 0;
              const reference = booking?.bookingReference || booking?.id;

              return (
                  <div key={booking.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Image */}
                  <div className="md:col-span-1">
                    <OptimizedImage
                      src={image}
                      alt={name}
                      ratio="3/2"
                      className="sm:aspect-[4/3] rounded-lg"
                      onError={createHotelImageOnErrorHandler(`booking:${booking.id}`)}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h3>
                        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin size={16} />
                          {location}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        status.toLowerCase() === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Check-in</p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar size={16} />
                          {checkIn ? new Date(checkIn).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Check-out</p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar size={16} />
                          {checkOut ? new Date(checkOut).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Guests</p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Users size={16} />
                          {guests}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Nights</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{nights}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Total Price</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">{total} JOD</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 break-all">Reference: {reference}</p>
                        <div className="flex gap-2 sm:justify-end">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="w-full sm:w-auto px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold disabled:opacity-60"
                          >
                            {cancellingId === booking.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Bookings;
