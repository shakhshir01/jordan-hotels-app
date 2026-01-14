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
    <div className="space-y-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title text-slate-900 dark:text-slate-50">
            Search results
          </h1>
          <p className="page-subtitle mt-2">
            Showing matches for <span className="font-semibold">“{term || "All"}”</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSaveSearch}
            disabled={!term}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <Search size={16} /> Save this search
          </button>
        </div>
      </header>

      {/* Saved searches */}
      {savedSearches.length > 0 && (
        <section className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
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

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface animate-pulse h-64" />
          ))}
        </div>
      )}

      {!loading && error && !hasHotels && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 text-red-800">
          <div className="text-sm font-semibold">{error.message || "Search failed"}</div>
          <button
            type="button"
            onClick={resetAndLoad}
            className="mt-4 btn-secondary"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && (hasHotels || !error) && (
        <div className="space-y-10">
          {/* Hotels */}
          {hasHotels && (
            <section>
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Hotels</h2>
              {error && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900 text-sm">
                  {error.message || "Some results failed to load."}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hotels.map((h) => (
                  <article key={h.id} className="hotel-card group overflow-hidden flex flex-col">
                    {h.image && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={h.image}
                          alt={h.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
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
                            {h.price} JOD <span className="text-[11px] text-slate-500 dark:text-slate-400">/ night</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/hotels/${h.id}`}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 inline-block"
                        >
                          View details
                        </Link>
                        <Link
                          to={`/hotels/${h.id}?book=true`}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 inline-block"
                        >
                          📅 Book Now
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6">
                {!loading && error && nextCursor && (
                  <div className="mb-3 text-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      className="btn-secondary"
                    >
                      Retry loading more
                    </button>
                  </div>
                )}
                {nextCursor && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="btn-secondary disabled:opacity-50"
                    >
                      {loadingMore ? "Loading more..." : "Load more"}
                    </button>
                  </div>
                )}
                {loadingMore && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="surface animate-pulse h-64" />
                    ))}
                  </div>
                )}
                <div ref={sentinelRef} className="h-1" />
              </div>
            </section>
          )}

          {!hasHotels && (
            <p className="text-sm text-slate-500">No hotels found. Try another search term.</p>
          )}
        </div>
      )}
    </div>
  );
}
