import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Search, Star, AlertCircle, Loader2 } from "lucide-react";
import { hotelAPI } from "../services/api";
import { createHotelImageOnErrorHandler } from "../utils/hotelImageFallback";
import { useTranslation } from "react-i18next";
import { getHotelDisplayName } from "../utils/hotelLocalization";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import hotelsService from "../services/hotelsService";
import { haversineKm } from "../utils/geo";

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

const getUserRecommendedHotels = async () => {
  // Prefer truly-close hotels when geo is available; fall back to a small first page.
  const geo = await new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 5 * 60 * 1000 }
    );
  });

  if (geo) {
    const nearby = await hotelsService.getNearbyHotelsByGeo({
      lat: geo.lat,
      lon: geo.lon,
      limit: 6,
      targetKm: 20,
      pageLimit: 200,
      maxPages: 6,
    });

    if (Array.isArray(nearby) && nearby.length > 0) return nearby;

    // Fallback if geo exists but we couldn't compute distances (missing geo on hotels).
    const place = getNearestJordanPlace(geo);
    const page = await hotelAPI.getHotelsPage({ limit: 60 });
    const hotels = Array.isArray(page?.hotels) ? page.hotels : [];
    const sorted = [...hotels].sort((a, b) => {
      const aLoc = String(a?.location || a?.destination || "").toLowerCase();
      const bLoc = String(b?.location || b?.destination || "").toLowerCase();
      const aBoost = aLoc.includes(place.name.toLowerCase()) ? 1 : 0;
      const bBoost = bLoc.includes(place.name.toLowerCase()) ? 1 : 0;
      if (bBoost !== aBoost) return bBoost - aBoost;
      return (b?.rating || 0) - (a?.rating || 0);
    });
    return sorted.slice(0, 6);
  }

  const page = await hotelAPI.getHotelsPage({ limit: 6 });
  const hotels = Array.isArray(page?.hotels) ? page.hotels : [];
  return hotels.slice(0, 6);
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

  const onImgError = useMemo(
    () => createHotelImageOnErrorHandler(hotel.id, FALLBACK_IMG),
    [hotel.id]
  );

  return (
    <article className="hotel-card group">
      <div className="cover">
        <img
          src={hotel.image || FALLBACK_IMG}
          onError={onImgError}
          alt={hotelName}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center gap-1.5">
          <Star size={14} className="text-amber-500" fill="currentColor" />
          <span className="text-sm font-bold text-slate-900">{hotel.rating}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
          {hotelName}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <MapPin size={14} />
          {hotel.location}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {hotel.price} {hotel.currency || "JOD"}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">/night</div>
          </div>
          <Link
            to={`/hotels/${hotel.id}`}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm rounded-xl hover:bg-jordan-blue hover:text-white dark:hover:bg-jordan-blue transition-all duration-300"
          >
            {viewLabel}
          </Link>
        </div>
      </div>
    </article>
  );
});

const HotelsVirtualizedGrid = React.memo(function HotelsVirtualizedGrid({
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
    estimateSize: () => 560,
    overscan: 4,
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
});

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const viewLabel = useMemo(() => t("common.view"), [t]);
  const noResultsLabel = useMemo(() => t("hotels.noResults"), [t]);

  const fetchHotels = useCallback(
    async (location = "") => {
      setLoading(true);
      setError("");
      try {
        // Home should not load the entire Jordan dataset by default.
        // If user is searching, use /search (hotelAPI.getAllHotels(location) routes to search).
        const data = location && String(location).trim()
          ? await hotelAPI.getAllHotels(location)
          : await getUserRecommendedHotels();
        const hotelsArray = Array.isArray(data) ? data : [];
        setHotels(hotelsArray);
        if (hotelsArray.length === 0) {
          setError(noResultsLabel);
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

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-24 md:py-32 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4 animate-fade-in">
            {t("home.hero.kicker")}
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-display mb-6 tracking-tight leading-tight animate-slide-up">
            {t("home.hero.titleMain")}{" "}
            <span className="text-yellow-300">{t("home.hero.titleAccent")}</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 mb-12 leading-relaxed animate-fade-in">
            {t("home.hero.subtitle")}
          </p>

          <div className="search-bar max-w-3xl mx-auto animate-slide-up">
            <input
              className="flex-1 px-6 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none text-base rounded-full"
              placeholder={t("home.hero.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Search size={20} />
              <span className="hidden sm:inline">{t("home.hero.findStays")}</span>
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 dark:text-red-100 font-semibold text-sm">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-jordan-blue" size={48} />
          </div>
        ) : (
          <HotelsVirtualizedGrid
            hotels={hotels}
            viewLabel={viewLabel}
            i18nLanguage={i18n.language}
          />
        )}
      </div>

    </div>
  );
};

export default Home;
