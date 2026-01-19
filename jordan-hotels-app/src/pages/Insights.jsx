import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin, Star, TrendingUp, Award, BarChart3, Target, Zap, ArrowRight, Sparkles, Heart } from "lucide-react";
import { hotelAPI } from "../services/api";
import OptimizedImage from "../components/OptimizedImage";
import Seo from '../components/Seo.jsx';

const Insights = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const page = await hotelAPI.getHotelsPage({ limit: 600 });
        const data = Array.isArray(page?.hotels) ? page.hotels : [];
        const normalized = Array.isArray(data)
          ? data.map((h, index) => {
              if (!h) return null;
              const id = h.id || h.hotelId || `h-${index + 1}`;
              const name = h.name || h.title || h.hotelName || "Jordan stay";
              const destination = h.destination || h.location || h.city || "Other";
              const price = h.price || h.pricePerNight || h.nightlyRate || 0;
              const rating = h.rating || h.score || h.stars || 0;
              const reviews = h.reviews || h.reviewCount || h.numReviews || 0;
              const image =
                h.image ||
                h.imageUrl ||
                (Array.isArray(h.images) && h.images[0]) ||
                undefined;

              return {
                ...h,
                id,
                name,
                destination,
                location: destination,
                price,
                rating,
                reviews,
                image,
              };
            })
          : [];
        setHotels(normalized.filter(Boolean));
      } catch (err) {
        console.error("Failed to load insights", err);
        setError(err.message || "Failed to load insights");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { totalHotels, destinations, topRated, bestValue } = useMemo(() => {
    if (!hotels.length) {
      return { totalHotels: 0, destinations: [], topRated: [], bestValue: [] };
    }

    const totalHotels = hotels.length;

    const destMap = new Map();
    hotels.forEach((h) => {
      const key = h.destination || h.location || "Other";
      if (!destMap.has(key)) {
        destMap.set(key, {
          name: key,
          count: 0,
          totalPrice: 0,
          totalRating: 0,
        });
      }
      const entry = destMap.get(key);
      entry.count += 1;
      entry.totalPrice += h.price || 0;
      entry.totalRating += h.rating || 0;
    });

    const destinations = Array.from(destMap.values())
      .map((d) => ({
        ...d,
        avgPrice: d.count ? Math.round(d.totalPrice / d.count) : 0,
        avgRating: d.count ? +(d.totalRating / d.count).toFixed(1) : 0,
      }))
      .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count)
      .slice(0, 5);

    const topRated = [...hotels]
      .sort((a, b) => {
        if (b.rating === a.rating) {
          return (b.reviews || 0) - (a.reviews || 0);
        }
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 6);

    const bestValue = [...hotels]
      .filter((h) => h.price && h.rating)
      .map((h) => ({
        ...h,
        valueScore: +(h.rating / h.price).toFixed(3),
      }))
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 6);

    return { totalHotels, destinations, topRated, bestValue };
  }, [hotels]);

  return (
    <div className="min-h-screen bg-light-warm dark:bg-dark-warm">
      <Seo
        title="Jordan Travel Insights - Data-Driven Hotel Analysis | VISIT-JO"
        description="Discover data-driven insights about Jordan's hotel market. Compare destinations, ratings, and prices to make informed travel decisions."
        canonicalUrl="https://VISIT-JO.com/insights"
        keywords="Jordan hotel insights, travel data, hotel analysis, destination comparison, Jordan travel statistics"
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
            <BarChart3 className="w-5 h-5 text-jordan-gold" />
            Smart Travel Insights
            <BarChart3 className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">Data-Driven</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              Travel Planning
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            Make informed decisions with our curated data. Compare destinations, prices, and ratings at a glance to find the perfect fit for your style and budget.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Target className="w-8 h-8 text-jordan-blue" />
                {totalHotels}
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Total Hotels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-8 h-8 text-jordan-teal" />
                {destinations.length}
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-jordan-rose" />
                {destinations[0]?.avgRating || "4.9"}
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-jordan-gold" />
                100%
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Verified Data</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-16 mt-16">
        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
          <span className="mt-0.5 text-red-600 dark:text-red-400 font-semibold text-sm">
            Error
          </span>
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Key stats */}
          <section className="pt-16">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                Jordan at a glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      TOTAL HOTELS
                    </span>
                    <TrendingUp className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
                    {totalHotels}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Curated higher-end stays across Jordan in this experience.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      DESTINATIONS
                    </span>
                    <MapPin className="text-emerald-500" size={18} />
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
                    {destinations.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    From Petra and Wadi Rum to Amman, Aqaba and the Dead Sea.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      AVERAGE RATING (TOP DEST.)
                    </span>
                    <Star className="text-amber-400" size={18} />
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
                    {destinations[0]?.avgRating || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Based on the highest-rated destination in this curated data.
                  </p>
                </div>
              </div>
            </section>

            {/* Top destinations */}
            <section className="pt-64">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Top destinations by rating
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sorted by average hotel rating, then by hotel count.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {destinations.map((d) => (
                  <article
                    key={d.name}
                    className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {d.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {d.count} curated hotels
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold dark:bg-amber-500/10 dark:text-amber-300">
                          <Star size={12} /> {d.avgRating}
                        </span>
                        <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          ~{d.avgPrice} JOD / night
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      A blend of stays from upscale resorts to boutique experiences, perfect for building a flexible itinerary.
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* Top rated hotels */}
            <section className="pt-64">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Standout stays by guest rating
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  High ratings and strong review counts from the curated data.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topRated.map((h) => (
                  <article
                    key={h.id}
                    className="hotel-card group overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden">
                        <OptimizedImage
                          src={h.image}
                          alt={h.name || 'Hotel image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            // preserve existing fallback logic when image fails
                            if (e?.currentTarget) {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="100%" height="100%" fill="%2320232a"/><text x="50%" y="50%" fill="%23ffffff" font-size="18" font-family="Arial,Helvetica" text-anchor="middle" dominant-baseline="middle">Image unavailable</text></svg>';
                            }
                          }}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white">
                            {h.location}
                          </p>
                          <p className="text-base md:text-lg font-semibold line-clamp-1 text-white">
                            {h.name}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 text-xs font-semibold" aria-hidden="true">
                            <Star size={12} className="text-amber-400" aria-hidden="true" />
                            {h.rating}
                          </span>
                          <span className="sr-only">Rating: {h.rating} out of 5</span>
                          {h.reviews && (
                            <span className="mt-1 text-[11px] text-white/80">
                              {h.reviews.toLocaleString()} reviews
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/90">
                          From
                        </p>
                        <p className="text-lg md:text-xl font-extrabold text-white">
                          {h.price} JOD <span className="text-xs text-white/70">/ night</span>
                        </p>
                      </div>
                      <a
                        href={`/hotels/${h.id}`}
                        aria-label={`View ${h.name} details`}
                        className="h-12 px-4 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                      >
                        View details
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Best value section */}
            <section className="pt-64">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Exceptional value picks
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ranking hotels by a simple rating-to-price signal.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bestValue.map((h) => (
                  <article
                    key={h.id}
                    className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {h.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {h.location}
                        </p>
                      </div>
                      <Award className="text-emerald-500" size={20} />
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} />
                        <span className="font-semibold">{h.rating}</span>
                        {h.reviews && (
                          <span className="ml-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {h.reviews.toLocaleString()} reviews
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {h.price} JOD <span className="text-xs text-slate-500">/ night</span>
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Value signal: {h.valueScore}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      This is a simple illustrative ranking based on the
                      underlying sample data, not a live pricing feed.
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Insights;
