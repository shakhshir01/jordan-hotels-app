import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';

export const PaymentForm = ({ clientSecret, bookingData, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      showError('Payment system not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: bookingData.name,
            email: bookingData.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        showError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        showSuccess('Payment successful! Booking confirmed.');
        onPaymentComplete(result.paymentIntent);
      }
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        '::placeholder': {
          color: '#94a3b8',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-slate-600">{bookingData.hotelName}</span>
            <span className="font-semibold text-slate-900">JOD {bookingData.totalPrice}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>{bookingData.guests} guests • {bookingData.nights || '1'} nights</span>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between">
            <span className="font-bold text-slate-900">Total</span>
            <span className="text-xl font-bold text-blue-900">JOD {bookingData.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Card Details</label>
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-900 font-semibold text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-blue-900 text-white rounded-lg font-bold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Lock size={18} />
        {loading ? 'Processing...' : `Pay JOD ${bookingData.totalPrice}`}
      </button>

      <p className="text-xs text-slate-600 text-center">
        🔒 Your payment is secure and encrypted
      </p>
    </form>
  );
};

export default PaymentForm;
