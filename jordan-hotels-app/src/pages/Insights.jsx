import React, { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Star, TrendingUp, Award } from "lucide-react";
import { hotelAPI } from "../services/api";

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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 md:py-24 text-center text-white max-w-4xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3">
            TRAVEL INTELLIGENCE
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
            Smart insights for planning Jordan
          </h1>
          <p className="text-base md:text-lg opacity-95 leading-relaxed max-w-3xl mx-auto">
            Explore curated hotel data across Jordan: destinations, prices, and ratings all in one place,
            so you can quickly spot the cities and stays that fit your style and budget.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-16">
        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-jordan-blue" size={40} />
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
            <section>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                Jordan at a glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      TOTAL HOTELS
                    </span>
                    <TrendingUp className="text-jordan-blue" size={18} />
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
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Top destinations by rating
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Standout stays by guest rating
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  High ratings and strong review counts from the curated data.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topRated.map((h) => (
                  <article
                    key={h.id}
                    className="hotel-card group overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={h.image}
                        alt={h.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/80">
                            {h.location}
                          </p>
                          <p className="text-sm font-semibold line-clamp-1">
                            {h.name}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 text-xs font-semibold">
                            <Star size={12} className="text-amber-400" />
                            {h.rating}
                          </span>
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
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          From
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                          {h.price} JOD <span className="text-xs text-slate-500">/ night</span>
                        </p>
                      </div>
                      <a
                        href={`/hotels/${h.id}`}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-jordan-blue dark:hover:bg-jordan-blue transition-colors duration-200"
                      >
                        View details
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Best value section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Exceptional value picks
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
