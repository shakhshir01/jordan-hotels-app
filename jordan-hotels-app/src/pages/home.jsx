import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, Star, AlertCircle, Loader2, Eye, Wifi, Car, Utensils, Filter, X, SlidersHorizontal } from "lucide-react";
import { hotelAPI } from "../services/api";
import { useTranslation } from "react-i18next";
import { getHotelDisplayName } from "../utils/hotelLocalization";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import hotelsService from "../services/hotelsService";
import { haversineKm } from "../utils/geo";
import OptimizedImage from "../components/OptimizedImage";
import { usePreferences } from "../context/PreferencesContext";
import { formatPrice } from "../utils/hotelPricing";
import { useDebounce } from "../hooks/useDebounce";

const JORDAN_PLACES = [
  { name: "Amman", lat: 31.9539, lon: 35.9106 },
  { name: "Aqaba", lat: 29.5319, lon: 35.0061 },
  { name: "Petra", lat: 30.3285, lon: 35.4444 },
  { name: "Wadi Rum", lat: 29.5764, lon: 35.4195 },
  { name: "Dead Sea", lat: 31.7191, lon: 35.5744 },
  { name: "Jerash", lat: 32.2769, lon: 35.896 },
  { name: "Madaba", lat: 31.715, lon: 35.7939 },
];

const getNearestJordanPlace = ({ lat, lon }) => {
  let best = JORDAN_PLACES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const p of JORDAN_PLACES) {
    const d = haversineKm(lat, lon, p.lat, p.lon);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
};

const HotelCardSkeleton = () => (
  <div className="card-modern animate-pulse overflow-hidden">
    <div className="cover bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 aspect-[16/10]"></div>
    <div className="p-4 sm:p-5 lg:p-6">
      <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl mb-3"></div>
      <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg mb-4 w-3/4"></div>
      <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-600">
        <div>
          <div className="h-7 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg mb-2"></div>
          <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded w-1/2"></div>
        </div>
        <div className="h-11 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl w-24"></div>
      </div>
    </div>
  </div>
);

const getUserRecommendedHotels = async () => {
  // Get user location
  const geo = await new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 5 * 60 * 1000 }
    );
  });

  if (!geo) {
    // No location available, fall back to featured/best hotels
    try {
      const featured = await hotelsService.getFeaturedHotels();
      if (featured && featured.length > 0) {
        return { hotels: featured.slice(0, 12), isLocationBased: false };
      }
      const page = await hotelAPI.getHotelsPage({ limit: 12 });
      const hotels = Array.isArray(page?.hotels) ? page.hotels : [];
      return { hotels: hotels.slice(0, 12), isLocationBased: false };
    } catch {
      return { hotels: [], isLocationBased: false };
    }
  }

  try {
    // Increase nearby results so desktop shows more recommendations
    const nearby = await hotelsService.getNearbyHotelsByGeo({
      lat: geo.lat,
      lon: geo.lon,
      limit: 12,
      // Slightly wider radius to avoid extra paging.
      targetKm: 30,
      // Keep this light; the API can be slow/unavailable.
      pageLimit: 120,
      maxPages: 3,
    });

    if (Array.isArray(nearby) && nearby.length > 0) return { hotels: nearby, isLocationBased: true };

    // Fallback if geo exists but we couldn't compute distances (missing geo on hotels).
    const place = getNearestJordanPlace(geo);
    const page = await hotelAPI.getHotelsPage({ limit: 72 });
    const hotels = Array.isArray(page?.hotels) ? page.hotels : [];
    const sorted = [...hotels].sort((a, b) => {
      const aLoc = String(a?.location || a?.destination || "").toLowerCase();
      const bLoc = String(b?.location || b?.destination || "").toLowerCase();
      const aBoost = aLoc.includes(place.name.toLowerCase()) ? 1 : 0;
      const bBoost = bLoc.includes(place.name.toLowerCase()) ? 1 : 0;
      if (bBoost !== aBoost) return bBoost - aBoost;
      return (b?.rating || 0) - (a?.rating || 0);
    });
    return { hotels: sorted.slice(0, 12), isLocationBased: true };
  } catch {
    // If geo-based recommendations fail (timeouts, API down), show a small first page instead.
    // Fall through to best hotels
    try {
      const featured = await hotelsService.getFeaturedHotels();
      if (featured && featured.length > 0) {
        return { hotels: featured.slice(0, 12), isLocationBased: false };
      }

      const page = await hotelAPI.getHotelsPage({ limit: 12 });
      const hotels = Array.isArray(page?.hotels) ? page.hotels : [];
      return { hotels: hotels.slice(0, 12), isLocationBased: false };
    } catch {
      return { hotels: [], isLocationBased: false };
    }
  }
};

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,.9)" font-family="Arial" font-size="32" text-anchor="middle" dominant-baseline="middle">VisitJo Hotel</text>
  </svg>`);

const getColumnsForWidth = (width) => {
  if (typeof width !== "number") return 1;
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
};

const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 1;
    return getColumnsForWidth(window.innerWidth);
  });

  useEffect(() => {
    const onResize = () => setColumns(getColumnsForWidth(window.innerWidth));
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return columns;
};

/** @param {{hotel:any,i18nLanguage?:string,viewLabel?:string,preferences:any}} props */
const HotelCard = React.memo(function HotelCard(props = {}) {
  const { hotel, i18nLanguage, viewLabel, preferences } = /** @type {{hotel:any,i18nLanguage?:string,viewLabel?:string,preferences:any}} */ (props);
  const hotelName = useMemo(
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
      className="group relative card-modern overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 focus:outline-none focus:ring-4 focus:ring-jordan-blue/30 focus:shadow-2xl focus:-translate-y-1 touch-manipulation"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${hotelName}`}
      onKeyDown={handleKeyDown}
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
  const columns = useResponsiveColumns();
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

function Home() {
  const { t, i18n } = useTranslation();
  const { preferences } = usePreferences();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationBased, setIsLocationBased] = useState(false);

  // Debounce search query to avoid excessive API calls
  // const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  // Removed smokingFilter state
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const viewLabel = useMemo(() => t("common.view"), [t]);
  const noResultsLabel = useMemo(() => t("hotels.noResults"), [t]);

  const fetchHotels = useCallback(
    async (location = "") => {
      setLoading(true);
      setError("");
      try {
        // Home should not load the entire Jordan dataset by default.
        // If user is searching, use /search (hotelAPI.getAllHotels(location) routes to search).
        if (location && String(location).trim()) {
          const data = await hotelAPI.getAllHotels(location);
          const hotelsArray = Array.isArray(data) ? data : [];
          setHotels(hotelsArray);
          setIsLocationBased(false);
          if (hotelsArray.length === 0) setError(noResultsLabel);
        } else {
          const { hotels: recHotels, isLocationBased: locBased } = await getUserRecommendedHotels();
          setHotels(recHotels);
          setIsLocationBased(locBased);
          if (recHotels.length === 0) setError(noResultsLabel);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || t("messages.tryAgain"));
        setHotels([]);
      } finally {
        setLoading(false);
      }
    },
    [noResultsLabel, t]
  );

  useEffect(() => {
    // Defer fetch until after first paint to help LCP.
    const id = setTimeout(() => fetchHotels(), 0);
    return () => clearTimeout(id);
  }, [fetchHotels]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefetch = () => {
      import("./SearchResults.jsx").catch(() => {
        // ignore (prefetch best-effort)
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 800);
    }
  }, []);

  const handleSearch = () => {
    const q = String(searchQuery || "").trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      return;
    }
    fetchHotels();
  };

  // Filter and sort hotels
  const filteredAndSortedHotels = useMemo(() => {
    let filtered = hotels.filter(hotel => {
      const price = hotel.price || 0;
      const rating = hotel.rating || 0;
      // Price filter
      if (price < priceRange[0] || price > priceRange[1]) return false;
      // Rating filter
      if (rating < minRating) return false;
      return true;
    });

    // Always sort by selected sortBy, regardless of location-based recommendations
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "recommended":
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [hotels, priceRange, minRating, sortBy]);

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setMinRating(0);
    setSelectedAmenities([]);
    setSortBy("recommended");
  };

  return (
    <div>
      <Helmet>
        <title>VisitJo | Discover Jordan's Best Hotels & Experiences</title>
        <meta name="description" content="Book authentic hotels, explore ancient wonders, and create unforgettable memories in Jordan. From Petra to Wadi Rum, your adventure starts here." />
        <meta property="og:title" content="VisitJo | Discover Jordan's Best Hotels & Experiences" />
        <meta property="og:description" content="Book authentic hotels, explore ancient wonders, and create unforgettable memories in Jordan. From Petra to Wadi Rum, your adventure starts here." />
        <meta property="og:image" content="https://visitjo.com/og-image.jpg" />
        <meta property="og:url" content="https://visitjo.com/" />
        <link rel="canonical" href="https://visitjo.com/" />
      </Helmet>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Premium Multi-layered Background */}
        <div className="absolute inset-0 bg-hero-luxury animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-jordan-blue/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>

        {/* Enhanced Animated Mesh Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-white/8 to-jordan-gold/6 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-jordan-rose/12 to-jordan-gold/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-jordan-teal/10 to-jordan-emerald/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-jordan-purple/8 to-jordan-blue/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-56 h-56 bg-gradient-to-r from-jordan-emerald/7 to-jordan-teal/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-jordan-sand/6 to-jordan-gold/4 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }}></div>
        </div>

        {/* Premium Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-16 w-6 h-6 bg-gradient-to-r from-white/25 to-jordan-gold/20 rotate-45 animate-float shadow-lg" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-32 right-20 w-8 h-8 bg-gradient-to-r from-jordan-gold/35 to-jordan-rose/25 rounded-full animate-float shadow-lg" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-24 left-24 w-5 h-5 bg-gradient-to-r from-jordan-rose/30 to-jordan-teal/20 rotate-12 animate-float shadow-lg" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute bottom-32 right-32 w-7 h-7 bg-gradient-to-r from-jordan-teal/25 to-jordan-emerald/20 rounded-full animate-float shadow-lg" style={{ animationDelay: '3.5s' }}></div>
          <div className="absolute top-24 right-1/4 w-6 h-6 bg-gradient-to-r from-jordan-emerald/35 to-jordan-purple/25 rotate-12 animate-float shadow-lg" style={{ animationDelay: '4.5s' }}></div>
          <div className="absolute bottom-16 left-1/4 w-7 h-7 bg-gradient-to-r from-jordan-purple/30 to-jordan-blue/20 rounded-full animate-float shadow-lg" style={{ animationDelay: '1.2s' }}></div>

          {/* Additional premium shapes */}
          <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-gradient-to-r from-jordan-sand/25 to-jordan-gold/20 rotate-45 animate-float shadow-md" style={{ animationDelay: '3.2s' }}></div>
          <div className="absolute bottom-1/2 left-1/5 w-5 h-5 bg-gradient-to-r from-jordan-coral/30 to-jordan-rose/20 rounded-full animate-float shadow-md" style={{ animationDelay: '2.8s' }}></div>
        </div>

        {/* Enhanced Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gradient-to-r from-white/50 to-jordan-gold/40 rounded-full animate-pulse-glow shadow-lg" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-gradient-to-r from-jordan-gold/70 to-jordan-rose/50 rounded-full animate-pulse-glow shadow-lg" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-gradient-to-r from-jordan-rose/60 to-jordan-teal/40 rounded-full animate-pulse-glow shadow-lg" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-gradient-to-r from-jordan-teal/50 to-jordan-emerald/30 rounded-full animate-pulse-glow shadow-lg" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-2/3 right-1/5 w-1.5 h-1.5 bg-gradient-to-r from-jordan-emerald/60 to-jordan-purple/40 rounded-full animate-pulse-glow shadow-md" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-2/3 left-2/3 w-1.5 h-1.5 bg-gradient-to-r from-jordan-purple/50 to-jordan-blue/30 rounded-full animate-pulse-glow shadow-md" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Subtle Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Premium Badge with Enhanced Styling */}
          <div className="inline-flex items-center gap-3 px-8 py-4 mb-10 bg-card-premium backdrop-blur-2xl border border-white/30 rounded-full text-white/95 text-sm font-bold uppercase tracking-widest shadow-premium animate-fade-in-up">
            <div className="w-3 h-3 bg-gradient-to-r from-jordan-gold to-jordan-rose rounded-full animate-pulse-glow shadow-lg"></div>
            <span className="text-gradient bg-gradient-to-r from-jordan-gold via-white to-jordan-rose bg-clip-text text-transparent">
              {t("home.hero.kicker", "Award-Winning Jordan Experiences")}
            </span>
            <div className="w-3 h-3 bg-gradient-to-r from-jordan-rose to-jordan-gold rounded-full animate-pulse-glow shadow-lg"></div>
          </div>

          {/* Premium Title with Enhanced Typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display mb-8 sm:mb-10 tracking-tight leading-tight animate-slide-up-fast px-2 sm:px-0">
            <span className="block text-white drop-shadow-2xl mb-2 sm:mb-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              {t("home.hero.titleMain", "Discover Jordan's")}
            </span>
            <span className="block text-transparent bg-clip-text bg-text-gradient bg-400% animate-gradient-flow drop-shadow-2xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight font-extrabold">
              {t("home.hero.titleAccent", "Hidden Treasures")}
            </span>
          </h1>

          {/* Premium Subtitle with Better Spacing and Typography */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-5xl mx-auto mb-10 sm:mb-14 text-white/90 leading-relaxed font-light animate-fade-in-up drop-shadow-lg px-4 sm:px-0" style={{ animationDelay: '0.2s' }}>
            {t("home.hero.subtitle", "From the ancient wonders of Petra to the healing waters of the Dead Sea, unlock unforgettable adventures with our handpicked collection of luxury hotels and authentic experiences. Your dream Jordan vacation starts here.")}
          </p>

          {/* Premium Search Bar with Enhanced Styling */}
          <div className="max-w-7xl mx-auto mb-10 sm:mb-16 animate-slide-up-slow px-4 sm:px-0" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col gap-4 sm:gap-5 bg-card-premium backdrop-blur-2xl border border-white/30 rounded-3xl p-4 sm:p-3 shadow-premium hover:shadow-floating transition-all duration-500">
              {/* Premium Search Input */}
              <div className="relative">
                <input
                  className="w-full px-6 sm:px-8 py-7 sm:py-8 bg-transparent text-white placeholder-white/60 outline-none text-xl sm:text-2xl md:text-3xl rounded-2xl border-0 focus:ring-2 focus:ring-white/40 transition-all duration-500 min-h-[70px] sm:min-h-[80px] font-light"
                  placeholder={t("home.hero.searchPlaceholder", "Search for luxury hotels in Petra, Wadi Rum, Dead Sea...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Search size={24} className="text-white/50" />
                </div>
              </div>

              {/* Premium Mobile Sort Controls */}
              <div className="sm:hidden flex gap-3 w-full px-1">
                <button
                  type="button"
                  aria-pressed={sortBy === 'recommended'}
                  onClick={() => setSortBy('recommended')}
                  aria-label="Sort by recommended"
                  className={`flex-1 text-sm px-4 py-4 rounded-2xl transition-all duration-300 min-h-[48px] font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                    sortBy === 'recommended'
                      ? 'bg-gradient-to-r from-jordan-gold to-jordan-rose text-white shadow-premium'
                      : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  ✨ {t('home.sort.recommended', 'Recommended')}
                </button>
                <button
                  type="button"
                  aria-pressed={sortBy === 'rating'}
                  onClick={() => setSortBy('rating')}
                  aria-label="Sort by highest rated"
                  className={`flex-1 text-sm px-4 py-4 rounded-2xl transition-all duration-300 min-h-[48px] font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                    sortBy === 'rating'
                      ? 'bg-gradient-to-r from-jordan-teal to-jordan-emerald text-white shadow-premium'
                      : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  ⭐ {t('home.sort.highestRated', 'Highest Rated')}
                </button>
                <button
                  type="button"
                  aria-pressed={sortBy === 'price-low'}
                  onClick={() => setSortBy('price-low')}
                  aria-label="Sort by price low to high"
                  className={`flex-1 text-sm px-4 py-4 rounded-2xl transition-all duration-300 min-h-[48px] font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                    sortBy === 'price-low'
                      ? 'bg-gradient-to-r from-jordan-blue to-jordan-teal text-white shadow-premium'
                      : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  💰 {t('home.sort.priceLow', 'Price: Low to High')}
                </button>
              </div>

              {/* Premium Desktop Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort results"
                className="hidden sm:block btn-secondary px-6 py-3 rounded-2xl hover-lift font-semibold min-w-0 w-full sm:w-auto text-sm sm:text-base shadow-md border border-white/20 bg-white/5 backdrop-blur-sm"
              >
                <option value="recommended">✨ {t('home.sort.recommended', 'Recommended')}</option>
                <option value="rating">⭐ {t('home.sort.highestRated', 'Highest Rated')}</option>
                <option value="price-low">💰 {t('home.sort.priceLow', 'Price: Low to High')}</option>
              </select>

              {/* Premium CTA Button */}
              <button
                type="button"
                onClick={handleSearch}
                aria-label="Find stays"
                className="px-10 py-5 bg-button-gradient hover:bg-button-hover text-white font-bold rounded-2xl shadow-premium hover:shadow-floating transition-all duration-500 flex items-center justify-center gap-4 transform hover:scale-105 active:scale-95 min-h-[64px] text-lg font-semibold border border-white/20"
              >
                <Search size={24} />
                <span className="hidden sm:inline">{t("home.hero.findStays", "Discover Amazing Hotels")}</span>
                <span className="sm:hidden">Search</span>
              </button>
            </div>
          </div>


        </div>


      </section>

      {/* Filters Section */}
      <section className="mb-12 mt-16">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              className="btn-secondary inline-flex items-center gap-2 px-5 py-3 rounded-2xl hover-lift font-semibold min-h-[44px]"
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {(priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0 || selectedAmenities.length > 0) && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse-glow">
                  {(priceRange[0] > 0 ? 1 : 0) + (priceRange[1] < 500 ? 1 : 0) + (minRating > 0 ? 1 : 0) + selectedAmenities.length}
                </span>
              )}
            </button>

            {/* Sort control removed from this toolbar to avoid duplication with search bar */}
          </div>

          {(priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0 || selectedAmenities.length > 0) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Clear filters"
                  className="btn-secondary inline-flex items-center gap-2 px-5 py-3 rounded-2xl hover-lift font-semibold"
                >
                  <X size={18} />
                  <span>Clear filters</span>
                </button>
          )}
        </div>

        {showFilters && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 shadow-glow border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Price per night (JOD)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newMin = Math.max(0, Math.min(Number(e.target.value), priceRange[1]));
                        setPriceRange([newMin, priceRange[1]]);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min"
                    />
                    <span className="text-slate-500">-</span>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newMax = Math.max(priceRange[0], Math.min(Number(e.target.value), 500));
                        setPriceRange([priceRange[0], newMax]);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
              {/* Smoking filter removed */}
              {/* ...existing filter columns... */}

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Minimum rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Any rating</option>
                  <option value={3}>3+ stars</option>
                  <option value={4}>4+ stars</option>
                  <option value={4.5}>4.5+ stars</option>
                </select>
              </div>

              {/* Amenities Filter - Temporarily disabled */}
              {/* <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Amenities
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'wifi', label: 'Free WiFi', icon: Wifi },
                    { id: 'parking', label: 'Free Parking', icon: Car },
                    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
                  ].map(({ id, label, icon: Icon }) => (
                    <label key={id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAmenities([...selectedAmenities, id]);
                          } else {
                            setSelectedAmenities(selectedAmenities.filter(a => a !== id));
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon size={16} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 dark:text-red-100 font-semibold text-sm">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="pb-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <div className="space-y-8">
            <header className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-slate-50">
                {isLocationBased ? "Exclusive Recommendations Near You" : "Jordan's Finest Accommodations"}
              </h2>
              <p className="page-subtitle">
                {isLocationBased
                  ? "Handpicked luxury stays and authentic experiences tailored to your location"
                  : "Discover world-class hotels, boutique resorts, and unique stays across Jordan's most spectacular destinations"}
              </p>
            </header>

            <HotelsVirtualizedGrid
              key={filteredAndSortedHotels.length}
              hotels={filteredAndSortedHotels}
              viewLabel={viewLabel}
              i18nLanguage={i18n.language}
              preferences={preferences}
            />

            {filteredAndSortedHotels.length === 0 && hotels.length > 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No hotels match your current filters
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try broadening your search criteria to discover amazing Jordanian hospitality
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default React.memo(Home);
