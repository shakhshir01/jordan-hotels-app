/**
 * Notification Service
 * Handles email and SMS notifications
 */

import { api } from './api';
import { showSuccess, showError } from './toastService';

/**
 * Email Notification Templates
 */
const emailTemplates = {
  booking_confirmation: {
    subject: 'Booking Confirmation - {{hotelName}}',
    template: 'booking_confirmation',
  },
  booking_reminder: {
    subject: 'Reminder: Your upcoming stay at {{hotelName}}',
    template: 'booking_reminder',
  },
  cancellation: {
    subject: 'Booking Cancelled - {{hotelName}}',
    template: 'cancellation',
  },
  review_request: {
    subject: 'Share your experience at {{hotelName}}',
    template: 'review_request',
  },
  price_drop: {
    subject: '{{hotelName}} - Price dropped!',
    template: 'price_drop',
  },
  special_offer: {
    subject: 'Special offer on {{hotelName}}',
    template: 'special_offer',
  },
};

/**
 * Send Email Notification
 */
export const sendEmailNotification = async (email, templateType, data = {}) => {
  try {
    const template = emailTemplates[templateType];
    if (!template) {
      throw new Error(`Unknown email template: ${templateType}`);
    }

    const response = await api.post('/notifications/email', {
      email,
      templateType,
      templateData: data,
    });

    showSuccess('Notification sent');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to send notification';
    showError(message);
    throw error;
  }
};

/**
 * Send SMS Notification
 */
export const sendSMSNotification = async (phone, message) => {
  try {
    const response = await api.post('/notifications/sms', {
      phone,
      message,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to send SMS';
    showError(message);
    throw error;
  }
};

/**
 * Subscribe to Notifications
 */
export const subscribeToNotifications = async (email, preferences = {}) => {
  try {
    const response = await api.post('/notifications/subscribe', {
      email,
      preferences: {
        bookingConfirmation: preferences.bookingConfirmation !== false,
        priceDrops: preferences.priceDrops !== false,
        promotions: preferences.promotions !== false,
        reviews: preferences.reviews !== false,
        smsNotifications: preferences.smsNotifications !== false,
      },
    });

    showSuccess('Notification preferences updated');
    return response.data;
  } catch (error) {
    showError('Failed to update preferences');
    throw error;
  }
};

/**
 * Unsubscribe from Notifications
 */
export const unsubscribeFromNotifications = async (email) => {
  try {
    const response = await api.post('/notifications/unsubscribe', { email });
    showSuccess('Unsubscribed from notifications');
    return response.data;
  } catch (error) {
    showError('Failed to unsubscribe');
    throw error;
  }
};

/**
 * Get Notification Preferences
 */
export const getNotificationPreferences = async (email) => {
  try {
    const response = await api.get(`/notifications/preferences/${email}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch preferences:', error);
    return null;
  }
};

/**
 * Send Booking Reminder (24 hours before)
 */
export const sendBookingReminder = async (bookingId, email, hotelName, checkInDate) => {
  return sendEmailNotification(email, 'booking_reminder', {
    hotelName,
    checkInDate,
    bookingId,
  });
};

/**
 * Send Price Drop Alert
 */
export const sendPriceDropAlert = async (email, hotelName, oldPrice, newPrice) => {
  return sendEmailNotification(email, 'price_drop', {
    hotelName,
    oldPrice,
    newPrice,
    savings: oldPrice - newPrice,
  });
};

/**
 * Send Review Request
 */
export const sendReviewRequest = async (email, hotelName, bookingId) => {
  return sendEmailNotification(email, 'review_request', {
    hotelName,
    bookingId,
  });
};

export default {
  sendEmailNotification,
  sendSMSNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  getNotificationPreferences,
  sendBookingReminder,
  sendPriceDropAlert,
  sendReviewRequest,
  emailTemplates,
};
