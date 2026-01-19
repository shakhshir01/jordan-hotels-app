import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Camera, MapPin, Star, Eye, Sparkles, Heart, ArrowRight, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import hotelsService from '../services/hotelsService';
import { hotelAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';
import OptimizedImage from '../components/OptimizedImage';
import Seo from '../components/Seo.jsx';

const GallerySkeleton = () => {
  const skeletonCards = Array.from({ length: 3 });
  const skeletonImages = Array.from({ length: 8 });

  return (
    <div className="space-y-20" aria-label="Loading gallery" aria-busy="true">
      {skeletonCards.map((_, cardIndex) => (
        <div key={cardIndex} className="card-modern animate-pulse overflow-hidden">
          <div className="bg-gradient-to-r from-jordan-blue to-jordan-teal text-white p-8">
            <div className="h-8 w-1/2 bg-white/20 rounded animate-pulse mb-4" />
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-6">
                <div className="h-5 w-28 bg-white/20 rounded animate-pulse" />
                <div className="h-5 w-28 bg-white/20 rounded animate-pulse" />
                <div className="h-5 w-20 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="h-10 w-28 bg-white/30 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="p-8">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {skeletonImages.map((_, imageIndex) => (
                <div key={imageIndex} className="rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-56 bg-slate-200 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-300/60 animate-pulse" />
                  </div>
                  <div className="bg-slate-50 p-2 text-center">
                    <div className="h-4 w-20 mx-auto bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Gallery() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const { i18n } = useTranslation();

  const nextImage = (hotelId, imagesLength) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [hotelId]: ((prev[hotelId] || 0) + 1) % imagesLength
    }));
  };

  const prevImage = (hotelId, imagesLength) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [hotelId]: prev[hotelId] === 0 ? imagesLength - 1 : (prev[hotelId] || 0) - 1
    }));
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Handle scroll event to show/hide scroll buttons
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollButtons(scrollTop > 300); // Show buttons after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadHotels = async () => {
      // Gallery can be huge; fetch a capped page for fast render.
      try {
        const page = await hotelAPI.getHotelsPage({ limit: 60 });
        const data = Array.isArray(page?.hotels) ? page.hotels : [];
        setHotels(data);
      } catch {
        const data = await hotelsService.getHotelsSample({ limit: 60 });
        setHotels(Array.isArray(data) ? data.slice(0, 60) : []);
      } finally {
        setLoading(false);
      }
    };
    loadHotels();
  }, []);

  // Virtualization setup
  const rowVirtualizer = useWindowVirtualizer({
    count: hotels.length,
    estimateSize: () => 600, // Estimated height per hotel card
    overscan: 3, // Render 3 extra items outside visible area
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Callback ref to measure elements without triggering flushSync warning
  const measureElement = useCallback((element) => {
    if (element) {
      // Schedule measurement in next microtask to avoid flushSync during render
      queueMicrotask(() => {
        rowVirtualizer.measureElement(element);
      });
    }
  }, [rowVirtualizer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Jordan Hotel Gallery - Visual Tour of Luxury Accommodations | VisitJo"
        description="Explore stunning visual galleries of Jordan's finest hotels. From Petra luxury resorts to Dead Sea spas, see what your stay will look like before you book."
        canonicalUrl="https://vist-jo.com/gallery"
        keywords="Jordan hotel gallery, hotel photos, luxury accommodations Jordan, Petra hotels, Dead Sea resorts, Wadi Rum camps"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Animated Mesh Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-jordan-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-jordan-rose/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-jordan-teal/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-16 w-6 h-6 bg-white/20 rotate-45 animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-32 right-20 w-8 h-8 bg-jordan-gold/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-24 left-24 w-5 h-5 bg-jordan-rose/25 rotate-12 animate-float" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute bottom-32 right-32 w-7 h-7 bg-jordan-teal/20 rounded-full animate-float" style={{ animationDelay: '3.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-3 px-8 py-4 mb-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white/90 text-sm font-bold uppercase tracking-widest shadow-2xl animate-fade-in">
            <Camera className="w-5 h-5 text-jordan-gold" />
            Visual Gallery
            <Camera className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">Visualizing Your</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              Jordan Stay
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            Take a visual journey through our handpicked hotels and resorts across Jordan. See exactly what your luxury experience will look like.
          </p>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Gallery Content */}
      <div className="relative -mt-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
          {loading ? (
            <div className="animate-fade-in-up">
              <GallerySkeleton />
            </div>
          ) : (
            <div
              className="relative animate-fade-in-up mt-24"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {virtualItems.map((virtualItem) => {
                const hotel = hotels[virtualItem.index];
                const hotelName = getHotelDisplayName(hotel, i18n.language);

                return (
                  <div
                    key={hotel.id}
                    className="absolute left-0 top-0 w-full space-y-20"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    ref={(el) => measureElement(el)}
                    data-index={virtualItem.index}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                      {/* Enhanced Hotel Header */}
                      <div className="bg-gradient-to-r from-jordan-blue via-jordan-teal to-jordan-emerald text-white p-10 lg:p-12">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <h2 className="text-3xl lg:text-4xl font-black mb-3 leading-tight">{hotelName}</h2>
                            <div className="flex flex-wrap items-center gap-6 text-white/90">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-jordan-gold" />
                                <span className="font-medium">{hotel.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-jordan-gold fill-current" />
                                <span className="font-medium">{hotel.rating} Rating</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-jordan-gold" />
                                <span className="font-medium">From {hotel.price} JOD/night</span>
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/hotels/${hotel.id}`}
                            aria-label={`View details for ${hotelName}`}
                            className="btn-primary px-6 py-3 text-lg font-bold rounded-2xl hover-lift group-hover:scale-105 transition-all duration-300 min-h-[48px] inline-flex items-center justify-center"
                          >
                            View Details
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Link>
                        </div>
                      </div>

                      {/* Enhanced Images Grid */}
                      <div className="p-10 lg:p-12">
                        <div className="flex items-center gap-3 mb-8">
                          <Eye className="w-6 h-6 text-jordan-blue" />
                          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Gallery Images</h3>
                          <span className="px-3 py-1 bg-gradient-to-r from-jordan-teal/20 to-jordan-blue/20 text-jordan-teal font-semibold text-sm rounded-full">
                            {hotel.images?.length || 0} Photos
                          </span>
                        </div>

                        {hotel.images && hotel.images.length > 0 ? (
                          <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
                              <div className="relative bg-slate-200 overflow-hidden aspect-[16/9]">
                                <OptimizedImage
                                  src={hotel.images[currentImageIndices[hotel.id] || 0]}
                                  alt={`${hotelName} - Image ${(currentImageIndices[hotel.id] || 0) + 1}`}
                                  className="w-full h-full object-cover"
                                  sizes="100vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-3 left-3 right-3">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-center text-sm font-semibold text-slate-900">
                                    Image {(currentImageIndices[hotel.id] || 0) + 1} of {hotel.images.length}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {hotel.images.length > 1 && (
                              <>
                                <button
                                  onClick={() => prevImage(hotel.id, hotel.images.length)}
                                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                                  aria-label="Previous image"
                                >
                                  <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                  onClick={() => nextImage(hotel.id, hotel.images.length)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                                  aria-label="Next image"
                                >
                                  <ChevronRight className="w-6 h-6" />
                                </button>
                              </>
                            )}
                            <div className="flex justify-center mt-4 space-x-2">
                              {hotel.images.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentImageIndices(prev => ({ ...prev, [hotel.id]: idx }))}
                                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    (currentImageIndices[hotel.id] || 0) === idx
                                      ? 'bg-jordan-gold scale-125'
                                      : 'bg-slate-300 hover:bg-slate-400'
                                  }`}
                                  aria-label={`Go to image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">No Images Available</h4>
                            <p className="text-slate-500 dark:text-slate-500">
                              We're working on adding more photos for this beautiful property
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll Buttons */}
      {showScrollButtons && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button
            onClick={scrollToTop}
            className="bg-gradient-to-r from-jordan-blue to-jordan-teal hover:from-jordan-blue/80 hover:to-jordan-teal/80 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={scrollToBottom}
            className="bg-gradient-to-r from-jordan-rose to-jordan-gold hover:from-jordan-rose/80 hover:to-jordan-gold/80 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
