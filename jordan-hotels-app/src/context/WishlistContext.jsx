import React, { createContext, useContext, useState, useEffect } from 'react';

export const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('visitjo_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded wishlist from localStorage:', parsed.length, 'items');
        
        // Remove duplicates based on id and hotelId
        const unique = parsed.filter((item, index, self) => 
          index === self.findIndex((t) => t.id === item.id || (t.hotelId && t.hotelId === item.hotelId))
        );
        
        console.log('After deduplication:', unique.length, 'items');
        
        setWishlist(unique);
        
        // Save the cleaned version back to localStorage if duplicates were found
        if (unique.length !== parsed.length) {
          console.log('Found and removed', parsed.length - unique.length, 'duplicates');
          localStorage.setItem('visitjo_wishlist', JSON.stringify(unique));
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('visitjo_wishlist', JSON.stringify(wishlist));
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    }
  }, [wishlist, loading]);

  const addToWishlist = (item) => {
    setWishlist((prev) => {
      // Check if item already exists (more robust check)
      const exists = prev.find((w) => w.id === item.id || (w.hotelId && w.hotelId === item.hotelId));
      if (exists) {
        return prev;
      }
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => prev.filter((w) => w.id !== itemId));
  };

  const isInWishlist = (itemId) => {
    return wishlist.some((w) => w.id === itemId);
  };

  const toggleWishlist = (item) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const cleanupDuplicates = () => {
    setWishlist((prev) => {
      const unique = prev.filter((item, index, self) => 
        index === self.findIndex((t) => t.id === item.id || (t.hotelId && t.hotelId === item.hotelId))
      );
      return unique;
    });
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    cleanupDuplicates,
    loading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
