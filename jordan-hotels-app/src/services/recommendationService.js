/**
 * Recommendation Engine
 * Suggests hotels based on user behavior and preferences
 */

import React from 'react';
import { api } from './api';

/**
 * Get Personalized Recommendations
 * Based on user's browsing history, bookings, and wishlist
 */
export const getPersonalizedRecommendations = async (userId, limit = 6) => {
  try {
    const response = await api.get(`/recommendations/personalized/${userId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return [];
  }
};

/**
 * Track Hotel View
 * Records user interactions with hotels for ML-based recommendations
 */
export const trackHotelView = async (hotelId, userId = null, duration = 0) => {
  try {
    // Use session storage if userId not available
    const sessionId = userId || sessionStorage.getItem('sessionId');
    
    const response = await api.post('/analytics/hotel-view', {
      hotelId,
      userId: sessionId,
      viewDuration: duration,
      timestamp: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    console.error('Failed to track hotel view:', error);
  }
};

/**
 * Get Similar Hotels
 * Recommends hotels similar to a viewed/booked hotel
 */
export const getSimilarHotels = async (hotelId, limit = 4) => {
  try {
    const response = await api.get(`/recommendations/similar/${hotelId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch similar hotels:', error);
    return [];
  }
};

/**
 * Get Trending Hotels
 * Returns hotels with high booking activity in selected period
 */
export const getTrendingHotels = async (period = 'week', limit = 6) => {
  try {
    const response = await api.get(`/recommendations/trending?period=${period}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch trending hotels:', error);
    return [];
  }
};

/**
 * Get Best Rated Hotels
 * Returns highest-rated hotels within optional filters
 */
export const getBestRatedHotels = async (filters = {}, limit = 6) => {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      minRating: String(filters.minRating || 4.0),
      destination: String(filters.destination || ''),
      maxPrice: String(filters.maxPrice || ''),
    });

    const response = await api.get(`/recommendations/best-rated?${params}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch best-rated hotels:', error);
    return [];
  }
};

/**
 * Get Budget-Friendly Recommendations
 * Recommends hotels in lower price ranges
 */
export const getBudgetRecommendations = async (maxPrice, destination = '', limit = 6) => {
  try {
    const response = await api.get(
      `/recommendations/budget?maxPrice=${maxPrice}&destination=${destination}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch budget recommendations:', error);
    return [];
  }
};

/**
 * Get Luxury Recommendations
 * Recommends premium/luxury hotels
 */
export const getLuxuryRecommendations = async (minPrice = 200, limit = 6) => {
  try {
    const response = await api.get(`/recommendations/luxury?minPrice=${minPrice}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch luxury recommendations:', error);
    return [];
  }
};

/**
 * Recommendation Engine Hook
 * Usage: const recommendations = useRecommendations(userId, hotelId);
 */
export const useRecommendations = (userId, currentHotelId = null) => {
  const [recommendations, setRecommendations] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let results;

        if (currentHotelId) {
          // If viewing a hotel, get similar hotels
          results = await getSimilarHotels(currentHotelId);
        } else if (userId) {
          // Get personalized recommendations
          results = await getPersonalizedRecommendations(userId);
        } else {
          // Get trending hotels as fallback
          results = await getTrendingHotels();
        }

        setRecommendations(results);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, currentHotelId]);

  return { recommendations, loading, error };
};

/**
 * Recommendation Strategy Interface
 * Allows different recommendation algorithms
 */
export const recommendationStrategies = {
  collaborative: async (userId) => {
    // User-to-user similarity
    return getPersonalizedRecommendations(userId);
  },

  contentBased: async (hotelId) => {
    // Hotel-to-hotel similarity (amenities, location, price)
    return getSimilarHotels(hotelId);
  },

  popularity: async () => {
    // Most booked/viewed hotels
    return getTrendingHotels();
  },

  rating: async (minRating = 4.0) => {
    // Top-rated hotels
    return getBestRatedHotels({ minRating });
  },

  hybrid: async (userId, hotelId) => {
    // Combination of multiple strategies
    const [personalized, similar, trending] = await Promise.all([
      getPersonalizedRecommendations(userId, 2),
      getSimilarHotels(hotelId, 2),
      getTrendingHotels('week', 2),
    ]);

    return [...personalized, ...similar, ...trending];
  },
};

/**
 * Get Recommended Hotels by Strategy
 */
export const getRecommendationsByStrategy = async (strategy = 'hybrid', params = {}) => {
  try {
    if (!recommendationStrategies[strategy]) {
      throw new Error(`Unknown recommendation strategy: ${strategy}`);
    }

    return await recommendationStrategies[strategy](params);
  } catch (error) {
    console.error(`Failed to get ${strategy} recommendations:`, error);
    return [];
  }
};

export default {
  getPersonalizedRecommendations,
  trackHotelView,
  getSimilarHotels,
  getTrendingHotels,
  getBestRatedHotels,
  getBudgetRecommendations,
  getLuxuryRecommendations,
  getRecommendationsByStrategy,
  recommendationStrategies,
  useRecommendations,
};
