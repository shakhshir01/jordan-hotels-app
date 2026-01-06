/**
 * Analytics Service
 * Tracks user behavior and events
 * Can be connected to Google Analytics, Mixpanel, or other services
 */

export const trackEvent = (eventName, eventData = {}) => {
  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Event: ${eventName}`, eventData);
    }

    // Could be extended for custom analytics service
    logToCustomAnalytics(eventName, eventData);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackPageView = (pageName, pageUrl) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_path: pageUrl,
  });
};

export const trackSearch = (query, filters = {}) => {
  trackEvent('search', {
    search_term: query,
    filters: JSON.stringify(filters),
  });
};

export const trackHotelView = (hotelId, hotelName) => {
  trackEvent('view_item', {
    items: [{
      item_id: hotelId,
      item_name: hotelName,
      item_category: 'hotel',
    }],
  });
};

export const trackBookingStart = (hotelId, hotelName, price) => {
  trackEvent('begin_checkout', {
    items: [{
      item_id: hotelId,
      item_name: hotelName,
      price: price,
    }],
  });
};

export const trackBookingComplete = (bookingId, totalValue, hotelName) => {
  trackEvent('purchase', {
    transaction_id: bookingId,
    value: totalValue,
    currency: 'JOD',
    items: [{
      item_name: hotelName,
      item_category: 'hotel',
      price: totalValue,
    }],
  });
};

export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', {
    method: method,
  });
};

export const trackLogin = (method = 'email') => {
  trackEvent('login', {
    method: method,
  });
};

export const trackAddToWishlist = (hotelId, hotelName, price) => {
  trackEvent('add_to_wishlist', {
    items: [{
      item_id: hotelId,
      item_name: hotelName,
      price: price,
    }],
  });
};

export const trackError = (errorMessage, errorCode) => {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    error_code: errorCode,
  });
};

// Custom analytics logging (for future integration)
const logToCustomAnalytics = (eventName, eventData) => {
  // This would connect to your custom analytics backend
  // Example: API call to /analytics endpoint
};

export default {
  trackEvent,
  trackPageView,
  trackSearch,
  trackHotelView,
  trackBookingStart,
  trackBookingComplete,
  trackSignUp,
  trackLogin,
  trackAddToWishlist,
  trackError,
};
