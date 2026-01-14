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
    <div className="cover bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 h-48 sm:h-56 lg:h-64"></div>
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

const HotelCard = React.memo(function HotelCard({ hotel, i18nLanguage, viewLabel }) {
  const hotelName = useMemo(
    () => getHotelDisplayName(hotel, i18nLanguage),
    [hotel, i18nLanguage]
  );

  return (
    <article className="hotel-card group card-modern mobile-optimized hover-mobile overflow-hidden">
      <div className="cover relative overflow-hidden">
        <OptimizedImage
          src={hotel.image || FALLBACK_IMG}
          alt={hotelName}
          width={400}
          height={250}
          quality={90}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          {hotel.rating >= 4.5 && (
            <div className="px-3 py-1.5 sm:px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse-glow backdrop-blur-sm">
              Popular
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/95 backdrop-blur-xl text-slate-900 rounded-full shadow-lg border border-white/30 flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm">
          <Star size={14} fill="currentColor" className="text-amber-500 sm:w-[16px] sm:h-[16px]" />
          {hotel.rating}
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {hotelName}
        </h3>
        <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300">
          <MapPin size={16} className="text-blue-500 flex-shrink-0 sm:w-5 sm:h-5" />
          <span className="font-medium truncate">{hotel.location}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 cursor-default backdrop-blur-sm">
            <Wifi size={14} />
            <span className="hidden xs:inline font-medium">WiFi</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 cursor-default backdrop-blur-sm">
            <Car size={14} />
            <span className="hidden xs:inline font-medium">Parking</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 cursor-default backdrop-blur-sm">
            <Utensils size={14} />
            <span className="hidden xs:inline font-medium">Restaurant</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-4 sm:pt-5 lg:pt-6 border-t border-slate-200/50 dark:border-slate-600/50 gap-4 sm:gap-0">
          <div className="flex-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">
              From <span className="gradient-text">{hotel.price}</span> {hotel.currency || "JOD"}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">per night</div>
          </div>
          <Link
            to={`/hotels/${hotel.id}`}
            className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 lg:px-8 lg:py-4 text-sm sm:text-base lg:text-lg rounded-2xl shadow-lg hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] w-full sm:w-auto font-bold"
          >
            <Eye size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            {viewLabel}
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
}) {
  const columns = useResponsiveColumns();
  const [scrollMargin, setScrollMargin] = useState(0);

  const parentRef = useRef(null);
  const parentRefCallback = useCallback((node) => {
    parentRef.current = node;
    if (node) setScrollMargin(node.offsetTop ?? 0);
  }, []);

  const rows = Math.ceil(hotels.length / columns);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows,
    estimateSize: () => 380,
    overscan: 6,
    scrollMargin,
  });

  const items = rowVirtualizer.getVirtualItems();

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
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
              }}
            >
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {rowHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    i18nLanguage={i18nLanguage}
                    viewLabel={viewLabel}
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

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationBased, setIsLocationBased] = useState(false);

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
      <section className="relative rounded-3xl overflow-hidden gradient-hero shadow-glow mb-16 animate-float">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-6 py-24 md:py-32 lg:py-40 text-center text-gray-900 dark:text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-6 animate-fade-in bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            {t("home.hero.kicker", "The Kingdom of Time")}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            {t("home.hero.titleMain", "Experience Jordan's")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-jordan-blue via-jordan-teal to-jordan-rose animate-pulse-glow">
              {t("home.hero.titleAccent", "Timeless Magic")}
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto opacity-95 mb-16 leading-relaxed animate-fade-in font-light">
            {t("home.hero.subtitle", "Journey through ancient cities, float in healing waters, and sleep under desert stars. Your perfect Jordanian adventure starts here.")}
          </p>

          <div className="search-bar max-w-4xl mx-auto animate-slide-up">
            <input
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/20 backdrop-blur-xl text-white placeholder-white/70 outline-none text-base sm:text-lg lg:text-xl rounded-full sm:rounded-none sm:rounded-l-full border-b sm:border-b-0 sm:border-r border-white/30 sm:border-r-white/30 focus:border-white/50 transition-all duration-300 input-mobile shadow-lg"
              placeholder={t("home.hero.searchPlaceholder", "Where do you want to go?")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="mt-4 sm:mt-0 px-8 sm:px-10 lg:px-12 py-4 sm:py-4 lg:py-5 bg-gradient-to-r from-jordan-blue to-jordan-teal hover:from-jordan-teal hover:to-jordan-blue backdrop-blur-sm text-white font-bold rounded-full sm:rounded-none sm:rounded-r-full shadow-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 touch-manipulation min-h-[56px] w-full sm:w-auto text-lg hover:scale-105"
            >
              <Search size={24} className="text-white" />
              <span className="hidden sm:inline lg:text-lg font-semibold">{t("home.hero.findStays", "Find Stays")}</span>
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-300/20 rounded-full blur-md animate-float" style={{ animationDelay: '3s' }} />
          
          {/* Simple Decorative Element */}
          <div className="absolute top-16 right-16 w-20 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 shadow-lg animate-float opacity-80" style={{ animationDelay: '4s' }}>
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary inline-flex items-center gap-2 px-5 py-3 rounded-2xl hover-lift font-semibold"
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {(priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0 || selectedAmenities.length > 0) && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse-glow">
                  {(priceRange[0] > 0 ? 1 : 0) + (priceRange[1] < 500 ? 1 : 0) + (minRating > 0 ? 1 : 0) + selectedAmenities.length}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="btn-secondary px-5 py-3 rounded-2xl hover-lift font-semibold min-w-[180px]"
            >
              <option value="recommended">✨ Recommended</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💎 Price: High to Low</option>
            </select>
          </div>

          {(priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0 || selectedAmenities.length > 0) && (
            <button
              onClick={clearFilters}
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
                {isLocationBased ? "Recommendations for you" : "Best Rated Hotels"}
              </h2>
              <p className="page-subtitle">
                Handpicked stays near you — based on your location when available.
                {isLocationBased
                  ? "Handpicked stays near you — based on your location."
                  : "Discover the highest rated stays across Jordan."}
              </p>
            </header>

            <HotelsVirtualizedGrid
              key={filteredAndSortedHotels.length}
              hotels={filteredAndSortedHotels}
              viewLabel={viewLabel}
              i18nLanguage={i18n.language}
            />

            {filteredAndSortedHotels.length === 0 && hotels.length > 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No hotels match your filters
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Try adjusting your filters to see more options.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
};

export default Home;
