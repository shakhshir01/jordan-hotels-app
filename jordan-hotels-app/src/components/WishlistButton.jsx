import React from 'react';
import { Heart } from 'lucide-react';
import { showSuccess } from '../services/toastService';
import { useWishlist } from '../context/WishlistContext';

export const WishlistButton = ({ item, className = '' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(item.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWishlist(item);
    showSuccess(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all ${
        inWishlist
          ? 'bg-red-500 text-white shadow-lg'
          : 'bg-white text-red-500 hover:bg-red-50 border border-red-200'
      } ${className}`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={20}
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
      />
    </button>
  );
};

export default WishlistButton;
