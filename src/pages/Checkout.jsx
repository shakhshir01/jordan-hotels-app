import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { hotelAPI } from '../services/api';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelId, bookingData } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const doCheckout = async () => {
      if (!hotelId || !bookingData) {
        setError('Missing booking information');
        setLoading(false);
        return;
      }

      try {
        const res = await hotelAPI.createCheckoutSession(hotelId, bookingData);
        const sessionId = res?.sessionId;
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!sessionId || !stripeKey) {
          setError('Checkout is not configured. Please contact support.');
          setLoading(false);
          return;
        }
        const stripe = await loadStripe(stripeKey);
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          setError(error.message || 'Stripe redirect failed');
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Failed to start checkout');
        setLoading(false);
      }
    };

    doCheckout();
  }, [hotelId, bookingData, navigate]);

  if (loading) return <div className="p-24 text-center">Redirecting to payment...</div>;
  return (
    <div className="p-12 text-center">
      {error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div>Redirecting...</div>
      )}
    </div>
  );
};

export default Checkout;
