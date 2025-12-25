import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Star, Loader2, AlertCircle } from 'lucide-react';
import { hotelAPI } from '../services/api';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHotels = async (location = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await hotelAPI.getAllHotels(location);
      setHotels(data);
    } catch (err) {
      setError(err.message || 'Failed to load hotels. Please try again.');
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
    <div className="min-h-screen bg-white">
      {/* Navbar with Functional Links */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-blue-900">Visit Jordan</div>
        <div className="flex gap-6 items-center font-bold text-slate-600">
          <Link to="/login" className="hover:text-blue-900 transition">Sign In</Link>
          <Link to="/signup" className="bg-blue-900 text-white px-6 py-2 rounded-full hover:bg-black transition-all">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="h-[500px] flex flex-col items-center justify-center text-center px-4 relative bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-6xl font-black mb-4">Jordan <span className="text-orange-500">Infinite.</span></h1>
        
        {/* Functional Search Bar */}
        <div className="bg-white p-2 rounded-full flex shadow-2xl w-full max-w-3xl mt-8 border border-slate-100">
          <input 
            className="flex-1 p-4 outline-none rounded-full text-lg" 
            placeholder="Where in Jordan? (e.g. Petra, Dead Sea)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-blue-900 text-white px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-black transition-all"
          >
            <Search size={20} /> FIND STAYS
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 my-6">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-900 font-bold">Error</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Hotel Grid */}
      <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-900" size={48} />
          </div>
        ) : hotels.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-slate-500">
            <p className="text-lg">No hotels found. Try a different search.</p>
          </div>
        ) : (
          hotels.map(hotel => (
            <div key={hotel.id} className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 group hover:shadow-xl transition-shadow">
              <div className="h-60 overflow-hidden bg-slate-200">
                <img 
                  src={hotel.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={hotel.name}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{hotel.name}</h3>
                  <div className="flex items-center text-orange-500 font-bold">
                    <Star size={16} fill="currentColor" /> {hotel.rating}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 mb-6">
                  <MapPin size={14} /> {hotel.location}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-xl font-black">
                    {hotel.price} JOD
                    <span className="text-sm font-medium text-slate-400">/night</span>
                  </span>
                  <Link 
                    to={`/hotels/${hotel.id}`}
                    className="text-blue-900 font-bold border-2 border-blue-900 px-4 py-1 rounded-lg hover:bg-blue-900 hover:text-white transition-all"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;