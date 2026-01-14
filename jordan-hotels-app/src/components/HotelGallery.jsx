import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { staticHotelPrices } from '../data/staticHotelPrices';

const HotelGallery = ({ images = [], hotelName }) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure we have at least some images
  const displayImages = useMemo(() => images.length > 0 ? images : ['/placeholder-hotel.jpg'], [images]);
  const mainImage = displayImages[0];
  const sideImages = displayImages.slice(1, 5);
  const remainingCount = Math.max(0, displayImages.length - 5);

  // Find price for this hotel
  const hotelPriceObj = staticHotelPrices.find(h => h.name === hotelName);

  const openLightbox = useCallback((index) => {
    setCurrentIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto';
  }, []);

  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages]);

  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages]);

  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, prevImage, nextImage, closeLightbox]);

  return (
    <div className="relative">
      {/* Show price below hotel name if available */}
      <div className="mb-2">
        <span className="text-xl font-bold">{hotelName}</span>
        {hotelPriceObj && (
          <span className="ml-4 text-lg text-green-700 font-semibold">
            {hotelPriceObj.price} {hotelPriceObj.currency} / night
          </span>
        )}
      </div>
      {/* Desktop Grid Layout */}
      {sideImages.length === 0 ? (
        <div className="hidden md:block h-[400px] rounded-xl overflow-hidden relative cursor-pointer group" onClick={() => openLightbox(0)}>
          <OptimizedImage 
            src={mainImage} 
            alt={`${hotelName} Main`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={true}
            sizes="(min-width: 768px) 100vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      ) : (
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
          <div 
            className="col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <OptimizedImage 
              src={mainImage} 
              alt={`${hotelName} Main`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              priority={true}
              sizes="(min-width: 768px) 50vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {sideImages.map((img, idx) => (
            <div 
              key={idx} 
              className="relative cursor-pointer group"
              onClick={() => openLightbox(idx + 1)}
            >
              <OptimizedImage 
                src={img} 
                alt={`${hotelName} ${idx + 2}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 768px) 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              
              {/* "View All" Overlay on the last image if there are more */}
              {idx === 3 && remainingCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openLightbox(idx + 1); }}
                  className="absolute inset-0 w-full h-full bg-black/50 flex items-center justify-center text-white font-medium text-lg backdrop-blur-[2px] group-hover:bg-black/60 transition-colors z-10 cursor-pointer"
                >
                  +{remainingCount} Photos
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile Carousel Layout */}
      <div className="md:hidden relative h-[350px] sm:h-[400px] -mx-4 sm:mx-0 overflow-hidden">
        <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {displayImages.map((img, idx) => (
            <div key={idx} className="flex-shrink-0 w-full h-full relative">
              <OptimizedImage 
                src={img} 
                alt={`${hotelName} ${idx + 1}`} 
                className="w-full h-full object-cover"
                priority={idx === 0} // Only prioritize first image
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentIndex + 1} / {displayImages.length}
        </div>
        <button 
          type="button"
          onClick={prevImage}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-3 min-h-[44px] min-w-[44px] bg-white/80 rounded-full shadow-lg z-10 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <button 
          type="button"
          onClick={nextImage}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 min-h-[44px] min-w-[44px] bg-white/80 rounded-full shadow-lg z-10 active:scale-95 transition-transform"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* View All Button (Desktop) */}
      <button
        type="button"
        onClick={() => openLightbox(0)}
        aria-label="View all photos"
        className="hidden md:flex absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg items-center gap-2 hover:bg-gray-50 transition-colors font-medium text-sm min-h-[44px] inline-flex items-center justify-center"
      >
        <Grid className="w-4 h-4" />
        View All Photos
      </button>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
          <button 
            type="button"
            onClick={closeLightbox}
            aria-label="Close photos"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-3 min-h-[44px] min-w-[44px] rounded-full z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <button 
            type="button"
            onClick={prevImage}
            aria-label="Previous photo"
            className="absolute left-4 text-white/80 hover:text-white p-4 hover:bg-white/10 rounded-full transition-colors z-50"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <OptimizedImage 
            src={displayImages[currentIndex]} 
            alt={`${hotelName} Fullscreen`} 
            className="max-h-[90vh] max-w-[90vw] object-cover shadow-2xl"
          />

          <button 
            type="button"
            onClick={nextImage}
            aria-label="Next photo"
            className="absolute right-4 text-white/80 hover:text-white p-4 hover:bg-white/10 rounded-full transition-colors z-50"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 font-medium tracking-wide">
            {currentIndex + 1} of {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelGallery;