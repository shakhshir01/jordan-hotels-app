import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { getHotelDisplayName } from "../utils/hotelLocalization";
import OptimizedImage from "../components/OptimizedImage";
import { formatPrice } from "../utils/hotelPricing";
import { Link } from "react-router-dom";
import { MapPin, Star, Eye, Wifi, Car, Utensils } from "lucide-react";

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,.9)" font-family="Arial" font-size="32" text-anchor="middle" dominant-baseline="middle">VISIT-JO Hotel</text>
  </svg>`);

/** @param {{hotel:any,i18nLanguage?:string,viewLabel?:string,preferences:any}} props */
const HotelCard = React.memo(function HotelCard(props = {}) {
  const { hotel, i18nLanguage, viewLabel, preferences } = /** @type {{hotel:any,i18nLanguage?:string,viewLabel?:string,preferences:any}} */ (props);
  const hotelName = React.useMemo(
    () => getHotelDisplayName(hotel, i18nLanguage),
    [hotel, i18nLanguage]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = `/hotels/${hotel.id}`;
    }
  };

  return (
    <article
      className="group relative card-modern overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 focus:outline-none focus:ring-4 focus:ring-jordan-blue/30 focus:shadow-2xl focus:-translate-y-1 touch-manipulation active:scale-[0.98] active:transition-transform active:duration-75"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${hotelName}`}
      onKeyDown={handleKeyDown}
      onClick={() => window.location.href = `/hotels/${hotel.id}`}
    >
      {/* Enhanced Image Container - Optimized for mobile */}
      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[3/2]">
        <OptimizedImage
          src={hotel.image || FALLBACK_IMG}
          alt={hotelName}
          width={400}
          height={300}
          quality={85}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 sm:duration-700 group-hover:scale-105 sm:group-hover:scale-110"
        />

        {/* Enhanced Overlay - Reduced motion on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:duration-500" />

        {/* Enhanced Badges - Better mobile sizing */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
          {hotel.rating >= 4.5 && (
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg animate-pulse-glow backdrop-blur-sm border border-white/20">
              🔥 Popular
            </div>
          )}
          {hotel.price < 50 && (
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg backdrop-blur-sm border border-white/20">
              💰 Best Deal
            </div>
          )}
        </div>

        {/* Enhanced Rating Badge - Optimized positioning */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2 bg-black/50 text-white text-xs sm:text-sm font-semibold rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 backdrop-blur-sm shadow-md border border-white/10" aria-hidden="true">
          <Star size={12} className="text-amber-400 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
          <span className="ml-1">{hotel.rating}</span>
        </div>
        <span className="sr-only">Rating: {hotel.rating} out of 5</span>

        {/* Preview Action Button - Always visible on mobile */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <a
            href={`/hotels/${hotel.id}#photos`}
            aria-label={`Preview photos for ${hotelName}`}
            className="inline-flex items-center justify-center bg-white/95 backdrop-blur-xl rounded-full p-2.5 sm:p-3 shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-jordan-blue/30 transition-transform duration-200 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px]"
          >
            <Eye size={16} className="text-slate-900 sm:w-4.5 sm:h-4.5" />
          </a>
        </div>
      </div>

      {/* Enhanced Content - Optimized for mobile */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Title and Location - Better mobile spacing */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1.5 sm:mb-2 leading-tight line-clamp-2 group-hover:text-jordan-blue dark:group-hover:text-jordan-blue transition-colors duration-300">
            {hotelName}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-300">
            <MapPin size={16} className="text-jordan-rose flex-shrink-0 sm:w-4.5 sm:h-4.5" />
            <span className="font-medium truncate text-xs sm:text-sm lg:text-base">{hotel.location}</span>
          </div>
        </div>

        {/* Enhanced Amenities - Better mobile layout */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
          <div
            role="img"
            aria-label="WiFi available"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-jordan-blue/10 hover:text-jordan-blue transition-all duration-300 cursor-default backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px]"
          >
            <Wifi size={14} className="sm:w-4.5 sm:h-4.5" aria-hidden="true" />
            <span className="sr-only">WiFi available</span>
            <span className="hidden sm:inline font-medium">WiFi</span>
          </div>
          <div
            role="img"
            aria-label="Parking available"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-300 cursor-default backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px]"
          >
            <Car size={14} className="sm:w-4.5 sm:h-4.5" aria-hidden="true" />
            <span className="sr-only">Parking available</span>
            <span className="hidden sm:inline font-medium">Parking</span>
          </div>
          <div
            role="img"
            aria-label="Restaurant on site"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all duration-300 cursor-default backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px]"
          >
            <Utensils size={14} className="sm:w-4.5 sm:h-4.5" aria-hidden="true" />
            <span className="sr-only">Restaurant on site</span>
            <span className="hidden sm:inline font-medium">Restaurant</span>
          </div>
        </div>

        {/* Enhanced Price and CTA - Better mobile layout */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200/50 dark:border-slate-600/50">
          <div className="flex-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 mb-0.5 sm:mb-1">
              From <span className="gradient-text">{formatPrice(hotel.price, preferences.currency)}</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">per night • Free cancellation</div>
          </div>
          <Link
            to={`/hotels/${hotel.id}`}
            className="group/btn inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-jordan-blue to-jordan-teal hover:from-jordan-teal hover:to-jordan-blue text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] sm:min-h-[56px] w-full sm:w-auto text-sm sm:text-base"
          >
            <Eye size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span>{viewLabel}</span>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
});

const HotelsVirtualizedGrid = function HotelsVirtualizedGrid({
  hotels,
  viewLabel,
  i18nLanguage,
  preferences,
}) {
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  });

  useEffect(() => {
    const onResize = () => {
      const newColumns = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
      setColumns(newColumns);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [scrollMargin, setScrollMargin] = useState(0);

  const parentRef = useRef(null);
  const parentRefCallback = useCallback((node) => {
    parentRef.current = node;
    if (node) {
      // Defer updating state to avoid synchronous flush during commit phase
      // which can trigger React's "flushSync called inside a lifecycle" warning.
      setTimeout(() => {
        setScrollMargin(node.offsetTop ?? 0);
      }, 0);
    } else {
      setTimeout(() => setScrollMargin(0), 0);
    }
  }, []);

  const rows = Math.ceil(hotels.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows,
    estimateSize: () => 380,
    overscan: 6,
    scrollMargin,
    useFlushSync: false,
  });

  const items = rowVirtualizer.getVirtualItems();

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
    <div ref={parentRefCallback}>
      <div className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {items.map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const startIndex = rowIndex * columns;
          const rowHotels = hotels.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              data-index={rowIndex}
              ref={(el) => measureElement(el)}
              className="absolute left-0 top-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {rowHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    {.../** @type {any} */ ({ hotel, i18nLanguage, viewLabel, preferences })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelsVirtualizedGrid;