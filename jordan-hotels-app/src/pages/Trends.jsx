import React, { useCallback, useEffect, useState } from "react";
import { hotelAPI } from "../services/api";
import { Loader2, Search, Star, Percent, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createHotelImageOnErrorHandler } from "../utils/hotelImageFallback";
import { useTranslation } from "react-i18next";
import { getHotelDisplayName } from "../utils/hotelLocalization";
import OptimizedImage from "../components/OptimizedImage";

const defaultQueries = [
  { id: "tr-petra", label: "Petra", labelAr: "البتراء", q: "Petra" },
  { id: "tr-dead-sea", label: "Dead Sea", labelAr: "البحر الميت", q: "Dead Sea" },
  { id: "tr-wadi-rum", label: "Wadi Rum", labelAr: "وادي رم", q: "Wadi Rum" },
  { id: "tr-amman", label: "Amman", labelAr: "عمّان", q: "Amman" },
];

const Trends = () => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(defaultQueries[0].q);
  const [results, setResults] = useState({ hotels: [], experiences: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    setError("");
    try {
      const data = await hotelAPI.searchAll(q);

      // Filter and sort results to show only the best items
      const filteredResults = {
        hotels: (data?.hotels || [])
          .filter(hotel => {
            const rating = hotel.rating && typeof hotel.rating === 'number' ? hotel.rating : 0;
            const reviews = hotel.reviews && typeof hotel.reviews === 'number' ? hotel.reviews : 0;
            const price = hotel.price && typeof hotel.price === 'number' ? hotel.price : 0;
            // Require high rating, good reviews, and reasonable price
            return rating >= 4.5 && reviews >= 100 && price > 0 && price <= 500;
          })
          .sort((a, b) => {
            // Sort by rating desc, then reviews desc, then price asc
            const aRating = a.rating || 0;
            const bRating = b.rating || 0;
            if (aRating !== bRating) return bRating - aRating;
            const aReviews = a.reviews || 0;
            const bReviews = b.reviews || 0;
            if (aReviews !== bReviews) return bReviews - aReviews;
            return (a.price || 0) - (b.price || 0);
          })
          .slice(0, 12), // Top 12 highly-rated, well-reviewed hotels

        experiences: (data?.experiences || [])
          .filter(exp => {
            const rating = exp.rating && typeof exp.rating === 'number' ? exp.rating : 0;
            const reviews = exp.reviews && typeof exp.reviews === 'number' ? exp.reviews : 0;
            const price = exp.price && typeof exp.price === 'number' ? exp.price : 0;
            // Require high rating, some reviews, and reasonable price
            return rating >= 4.5 && reviews >= 50 && price > 0 && price <= 200;
          })
          .sort((a, b) => {
            // Sort by rating desc, then reviews desc, then price asc
            const aRating = a.rating || 0;
            const bRating = b.rating || 0;
            if (aRating !== bRating) return bRating - aRating;
            const aReviews = a.reviews || 0;
            const bReviews = b.reviews || 0;
            if (aReviews !== bReviews) return bReviews - aReviews;
            return (a.price || 0) - (b.price || 0);
          })
          .slice(0, 8), // Top 8 highly-rated, well-reviewed experiences


      };

      setResults(filteredResults);
      setActiveQuery(q || "");
    } catch (err) {
      console.error("Search failed", err);
      const msg = String(err?.message || "");
      const isTimeout = /timeout/i.test(msg);
      setError(
        isTimeout
          ? "Search is taking longer than expected right now. Please try again in a moment."
          : msg || "Search failed"
      );
      setResults({ hotels: [], experiences: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(defaultQueries[0].q);
  }, [runSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query.trim());
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative px-4 sm:px-6 py-20 md:py-24 text-center text-white max-w-4xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3 bg-white/20 inline-block px-4 py-2 rounded-full">
            🔥 Trending Now 🔥
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            What Everyone is Talking About
          </h1>
          <p className="text-base md:text-lg opacity-95 leading-relaxed max-w-3xl mx-auto text-white/90">
            Discover the top-rated stays and experiences that travelers are falling in love with right now. ✨
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 rounded-full px-3 py-2 shadow-2xl border border-white/30 dark:border-slate-700/60 backdrop-blur-sm">
            <Search className="text-slate-400" size={18} />
            <input
              className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Search across hotels and experiences..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Explore"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 min-h-[44px] inline-flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Explore 🚀
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs md:text-sm">
            {defaultQueries.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => runSearch(q.q)}
                className={`px-4 py-2 rounded-full border-2 font-medium transition-all duration-300 hover:scale-105 ${
                  activeQuery === q.q
                    ? "bg-white text-purple-600 border-white shadow-lg scale-105"
                    : "border-white/40 text-white/80 hover:bg-white/10 hover:border-white/60"
                }`}
              >
                {isArabic ? q.labelAr : q.label} 🌟
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-12">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>


            {/* Hotels row */}
            {results.hotels.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Star size={18} className="text-amber-400" />
                  {t('nav.hotels')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.hotels.slice(0, 6).map((h) => (
                    <article key={h.id} className="hotel-card group overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-purple-200/50 dark:border-purple-700/50">
                      {h.image && (
                        <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden rounded-t-3xl">
                          <OptimizedImage
                            src={h.image}
                            alt={getHotelDisplayName(h, i18n.language) || h.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={createHotelImageOnErrorHandler(h.id)}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            ⭐ {h.rating}
                          </div>
                        </div>
                      )}
                      <div className="p-6 flex flex-col gap-3 flex-1">
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {getHotelDisplayName(h, i18n.language) || h.name}
                        </p>
                        {h.location && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <MapPin size={14} className="text-purple-500" /> {h.location}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-3">
                          {h.reviews && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300 text-sm font-medium">
                              💬 {h.reviews} reviews
                            </span>
                          )}
                          {h.price && (
                            <span className="text-slate-700 dark:text-slate-200 font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {h.price} JOD <span className="text-sm text-slate-500 dark:text-slate-400">/night</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Link
                            to={`/hotels/${h.id}`}
                            aria-label={`View ${getHotelDisplayName(h, i18n.language) || h.name}`}
                            className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 inline-flex items-center justify-center min-h-[44px] shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            View ✨
                          </Link>
                          <Link
                            to={`/hotels/${h.id}?book=true`}
                            aria-label={`Book ${getHotelDisplayName(h, i18n.language) || h.name}`}
                            className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 transition-all duration-300 inline-flex items-center justify-center min-h-[44px] shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            Book Now 🚀
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Experiences row */}
            {results.experiences.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Percent size={18} className="text-pink-500" />
                  {t('nav.experiences')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {results.experiences.slice(0, 6).map((e) => (
                    <article
                      key={e.id}
                      className="glass-card rounded-3xl p-6 flex flex-col gap-3 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-700/50"
                    >
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {e.title}
                      </p>
                      {e.meta && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <MapPin size={14} className="text-orange-500" /> {e.meta}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {e.rating && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 text-sm font-medium">
                            ⭐ {e.rating}
                          </span>
                        )}
                        {e.reviews && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            ({e.reviews} reviews)
                          </span>
                        )}
                      </div>
                      {e.price && (
                        <p className="text-slate-700 dark:text-slate-200 mt-2 font-bold text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          From {e.price} JOD
                        </p>
                      )}
                      <div className="mt-auto">
                        <Link
                          to={`/experiences/${e.id}`}
                          className="w-full px-4 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300 inline-block text-center shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          Book Experience 🚀
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}



            {results.hotels.length === 0 &&
              results.experiences.length === 0 && (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
                  {t('pages.trends.noResults')}
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default Trends;
