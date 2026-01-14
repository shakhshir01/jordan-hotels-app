import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { hotelAPI } from "../services/api";
import { MapPin, Star, Search } from "lucide-react";
import { createHotelImageOnErrorHandler } from "../utils/hotelImageFallback";

const STORAGE_KEY = "visitjo.savedSearches";

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const destination = params.get("destination") || "";
  const topRated = params.get("topRated") === "true";
  const term = destination || q;

  const [hotels, setHotels] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const [savedSearches, setSavedSearches] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persistSaved = (items) => {
    setSavedSearches(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore (storage unavailable)
    }
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

  const resetAndLoad = useCallback(async () => {
    const rid = requestIdRef.current + 1;
    requestIdRef.current = rid;

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setHotels([]);
    setNextCursor(null);

    try {
      const first = await hotelAPI.searchHotelsPage({ q: term, limit: 30, signal: ac.signal });
      if (requestIdRef.current !== rid) return;
      let items = Array.isArray(first?.hotels) ? first.hotels : [];

      // Filter for top-rated hotels if requested
      if (topRated) {
        items = items
          .filter(hotel => hotel.rating && typeof hotel.rating === 'number' && hotel.rating >= 4.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10); // Only top 10 highly-rated hotels
      }

      setHotels(items);
      setNextCursor(first?.nextCursor || null);
    } catch (e) {
      if (requestIdRef.current !== rid) return;
      if (String(e?.message || "").toLowerCase().includes("aborted")) return;
      setError(e);
      setHotels([]);
      setNextCursor(null);
    } finally {
      if (requestIdRef.current === rid) setLoading(false);
    }
  }, [term, topRated]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore) return;
    if (!nextCursor) return;

    setLoadingMore(true);
    setError(null);
    const rid = requestIdRef.current;

    try {
      const page = await hotelAPI.searchHotelsPage({ q: term, cursor: nextCursor, limit: 30 });
      if (requestIdRef.current !== rid) return;
      let items = Array.isArray(page?.hotels) ? page.hotels : [];

      // Filter for top-rated hotels if requested
      if (topRated) {
        items = items
          .filter(hotel => hotel.rating && typeof hotel.rating === 'number' && hotel.rating >= 4.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 10 - hotels.length); // Don't exceed 10 total
      }

      setHotels((prev) => {
        const seen = new Set(prev.map((h) => h?.id).filter(Boolean));
        const merged = [...prev];
        for (const it of items) {
          const id = it?.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          merged.push(it);
        }
        return merged;
      });
      setNextCursor(page?.nextCursor || null);
    } catch (e) {
      if (requestIdRef.current !== rid) return;
      setError(e);
    } finally {
      if (requestIdRef.current === rid) setLoadingMore(false);
    }
  }, [loading, loadingMore, nextCursor, term, topRated, hotels.length]);

  useEffect(() => {
    resetAndLoad();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [resetAndLoad]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!nextCursor) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        loadMore();
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, nextCursor]);

  const hasHotels = useMemo(() => Array.isArray(hotels) && hotels.length > 0, [hotels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text mb-2">
              Search Results
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
              {hasHotels ? `Found ${hotels.length} hotels` : 'No results found'} for <span className="font-semibold text-slate-900 dark:text-slate-100">"{term || "All"}"</span>
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={!term}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 hover-lift touch-manipulation px-4 py-3"
            >
              <Search size={18} /> Save Search
            </button>
          </div>
        </header>

        {/* Saved searches */}
        {savedSearches.length > 0 && (
          <section className="card-modern">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-black gradient-text">
                  Saved Searches
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
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
            </div>
          </section>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-modern animate-pulse">
                <div className="aspect-[3/2] sm:aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-t-2xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && !hasHotels && (
          <div className="glass-card rounded-2xl p-6 border border-red-200/50 bg-red-50/50 dark:bg-red-900/20">
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
              ⚠️ {error.message || "Search failed"}
            </p>
            <button
              type="button"
              onClick={resetAndLoad}
              className="mt-4 btn-secondary hover-lift touch-manipulation px-6 py-3"
            >
              🔄 Retry
            </button>
          </div>
        )}

        {!loading && (hasHotels || !error) && (
          <div className="space-y-8">
            {/* Hotels */}
            {hasHotels && (
              <section>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-8 gradient-text">Hotels</h2>
                {error && (
                  <div className="mb-6 glass-card rounded-2xl p-4 border border-amber-200/50 bg-amber-50/50 dark:bg-amber-900/20">
                    <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                      ⚠️ {error.message || "Some results failed to load."}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {hotels.map((h) => (
                    <article key={h.id} className="card-modern group overflow-hidden flex flex-col hover-lift">
                      {h.image && (
                        <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden rounded-t-2xl">
                          <img
                            src={h.image}
                            alt={h.name}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={createHotelImageOnErrorHandler(h.id)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}
                      <div className="p-6 flex flex-col gap-3 flex-1">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {h.name}
                          </h3>
                          {h.location && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-3">
                              <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                              <span className="truncate">{h.location}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          {h.rating && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-glow">
                              <Star size={16} fill="currentColor" />
                              <span className="text-sm">{h.rating}</span>
                            </div>
                          )}
                          {h.price && (
                            <div className="text-right">
                              <span className="text-2xl font-black gradient-text">{h.price}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium ml-1">JOD</span>
                              <p className="text-xs text-slate-500 dark:text-slate-400">per night</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Link
                            to={`/hotels/${h.id}`}
                            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 text-center hover-lift touch-manipulation"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/hotels/${h.id}?book=true`}
                            className="flex-1 btn-primary px-4 py-3 text-sm font-bold rounded-xl text-center hover-lift touch-manipulation"
                          >
                            📅 Book Now
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-8">
                  {!loading && error && nextCursor && (
                    <div className="text-center mb-6">
                      <button
                        type="button"
                        onClick={loadMore}
                        className="btn-secondary hover-lift touch-manipulation px-6 py-3"
                      >
                        🔄 Retry Loading More
                      </button>
                    </div>
                  )}
                  {nextCursor && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="btn-primary disabled:opacity-50 hover-lift touch-manipulation px-8 py-4 text-lg font-bold"
                      >
                        {loadingMore ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            Loading More...
                          </div>
                        ) : (
                          "Load More Hotels"
                        )}
                      </button>
                    </div>
                  )}
                  {loadingMore && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card-modern animate-pulse">
                          <div className="aspect-[3/2] sm:aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-t-2xl"></div>
                          <div className="p-6 space-y-3">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="flex justify-between">
                              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div ref={sentinelRef} className="h-1" />
                </div>
              </section>
            )}

            {!hasHotels && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-6">🏨</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">No Hotels Found</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-8">
                    We couldn't find any hotels matching your search. Try adjusting your search terms or explore our featured destinations.
                  </p>
                  <Link
                    to="/"
                    className="btn-primary px-8 py-4 text-lg font-bold hover-lift touch-manipulation inline-block"
                  >
                    Explore All Hotels
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
