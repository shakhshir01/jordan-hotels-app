import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2, Clock, MapPin, Star, Sparkles, Heart, ArrowRight, Bookmark } from "lucide-react";
import Seo from '../components/Seo.jsx';

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

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved searches?')) {
      setSaved([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore (storage unavailable)
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Saved Searches - Your Personal Jordan Travel Discovery | VisitJo"
        description="Access your saved hotel searches and continue exploring Jordan's finest accommodations. Never lose track of your favorite travel discoveries."
        canonicalUrl="https://visitjo.com/saved-searches"
        keywords="saved searches, Jordan travel, hotel searches, travel planning, Jordan hotels"
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
            <Bookmark className="w-5 h-5 text-jordan-gold" />
            Your Personal Discovery Trail
            <Bookmark className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">Pick Up Where</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              You Left Off
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            Don't lose track of your inspiration. Quickly return to your favorite ideas, from Petra weekends to Red Sea escapes.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Search className="w-8 h-8 text-jordan-blue" />
                {saved.length}
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Saved Searches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-8 h-8 text-jordan-teal" />
                25+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-jordan-rose" />
                4.9★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Heart className="w-8 h-8 text-jordan-gold" />
                750+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Hotels Found</div>
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

      {/* Enhanced Content Section */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-32">
          <div className="card-modern p-8 lg:p-10 animate-fade-in-up">
            {saved.length === 0 ? (
              <div className="text-center py-16 animate-fade-in-up">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4">
                  No Saved Searches Yet
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                  Start exploring Jordan's amazing destinations and save your favorite searches to continue your journey later.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/"
                    className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl hover-lift flex items-center gap-3"
                  >
                    <Search className="w-5 h-5" />
                    Start Exploring Hotels
                  </Link>
                  <Link
                    to="/destinations"
                    className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift flex items-center gap-3"
                  >
                    <MapPin className="w-5 h-5" />
                    Browse Destinations
                  </Link>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                {/* Header with Clear All */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
                      Your Saved Searches
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                      {saved.length} search{saved.length !== 1 ? 'es' : ''} saved for easy access
                    </p>
                  </div>
                  <button
                    onClick={handleClearAll}
                    className="btn-secondary px-6 py-3 text-sm font-semibold rounded-2xl hover-lift flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>

                {/* Saved Searches List */}
                <div className="space-y-6">
                  {saved.map((search, index) => (
                    <article
                      key={search.id}
                      className="group card-modern p-6 hover:shadow-premium transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex items-center justify-between gap-6">
                        {/* Search Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-jordan-blue to-jordan-teal rounded-xl flex items-center justify-center">
                              <Search className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-jordan-blue transition-colors duration-300">
                                "{search.term}"
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Saved {search.createdAt ? new Date(search.createdAt).toLocaleDateString() : 'recently'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4" />
                                  Ready to explore
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Continue your search for "{search.term}" and discover amazing hotels in Jordan.
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/?q=${encodeURIComponent(search.term)}`}
                            className="btn-primary px-6 py-3 text-sm font-bold rounded-2xl hover-lift flex items-center gap-2 group-hover:scale-105 transition-all duration-300"
                          >
                            Continue Search
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(search.id)}
                            className="p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label={`Delete saved search "${search.term}"`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-600/50">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">
                    Ready for More Discovery?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                    Keep exploring Jordan's incredible destinations and save more searches for later.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/destinations" className="btn-secondary px-6 py-3">
                      Explore Destinations
                    </Link>
                    <Link to="/deals" className="btn-primary px-6 py-3">
                      Check Latest Deals
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSearches;
