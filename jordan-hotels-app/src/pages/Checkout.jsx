import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import hotelsService from '../services/hotelsService';
import { validatePromoCode } from '../services/loyalty';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { hotelAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';
import LazyStripePaymentIntent from '../components/stripe/LazyStripePaymentIntent';
import LazyPayPalButtons from '../components/paypal/LazyPayPalButtons';

const Checkout = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelId, bookingData, discount } = location.state || {};
  const resolvedBookingData = bookingData || {
    checkInDate: '',
    checkOutDate: '',
    nights: 1,
    guests: 2,
  };
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [guestInfo, setGuestInfo] = useState({ fullName: '', email: '', phone: '' });
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    const loadHotel = async () => {
      if (!hotelId) {
        setLoading(false);
        return;
      }

      try {
        const hotelData = await hotelsService.getHotelById(hotelId);
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
  }, [hotelId]);

  useEffect(() => {
    // Deals / offers can pass a percent discount (e.g. 20 for 20% off).
    // Apply it automatically unless a promo code overrides it later.
    if (!hotel) return;
    const pct = Number(discount);
    if (!Number.isFinite(pct) || pct <= 0) return;
    const nights = resolvedBookingData.nights || 1;
    const subtotal = (hotel.price || 0) * nights;
    const amount = Number(((subtotal * pct) / 100).toFixed(2));
    if (amount > 0) {
      setPromoResult({ valid: true, message: `Deal applied! Save ${amount.toFixed(2)} JOD` });
      setAppliedDiscount(amount);
    }
  }, [hotel, discount, resolvedBookingData.nights]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await hotelAPI.getUserProfile();
        if (cancelled) return;
        const fullName = profile?.name || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
        setGuestInfo({
          fullName: fullName || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
        });
      } catch {
        // If profile isn't available yet (auth/config), keep fields empty.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculateTotal = () => {
    if (!hotel) return 0;
    const nights = resolvedBookingData.nights || 1;
    return hotel.price * nights;
  };

  const calculateTotalWithTax = () => {
    const subtotal = calculateTotal();
    const total = Number(((subtotal - appliedDiscount) * 1.1).toFixed(2));
    return Number.isFinite(total) ? total : 0;
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

  const validateGuestInfo = () => {
    if (!guestInfo.fullName.trim() || !guestInfo.email.trim() || !guestInfo.phone.trim()) {
      throw new Error('Please fill in your name, email, and phone');
    }
  };

  const persistProfile = async () => {
    validateGuestInfo();

    const [firstName, ...rest] = guestInfo.fullName.trim().split(' ');
    const lastName = rest.join(' ');

    await hotelAPI.updateUserProfile({
      firstName,
      lastName,
      email: guestInfo.email.trim(),
      phone: guestInfo.phone.trim(),
    });

    return true;
  };

  const createBooking = async ({ paymentProvider, paymentIntentId, paypalDetails } = {}) => {
    const total = calculateTotalWithTax();
    const bookingPayload = {
      hotelId,
      hotelName: hotel?.name,
      location: hotel?.location,
      checkInDate: resolvedBookingData.checkInDate || null,
      checkOutDate: resolvedBookingData.checkOutDate || null,
      nights: resolvedBookingData.nights || 1,
      guests: resolvedBookingData.guests || 2,
      totalPrice: total,
      status: 'confirmed',
      userName: guestInfo.fullName.trim(),
      userEmail: guestInfo.email.trim(),
      phone: guestInfo.phone.trim(),
      paymentProvider: paymentProvider || undefined,
      paymentIntentId: paymentIntentId || undefined,
      paypal: paypalDetails || undefined,
    };

    const created = await hotelAPI.bookHotel(hotelId, bookingPayload);
    const bookingId = created?.id || created?.bookingId || `BK-${Date.now()}`;
    setCreatedBookingId(bookingId);
    return bookingId;
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      if (paymentMethod !== 'card') {
        throw new Error('Please use the PayPal button to complete PayPal payments.');
      }

      // Fallback demo path (when Stripe isn't configured): keep the old simulated processing.
      await persistProfile();
      const bookingId = await createBooking({ paymentProvider: 'demo' });

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setOrderComplete(true);

      setTimeout(() => {
        navigate('/bookings', {
          state: {
            bookingConfirmed: true,
            bookingId,
          },
        });
      }, 1800);
    } catch (err) {
      setError(err.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  const handlePayPalApproved = async () => {
    setProcessing(true);
    setError('');
    try {
      await persistProfile();
      const bookingId = await createBooking({ paymentProvider: 'paypal' });
      setOrderComplete(true);

      setTimeout(() => {
        navigate('/bookings', {
          state: {
            bookingConfirmed: true,
            bookingId,
          },
        });
      }, 1800);
    } catch (err) {
      setError(err.message || 'PayPal payment processing failed');
      setProcessing(false);
    }
  };

  const stripeEnabled = Boolean(
    import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  );

  const handleCreateStripePaymentIntent = async ({ amount, currency }) => {
    await persistProfile();
    const metadata = {
      hotelId: String(hotelId || ''),
    };
    return await hotelAPI.createPaymentIntent({
      amount,
      currency,
      metadata,
    });
  };

  const handleStripeSuccess = async (paymentIntent) => {
    setProcessing(true);
    setError('');
    try {
      const bookingId = await createBooking({
        paymentProvider: 'stripe',
        paymentIntentId: paymentIntent?.id,
      });

      setOrderComplete(true);
      setTimeout(() => {
        navigate('/bookings', {
          state: {
            bookingConfirmed: true,
            bookingId,
          },
        });
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to create booking after payment');
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
          {createdBookingId && (
            <p className="text-xs text-gray-500 mb-2">Booking ID: {createdBookingId}</p>
          )}
          <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  if (!hotelId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Checkout</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-700 mb-4">Choose a hotel to start booking.</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Browse hotels
          </button>
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
              (() => {
                const hotelName = getHotelDisplayName(hotel, i18n.language);
                return (
              <div className="mb-6 pb-6 border-b">
                <div className="flex gap-4">
                  <img
                    src={hotel.image}
                    alt={hotelName}
                    onError={createHotelImageOnErrorHandler(hotel.id)}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{hotelName}</h3>
                    <p className="text-gray-600 text-sm">{hotel.location}</p>
                    <p className="text-blue-600 font-bold mt-2">{hotel.price} JOD/night</p>
                  </div>
                </div>
              </div>
                );
              })()
            )}

            {resolvedBookingData && (
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-bold">{resolvedBookingData.checkInDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-bold">{resolvedBookingData.checkOutDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-bold">{resolvedBookingData.nights || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-bold">{resolvedBookingData.guests || 2}</span>
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
              <input
                type="text"
                value={guestInfo.fullName}
                onChange={(e) => setGuestInfo((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Email *</label>
              <input
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Phone *</label>
              <input
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="+962"
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="font-bold mb-4">Payment Method</h3>
              <div className="space-y-3 mb-6">
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mr-3"
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                </div>
                <div className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mr-3"
                    />
                    <span>PayPal</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {paymentMethod === 'card' && (
                  <>
                    {/* If Stripe is configured, render secure card UI + confirm a PaymentIntent.
                        Otherwise fall back to placeholder inputs + simulated checkout. */}
                    {stripeEnabled ? (
                      <LazyStripePaymentIntent
                        amount={calculateTotalWithTax()}
                        currency="jod"
                        billingDetails={{
                          name: guestInfo.fullName,
                          email: guestInfo.email,
                          phone: guestInfo.phone,
                        }}
                        disabled={processing}
                        onProcessingChange={setProcessing}
                        onCreatePaymentIntent={handleCreateStripePaymentIntent}
                        onSuccess={handleStripeSuccess}
                        onError={(e) => setError(e?.message || 'Stripe payment failed')}
                      />
                    ) : (
                      <>
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

                        <button
                          onClick={handlePayment}
                          disabled={processing}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold disabled:bg-gray-400"
                        >
                          {processing ? 'Processing...' : `Pay ${calculateTotalWithTax().toFixed(2)} JOD`}
                        </button>

                        <p className="text-xs text-gray-600 text-center mt-4">
                          Your payment information is secure and encrypted
                        </p>
                      </>
                    )}
                  </>
                )}

                {paymentMethod === 'paypal' && (
                  <LazyPayPalButtons
                    amount={Number(((calculateTotal() - appliedDiscount) * 1.1).toFixed(2))}
                    currency="USD"
                    disabled={processing}
                    onApproved={handlePayPalApproved}
                    onError={(e) => setError(e?.message || 'PayPal failed')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
