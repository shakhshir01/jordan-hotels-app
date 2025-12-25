import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_GATEWAY_URL || '').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_API_KEY || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
});

// Allow external modules to set auth token (Bearer)
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.Authorization;
  }
};

// Add error interceptor for better error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const dataMessage = error.response?.data?.message || error.response?.data || null;
    const errorMessage = dataMessage || error.message || 'An error occurred';
    console.error('API Error:', { status, message: errorMessage });
    // Provide clearer message for common API Gateway response
    if (status === 403 || errorMessage === 'Missing Authentication Token') {
      return Promise.reject(new Error('API Authentication error: check API key, stage, and authorizer settings.'));
    }
    if (status === 404) {
      return Promise.reject(new Error('Resource not found (404). Verify the URL and resource id.'));
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const hotelAPI = {
  // Get all hotels with optional location filter
  getAllHotels: async (location = '') => {
    try {
      const url = location ? `/hotels?location=${encodeURIComponent(location)}` : '/hotels';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific hotel by ID
  getHotelById: async (id) => {
    try {
      const response = await apiClient.get(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Book a hotel
  bookHotel: async (hotelId, bookingData) => {
    try {
      const response = await apiClient.post(`/hotels/${hotelId}/book`, bookingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Create a checkout session via backend; backend must call Stripe server-side
  createCheckoutSession: async (hotelId, bookingData) => {
    try {
      const response = await apiClient.post(`/payments/create-checkout-session`, { hotelId, ...bookingData });
      return response.data; // expected { sessionId }
    } catch (error) {
      throw error;
    }
  },
  // Image upload: request a signed S3 URL from backend, then upload directly to S3
  getS3UploadUrl: async (filename, contentType = 'image/jpeg') => {
    try {
      const response = await apiClient.post('/uploads/signed-url', { filename, contentType });
      return response.data; // { url, key }
    } catch (error) {
      throw error;
    }
  },

  uploadFileToSignedUrl: async (signedUrl, file) => {
    try {
      const res = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!res.ok) throw new Error('Upload to S3 failed');
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Register uploaded image with backend (attach to hotel)
  registerHotelImage: async (hotelId, imageKey) => {
    try {
      const response = await apiClient.post(`/hotels/${hotelId}/images`, { key: imageKey });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // User endpoints
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserBookings: async () => {
    try {
      const response = await apiClient.get('/user/bookings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
