import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Star, Loader2, AlertCircle } from "lucide-react";
import realHotelsAPI from "../services/realHotelsData";
import SmartRecommendations from "../components/SmartRecommendations";

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,.9)" font-family="Arial" font-size="32" text-anchor="middle" dominant-baseline="middle">VisitJo Hotel</text>
  </svg>`);

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHotels = async (location = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await realHotelsAPI.getAllHotels(location);
      // Ensure data is an array
      const hotelsArray = Array.isArray(data) ? data : [];
      setHotels(hotelsArray);
      if (hotelsArray.length === 0) {
        setError("No hotels found. Try a different search");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load hotels. Please try again.");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchHotels(searchQuery);
    } else {
      fetchHotels();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-24 md:py-32 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4 animate-fade-in">
            Discover Jordan
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-display mb-6 tracking-tight leading-tight animate-slide-up">
            Jordan{" "}
            <span className="text-yellow-300">Infinite.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 mb-12 leading-relaxed animate-fade-in">
            Uncover hidden treasures and iconic wonders across Jordan. From the
            rose-red city of Petra to the serene Dead Sea—your perfect adventure
            starts here.
          </p>

          {/* Premium Search Bar */}
          <div className="search-bar max-w-3xl mx-auto animate-slide-up">
            <input
              className="flex-1 px-6 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none text-base rounded-full"
              placeholder="Where in Jordan? (e.g. Petra, Dead Sea, Wadi Rum)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Search size={20} />
              <span className="hidden sm:inline">FIND STAYS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-900 dark:text-red-100 font-semibold text-sm">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hotels Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="hotel-card">
                <div className="shimmer aspect-[4/3]" />
                <div className="p-6">
                  <div className="shimmer h-6 rounded mb-3" />
                  <div className="shimmer h-4 w-2/3 rounded" />
                </div>
              </div>
            ))
          ) : hotels.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No hotels found. Try a different search.
              </p>
            </div>
          ) : (
            hotels.map((hotel) => (
              <article key={hotel.id} className="hotel-card group">
                <div className="cover">
                  <img
                    src={hotel.image || FALLBACK_IMG}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                    alt={hotel.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500" fill="currentColor" />
                    <span className="text-sm font-bold text-slate-900">{hotel.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <MapPin size={14} />
                    {hotel.location}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {hotel.price} JOD
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">/night</div>
                    </div>
                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm rounded-xl hover:bg-jordan-blue hover:text-white dark:hover:bg-jordan-blue transition-all duration-300"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Smart Recommendations Section */}
      <SmartRecommendations />
    </div>
  );
};

export default Home;