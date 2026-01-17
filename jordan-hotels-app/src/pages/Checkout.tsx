// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import hotelsService from '../services/hotelsService';
import { validatePromoCode } from '../services/loyalty';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { hotelAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';
import OptimizedImage from '../components/OptimizedImage';
import LazyStripePaymentIntent from '../components/stripe/LazyStripePaymentIntent';
import LazyPayPalButtons from '../components/paypal/LazyPayPalButtons';
import Seo from '../components/Seo.jsx';

/**
 * @typedef {{paymentProvider?:string,paymentIntentId?:string,paypalDetails?:any}} CreateBookingOpts
 */

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
  const [acknowledgedRisk, setAcknowledgedRisk] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

    // Track booking start event when checkout page loads
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'booking_start', {
        event_category: 'ecommerce',
      });
    }
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
        if (cancelled) return ;
        const fullName = profile?.name || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
        setGuestInfo({
          fullName: fullName || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
        });
        setIsAuthenticated(true);
      } catch {
        // If profile isn't available yet (auth/config), keep fields empty.
        setIsAuthenticated(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculateTotal = () => {
    // Use detailed breakdown if available from booking data
    if (resolvedBookingData.breakdown) {
      return resolvedBookingData.breakdown.subtotal;
    }
    
    // Fallback to old calculation
    if (!hotel) return 0;
    const nights = resolvedBookingData.nights || 1;
    return hotel.price * nights;
  };

  const calculateTotalWithTax = () => {
    // Use detailed breakdown if available
    if (resolvedBookingData.breakdown) {
      return resolvedBookingData.breakdown.total - appliedDiscount;
    }
    
    // Fallback to old calculation
    const subtotal = calculateTotal();
    const total = Number(((subtotal - appliedDiscount) * 1.1).toFixed(2));
    return Number.isFinite(total) ? total : 0;
  };

  // Derived helpers used in the JSX (fixes undefined references)
  const hotelName = hotel ? getHotelDisplayName(hotel, i18n?.language) || hotel.name : '';
  const getDisplayPrice = (h) => {
    if (!h) return '0.00';
    const p = Number(h.price || 0);
    return p.toFixed(2);
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

  const paymentsEnabled = String(import.meta.env.VITE_PAYMENTS_ENABLED || '').toLowerCase() === 'true';

  /**
   * Create a booking record.
   * @param {{paymentProvider?:string,paymentIntentId?:string,paypalDetails?:any}} [opts]
   * @returns {Promise<string>}
   */
  const createBooking = async (opts: { paymentProvider?: string; paymentIntentId?: string; paypalDetails?: any } = {}) => {
    // @ts-ignore
    const { paymentProvider, paymentIntentId, paypalDetails } = opts;
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
    if (!acknowledgedRisk) {
      setError('Please acknowledge the booking/payment disclaimer before continuing');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      if (paymentMethod !== 'card') {
        throw new Error('Please use the PayPal button to complete PayPal payments.');
      }

      // Demo mode removed - require real payments
      throw new Error('Payment processing is not configured. Please configure Stripe or PayPal.');
    } catch (err) {
      setError(err.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  const handlePayPalApproved = async () => {
    if (!acknowledgedRisk) {
      setError('Please acknowledge the booking/payment disclaimer before continuing');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      if (isAuthenticated) {
        await persistProfile();
      }
      const bookingId = await createBooking({ paymentProvider: 'paypal' });
      setOrderComplete(true);

      // Track booking complete event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'booking_complete', {
          event_category: 'ecommerce',
          value: calculateTotalWithTax()
        });
      }

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
    (import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) && paymentsEnabled
  );

  const stripePublishableKey =
    import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const stripeTestMode = String(stripePublishableKey).startsWith('pk_test_');
  const paypalClientId = String(import.meta.env.VITE_PAYPAL_CLIENT_ID || '');
  const paypalSandboxMode = paypalClientId === 'sb' || paypalClientId.startsWith('sb');

  /**
   * Create a Stripe PaymentIntent via API.
   * @param {Object} [opts]
   * @param {number} opts.amount
   * @param {string} [opts.currency]
   */
  const handleCreateStripePaymentIntent = async (opts = {}) => {
    const { amount, currency = 'jod' } = /** @type {{amount:number,currency?:string}} */ (opts);
    if (isAuthenticated) {
      await persistProfile();
    }
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
    if (!acknowledgedRisk) {
      setError('Please acknowledge the booking/payment disclaimer before continuing');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const bookingId = await createBooking({
        paymentProvider: 'stripe',
        paymentIntentId: paymentIntent?.id,
      });

      setOrderComplete(true);

      // Track booking complete event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'booking_complete', {
          event_category: 'ecommerce',
          value: calculateTotalWithTax()
        });
      }
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

  if (loading) return <div className="py-24 text-center text-slate-600 dark:text-slate-300">Loading checkout...</div>;

  if (orderComplete) {
    return (
      <div className="page-section">
        <div className="max-w-md mx-auto surface p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Checkout Complete
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you. Your payment is complete and your booking is confirmed.
          </p>
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
      <div className="page-section">
        <h1 className="page-title mb-4">Checkout</h1>
        <div className="surface p-6">
          <p className="text-gray-700 dark:text-gray-200 mb-4">Choose a hotel to start booking.</p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Browse hotels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Seo
        title="Secure Checkout - Complete Your Jordan Hotel Booking"
        description="Complete your secure hotel booking in Jordan. Safe payment processing with multiple options including credit card and PayPal."
        noindex={true}
        canonicalUrl="https://visitjo.com/checkout"
      />
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-16 md:py-20 text-center text-white max-w-3xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-80 mb-3">
            Secure Checkout
          </p>
          <h1 className="text-4xl md:text-5xl font-black font-display mb-4">
            Complete Your Booking
          </h1>
          <p className="text-sm md:text-base opacity-95 leading-relaxed mb-6">
            You're just moments away from securing your unforgettable Jordan adventure. Review your details and confirm your reservation.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-emerald-400">🔒</span>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-blue-400">⚡</span>
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-green-400">📧</span>
              <span>Email Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-2xl mb-6 border border-red-200">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <div className="surface p-6 mb-6">
            <h2 className="text-2xl font-black font-display tracking-tight mb-4">Order Summary</h2>

            {hotel && (
              <div className="mb-6 pb-6 border-b">
                <div className="flex gap-4">
                  <OptimizedImage
                    src={hotel.image}
                    alt={hotelName}
                    onError={createHotelImageOnErrorHandler(hotel.id)}
                    className="w-24 h-24 object-cover rounded-lg"
                    sizes="96px"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{hotelName}</h3>
                    <p className="text-gray-600 text-sm">{hotel.location}</p>
                    <p className="text-blue-600 font-bold mt-2">{getDisplayPrice(hotel)} JOD/night</p>
                  </div>
                </div>
              </div>
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

            {resolvedBookingData.cancellationPolicy && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <Check size={16} />
                  Cancellation Policy
                </h3>
                <div className="space-y-1 text-sm text-amber-700">
                  <div>• {resolvedBookingData.cancellationPolicy.free}</div>
                  <div>• {resolvedBookingData.cancellationPolicy.partial}</div>
                  <div>• {resolvedBookingData.cancellationPolicy.noRefund}</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {resolvedBookingData.breakdown ? (
                // Detailed breakdown from booking data
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{resolvedBookingData.breakdown.basePrice} JOD × {resolvedBookingData.breakdown.nights} nights</span>
                    <span className="font-bold">{resolvedBookingData.breakdown.subtotal} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-bold">{resolvedBookingData.breakdown.serviceFee} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cleaning fee</span>
                    <span className="font-bold">{resolvedBookingData.breakdown.cleaningFee} JOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes (16% VAT)</span>
                    <span className="font-bold">{resolvedBookingData.breakdown.tax} JOD</span>
                  </div>
                </>
              ) : (
                // Fallback to simple subtotal
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">{calculateTotal()} JOD</span>
                </div>
              )}
              
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
                    className="flex-1 input-premium !py-2 !text-sm"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="btn-primary !px-5 !py-2 !rounded-xl !text-sm"
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
              
              {!resolvedBookingData.breakdown && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-bold">{((calculateTotal() - appliedDiscount) * 0.1).toFixed(2)} JOD</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-blue-600">{calculateTotalWithTax().toFixed(2)} JOD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="surface p-6">
          <h2 className="text-2xl font-black font-display tracking-tight mb-6">Payment Details</h2>



          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm mb-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={acknowledgedRisk}
                onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                className="mt-1"
              />
              <span>
                I acknowledge the booking terms and conditions.
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-premium">Full Name *</label>
              <input
                type="text"
                value={guestInfo.fullName}
                onChange={(e) => setGuestInfo((p) => ({ ...p, fullName: e.target.value }))}
                className="input-premium"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="label-premium">Email *</label>
              <input
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))}
                className="input-premium"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="label-premium">Phone *</label>
              <input
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))}
                className="input-premium"
                placeholder="+962"
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="font-bold mb-4">Payment Method</h3>
              <div className="space-y-3 mb-6">
                <div className="border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-4 cursor-pointer hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition">
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
                <div className="border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-4 cursor-pointer hover:bg-blue-50/60 dark:hover:bg-slate-800/50 transition">
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
                        disabled={processing || !acknowledgedRisk}
                        onProcessingChange={setProcessing}
                        onCreatePaymentIntent={handleCreateStripePaymentIntent}
                        onSuccess={handleStripeSuccess}
                        onError={(e) => setError(e?.message || 'Stripe payment failed')}
                      />
                    ) : (
                      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
                        Payment processing is not configured. Please configure Stripe or PayPal to enable bookings.
                      </div>
                    )}
                  </>
                )}

                {paymentMethod === 'paypal' &&
                  (paymentsEnabled && paypalClientId ? (
                    <LazyPayPalButtons
                      amount={Number(((calculateTotal() - appliedDiscount) * 1.1).toFixed(2))}
                      currency="USD"
                      disabled={processing || !acknowledgedRisk}
                      onApproved={handlePayPalApproved}
                      onError={(e) => setError(e?.message || 'PayPal failed')}
                    />
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm">
                      PayPal payments are not enabled for this environment.
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;