import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import realHotelsAPI from '../services/realHotelsData';
import { validatePromoCode } from '../services/loyalty';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelId, bookingData } = location.state || {};
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    const loadHotel = async () => {
      if (!hotelId || !bookingData) {
        setError('Missing booking information');
        setLoading(false);
        return;
      }

      try {
        const hotelData = await realHotelsAPI.getHotelById(hotelId);
        if (!hotelData) {
          setError('Hotel not found');
          setLoading(false);
          return;
        }
        setHotel(hotelData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load hotel information');
        setLoading(false);
      }
    };

    loadHotel();
  }, [hotelId, bookingData]);

  const calculateTotal = () => {
    if (!hotel || !bookingData) return 0;
    const nights = bookingData.nights || 1;
    return hotel.price * nights;
  };

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      setPromoResult({ valid: false, message: 'Please enter a promo code' });
      return;
    }

    const result = validatePromoCode(promoCode, calculateTotal(), hotelId);
    
    if (result.valid) {
      setPromoResult({ valid: true, message: `Discount applied! Save ${result.discountAmount.toFixed(2)} JOD` });
      setAppliedDiscount(result.discountAmount);
    } else {
      setPromoResult({ valid: false, message: 'Invalid or expired promo code' });
      setAppliedDiscount(0);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOrderComplete(true);
      
      // Redirect to bookings after 3 seconds
      setTimeout(() => {
        navigate('/bookings', { 
          state: { 
            bookingConfirmed: true, 
            bookingId: `BK-${Date.now()}` 
          } 
        });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-24 text-center">Loading checkout...</div>;

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your booking has been confirmed.</p>
          <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

            {hotel && (
              <div className="mb-6 pb-6 border-b">
                <div className="flex gap-4">
                  <img src={hotel.image} alt={hotel.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{hotel.name}</h3>
                    <p className="text-gray-600 text-sm">{hotel.location}</p>
                    <p className="text-blue-600 font-bold mt-2">{hotel.price} JOD/night</p>
                  </div>
                </div>
              </div>
            )}

            {bookingData && (
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-bold">{bookingData.checkInDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-bold">{bookingData.checkOutDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-bold">{bookingData.nights || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-bold">{bookingData.guests || 2}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">{calculateTotal()} JOD</span>
              </div>
              
              {/* Promo Code Section */}
              <div className="bg-blue-50 rounded-lg p-4 -mx-6 px-6">
                <label className="block font-bold mb-2 text-sm">Have a promo code?</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoResult(null);
                    }}
                    placeholder="Enter promo code"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold text-sm"
                  >
                    Apply
                  </button>
                </div>
                {promoResult && (
                  <div className={`flex items-center gap-2 text-sm ${promoResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {promoResult.valid ? <Check size={16} /> : <X size={16} />}
                    {promoResult.message}
                  </div>
                )}
              </div>
              
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-{appliedDiscount.toFixed(2)} JOD</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-bold">{((calculateTotal() - appliedDiscount) * 0.1).toFixed(2)} JOD</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">{((calculateTotal() - appliedDiscount) * 1.1).toFixed(2)} JOD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-2">Full Name *</label>
              <input type="text" className="w-full border rounded-lg px-4 py-2" placeholder="John Doe" />
            </div>

            <div>
              <label className="block font-bold mb-2">Email *</label>
              <input type="email" className="w-full border rounded-lg px-4 py-2" placeholder="john@example.com" />
            </div>

            <div>
              <label className="block font-bold mb-2">Phone *</label>
              <input type="tel" className="w-full border rounded-lg px-4 py-2" placeholder="+962" />
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="font-bold mb-4">Payment Method</h3>
              <div className="space-y-3 mb-6">
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50">
                  <label className="flex items-center">
                    <input type="radio" name="payment" defaultChecked className="mr-3" />
                    <span>Credit/Debit Card</span>
                  </label>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50">
                  <label className="flex items-center">
                    <input type="radio" name="payment" className="mr-3" />
                    <span>PayPal</span>
                  </label>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50">
                  <label className="flex items-center">
                    <input type="radio" name="payment" className="mr-3" />
                    <span>Apple Pay</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block font-bold mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">CVV</label>
                    <input type="text" placeholder="123" className="w-full border rounded-lg px-4 py-2" />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold disabled:bg-gray-400"
              >
                {processing ? 'Processing...' : `Pay ${((calculateTotal() - appliedDiscount) * 1.1).toFixed(2)} JOD`}
              </button>

              <p className="text-xs text-gray-600 text-center mt-4">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
