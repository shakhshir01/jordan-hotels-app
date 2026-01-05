import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { hotelAPI } from "../services/api";
import { MapPin, Star, Search } from "lucide-react";
import { createHotelImageOnErrorHandler } from "../utils/hotelImageFallback";

const STORAGE_KEY = "visitjo.savedSearches";

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const destination = params.get("destination") || "";
  const term = destination || q;

  const { data, loading, error } = useFetch(() => hotelAPI.searchAll(term), [term]);
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedSearches(JSON.parse(raw));
    } catch {
      setSavedSearches([]);
    }
  }, []);

  const persistSaved = (items) => {
    setSavedSearches(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  };

  const handleSaveSearch = () => {
    if (!term) return;
    const exists = savedSearches.some((s) => s.term === term);
    if (exists) return;
    const next = [
      {
        id: `s-${Date.now()}`,
        term,
        createdAt: new Date().toISOString(),
      },
      ...savedSearches,
    ].slice(0, 12);
    persistSaved(next);
  };

  const handleUseSaved = (s) => {
    setParams({ q: s.term });
  };

  const handleDeleteSaved = (id) => {
    const next = savedSearches.filter((s) => s.id !== id);
    persistSaved(next);
  };

  const results = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            Search results
          </h1>
          <p className="text-sm text-slate-600">
            Showing matches for <span className="font-semibold">“{term || "All"}”</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSaveSearch}
            disabled={!term}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          >
            <Search size={16} /> Save this search
          </button>
        </div>
      </header>

      {/* Saved searches */}
      {savedSearches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Saved searches
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((s) => (
              <div
                key={s.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <button
                  type="button"
                  onClick={() => handleUseSaved(s)}
                  className="flex items-center gap-1"
                >
                  <Search size={12} />
                  <span>{s.term}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSaved(s.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {!loading && !error && (
        <div className="space-y-10">
          {/* Hotels */}
          {Array.isArray(results.hotels) && results.hotels.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Hotels</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.hotels.map((h) => (
                  <article key={h.id} className="hotel-card group overflow-hidden flex flex-col">
                    {h.image && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={h.image}
                          alt={h.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={createHotelImageOnErrorHandler(h.id)}
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

          {/* Experiences */}
          {Array.isArray(results.experiences) && results.experiences.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.experiences.map((x) => (
                  <article key={x.id} className="glass-card rounded-2xl p-4 flex flex-col gap-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{x.title}</p>
                    {x.meta && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{x.meta}</p>
                    )}
                    {x.price && (
                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">From {x.price} JOD</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Deals */}
          {Array.isArray(results.deals) && results.deals.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Deals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.deals.map((d) => (
                  <article key={d.id} className="glass-card rounded-2xl p-4 flex flex-col gap-1">
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

          {/* Destinations */}
          {Array.isArray(results.destinations) && results.destinations.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Destinations</h2>
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

          {(!Array.isArray(results.hotels) || results.hotels.length === 0) &&
            (!Array.isArray(results.experiences) || results.experiences.length === 0) &&
            (!Array.isArray(results.deals) || results.deals.length === 0) &&
            (!Array.isArray(results.destinations) || results.destinations.length === 0) && (
              <p className="text-sm text-slate-500">No results found. Try another search term.</p>
            )}
        </div>
      )}
    </div>
  );
}
