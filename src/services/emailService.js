/**
 * Email Service - Uses backend Lambda for sending emails via AWS SES
 * Frontend calls the API, backend handles the actual email sending
 */

import { api } from './api';

export const sendBookingConfirmation = async (bookingData) => {
  try {
    const response = await api.post('/send-booking-email', {
      email: bookingData.email,
      hotelName: bookingData.hotelName,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalPrice: bookingData.totalPrice,
      bookingId: bookingData.bookingId,
      confirmationCode: bookingData.confirmationCode,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send booking confirmation');
  }
};

export const sendPasswordReset = async (email, resetLink) => {
  try {
    const response = await api.post('/send-reset-email', {
      email,
      resetLink,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send reset email');
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await api.post('/send-welcome-email', {
      email,
      name,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send welcome email');
  }
};

export const sendCancellationEmail = async (bookingData) => {
  try {
    const response = await api.post('/send-cancellation-email', {
      email: bookingData.email,
      hotelName: bookingData.hotelName,
      bookingId: bookingData.bookingId,
      refundAmount: bookingData.refundAmount,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send cancellation email');
  }
};
