import { useState, useEffect, useCallback } from 'react';

const WISHLIST_KEY = 'visitjo_wishlist';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem(WISHLIST_KEY);
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = useCallback((hotel) => {
    setWishlist(prev => {
      const exists = prev.find(h => h.id === hotel.id);
      if (exists) return prev;
      return [...prev, { ...hotel, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((hotelId) => {
    setWishlist(prev => prev.filter(h => h.id !== hotelId));
  }, []);

  const isInWishlist = useCallback((hotelId) => {
    return wishlist.some(h => h.id === hotelId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loading,
    count: wishlist.length,
  };
};

export default useWishlist;
