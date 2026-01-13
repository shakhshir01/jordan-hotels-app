import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";

const STORAGE_KEY = "visitjo.savedSearches";

const SavedSearches = () => {
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleDelete = (id) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore (storage unavailable)
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-sky-700 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-4 sm:px-6 py-20 md:py-24 text-center text-white max-w-3xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3">
            YOUR PERSONAL DISCOVERY TRAIL
          </p>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight mb-3">
            Pick Up Where You Left Off
          </h1>
          <p className="text-base md:text-lg opacity-90 leading-relaxed">
            Don't lose track of your inspiration. Quickly return to your favorite ideas, from Petra weekends to Red Sea escapes.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        {saved.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              You don&apos;t have any saved searches yet.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Search size={18} />
              Start exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {saved.map((s) => (
              <div
                key={s.id}
                className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {s.term}
                  </p>
                  {s.createdAt && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Saved on {new Date(s.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/search?q=${encodeURIComponent(s.term)}`}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors duration-200"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
