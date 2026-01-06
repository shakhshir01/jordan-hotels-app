import { api } from './api';

/**
 * Stripe Payment Service
 * Handles payment processing and checkout flow
 */

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY) {
  console.warn('STRIPE_PUBLIC_KEY not configured');
}

/**
 * Create a payment intent on the backend
 */
export const createPaymentIntent = async (bookingData) => {
  try {
    const response = await api.post('/payments/create-intent', {
      amount: Math.round(bookingData.totalPrice * 100), // Convert to cents
      currency: 'jod',
      hotelId: bookingData.hotelId,
      hotelName: bookingData.hotelName,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      email: bookingData.email,
      name: bookingData.name,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create payment intent');
  }
};

/**
 * Confirm payment using Stripe
 */
export const confirmPayment = async (stripe, clientSecret) => {
  try {
    const result = await stripe.confirmPayment({
      clientSecret,
      confirm: true,
      redirect: 'if_required',
    });
    return result;
  } catch (error) {
    throw new Error(error.message || 'Payment confirmation failed');
  }
};

/**
 * Retrieve payment status
 */
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await api.get(`/payments/${paymentIntentId}`);
    return response.data;
  } catch (_error) {
    throw new Error('Failed to retrieve payment status');
  }
};

/**
 * Cancel a payment
 */
export const cancelPayment = async (paymentIntentId) => {
  try {
    const response = await api.post(`/payments/${paymentIntentId}/cancel`);
    return response.data;
  } catch (_error) {
    throw new Error('Failed to cancel payment');
  }
};

/**
 * Get saved payment methods for user
 */
export const getPaymentMethods = async (email) => {
  try {
    const response = await api.get(`/payments/methods/${email}`);
    return response.data;
  } catch (_error) {
    throw new Error('Failed to retrieve payment methods');
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  cancelPayment,
  getPaymentMethods,
};
