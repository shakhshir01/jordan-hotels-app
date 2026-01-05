import React, { useEffect, useState } from "react";
import { hotelAPI } from "../services/api";
import { Loader2, Search, MapPin, Star, Percent } from "lucide-react";
import { Link } from "react-router-dom";

const defaultQueries = [
  { id: "tr-petra", label: "Petra", q: "Petra" },
  { id: "tr-dead-sea", label: "Dead Sea", q: "Dead Sea" },
  { id: "tr-wadi-rum", label: "Wadi Rum", q: "Wadi Rum" },
  { id: "tr-amman", label: "Amman", q: "Amman" },
];

const Trends = () => {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(defaultQueries[0].q);
  const [results, setResults] = useState({ hotels: [], experiences: [], deals: [], destinations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const runSearch = async (q) => {
    setLoading(true);
    setError("");
    try {
      const data = await hotelAPI.searchAll(q);
      setResults({
        hotels: data?.hotels || [],
        experiences: data?.experiences || [],
        deals: data?.deals || [],
        destinations: data?.destinations || [],
      });
      setActiveQuery(q || "");
    } catch (err) {
      console.error("Search failed", err);
      setError(err.message || "Search failed");
      setResults({ hotels: [], experiences: [], deals: [], destinations: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(defaultQueries[0].q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query.trim());
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-700 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 md:py-24 text-center text-white max-w-4xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3">
            LIVE-STYLE DISCOVERY
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-4">
            See what Jordan is great for
          </h1>
          <p className="text-base md:text-lg opacity-95 leading-relaxed max-w-3xl mx-auto">
            Explore where hotels, experiences, and deals naturally cluster by theme.
            Try Petra at night, Red Sea escapes, or quick city breaks in Amman.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 rounded-full px-3 py-2 shadow-2xl border border-white/30 dark:border-slate-700/60">
            <Search className="text-slate-400" size={18} />
            <input
              className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Search a vibe or place (e.g. spa, diving, city)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-jordan-blue text-white text-xs md:text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore
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
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24 space-y-12">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-jordan-blue" size={40} />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Destinations row */}
            {results.destinations.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-500" />
                  Destinations matching "{activeQuery || "All"}"
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {results.destinations.map((d) => (
                    <Link
                      key={d.id}
                      to={d.id ? `/destinations/${d.id}` : "/destinations"}
                      className="glass-card rounded-2xl p-4 flex flex-col gap-1 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{d.name}</p>
                      {d.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{d.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Hotels row */}
            {results.hotels.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Star size={18} className="text-amber-400" />
                  Hotels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.hotels.slice(0, 6).map((h) => (
                    <article key={h.id} className="hotel-card group overflow-hidden flex flex-col">
                      {h.image && (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={h.image}
                            alt={h.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col gap-1 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">
                          {h.name}
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
                              {h.price} JOD <span className="text-[11px] text-slate-500">/ night</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <Link
                            to={`/hotels/${h.id}`}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-jordan-blue dark:hover:bg-jordan-blue transition-colors duration-200 inline-block"
                          >
                            View details
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
                  Experiences
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
                        <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">From {e.price} JOD</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Deals row */}
            {results.deals.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Percent size={18} className="text-emerald-500" />
                  Deals
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {results.deals.slice(0, 6).map((d) => (
                    <article
                      key={d.id}
                      className="glass-card rounded-2xl p-4 flex flex-col gap-1 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{d.title}</p>
                      {d.meta && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{d.meta}</p>
                      )}
                      {d.price && (
                        <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">{d.price}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {results.hotels.length === 0 &&
              results.experiences.length === 0 &&
              results.deals.length === 0 &&
              results.destinations.length === 0 && (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
                  No results yet. Try a broader search or one of the suggested chips above.
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default Trends;
