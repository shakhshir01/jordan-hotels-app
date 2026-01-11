import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const WishlistButton = ({ item, className = '' }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isSaved = isInWishlist(item.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(item);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-500/10 ${className}`}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={24}
        className={`transition-colors duration-200 ${
          isSaved
            ? 'fill-red-500 text-red-500'
            : 'text-slate-400 hover:text-red-400'
        }`}
      />
    </button>
  );
};

export default WishlistButton;