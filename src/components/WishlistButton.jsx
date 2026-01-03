import React from 'react';
import { Heart } from 'lucide-react';
import { showSuccess, showError } from '../services/toastService';

export const WishlistButton = ({ hotelId, isInWishlist, onAdd, onRemove }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      onRemove(hotelId);
      showSuccess('Removed from wishlist');
    } else {
      onAdd(hotelId);
      showSuccess('Added to wishlist');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all ${
        isInWishlist
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={20}
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
    </button>
  );
};

export default WishlistButton;
