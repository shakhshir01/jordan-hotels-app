import React, { useEffect, useState } from 'react';
import { hotelAPI } from '../services/api';
import { Loader2 } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await hotelAPI.getUserBookings();
        setBookings(data);
      } catch (err) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-slate-600">You have no bookings yet.</div>
      ) : (
        <div className="grid gap-4">
          {bookings.map(b => (
            <div key={b.id} className="p-4 bg-white rounded-lg shadow flex justify-between items-center">
              <div>
                <div className="font-bold">{b.hotelName}</div>
                <div className="text-sm text-slate-600">{b.checkInDate} • {b.numberOfGuests} guest(s)</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{b.totalPrice} JOD</div>
                <div className="text-sm text-slate-500">Status: {b.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
