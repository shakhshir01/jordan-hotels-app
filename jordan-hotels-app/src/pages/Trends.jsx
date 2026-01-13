import React, { useCallback, useEffect, useState } from "react";
import { hotelAPI } from "../services/api";
import { Loader2, Search, Star, Percent, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createHotelImageOnErrorHandler } from "../utils/hotelImageFallback";
import { useTranslation } from "react-i18next";
import { getHotelDisplayName } from "../utils/hotelLocalization";

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
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-700 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 md:py-24 text-center text-white max-w-4xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3">
            {t('pages.trends.hero.kicker', 'Trending Now')}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
            {t('pages.trends.hero.title', 'What Everyone is Talking About')}
          </h1>
          <p className="text-base md:text-lg opacity-95 leading-relaxed max-w-3xl mx-auto">
            {t('pages.trends.hero.subtitle', 'Discover the top-rated stays and experiences that travelers are falling in love with right now.')}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 rounded-full px-3 py-2 shadow-2xl border border-white/30 dark:border-slate-700/60">
            <Search className="text-slate-400" size={18} />
            <input
              className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder={t('pages.trends.searchPlaceholder', 'Search across hotels and experiences')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs md:text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('pages.trends.explore')}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs md:text-sm">
            {defaultQueries.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => runSearch(q.q)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  activeQuery === q.q
                    ? "bg-white text-slate-900 border-transparent"
                    : "border-white/40 text-white/80 hover:bg-white/10"
                }`}
              >
                {isArabic ? q.labelAr : q.label}
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
                    <article key={h.id} className="hotel-card group overflow-hidden flex flex-col">
                      {h.image && (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={h.image}
                            alt={getHotelDisplayName(h, i18n.language) || h.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={createHotelImageOnErrorHandler(h.id)}
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col gap-1 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">
                          {getHotelDisplayName(h, i18n.language) || h.name}
                        </p>
                        {h.location && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin size={12} /> {h.location}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2 text-xs">
                          {h.rating && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                              <Star size={12} /> {h.rating}
                            </span>
                          )}
                          {h.price && (
                            <span className="text-slate-700 dark:text-slate-200 font-semibold">
                              {h.price} JOD <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('hotels.perNight')}</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link
                            to={`/hotels/${h.id}`}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 inline-block"
                          >
                            {t('common.view')}
                          </Link>
                          <Link
                            to={`/hotels/${h.id}?book=true`}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 inline-block"
                          >
                            📅 Book
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {results.experiences.slice(0, 6).map((e) => (
                    <article
                      key={e.id}
                      className="glass-card rounded-2xl p-4 flex flex-col gap-1 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{e.title}</p>
                      {e.meta && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{e.meta}</p>
                      )}
                      {e.price && (
                        <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">{t('pages.trends.fromPrice', { price: e.price })}</p>
                      )}
                      <div className="mt-3">
                        <Link
                          to={`/experiences/${e.id}`}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 inline-block"
                        >
                          📅 Book Now
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
