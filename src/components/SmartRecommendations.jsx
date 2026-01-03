import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import realHotelsAPI from '../services/realHotelsData';
import { getSmartSuggestions } from '../services/chatbot';

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get viewed hotels from localStorage
      const viewedHotels = JSON.parse(localStorage.getItem('viewedHotels') || '[]');
      
      // Get all hotels
      const allHotels = await realHotelsAPI.getAllHotels();
      
      if (viewedHotels.length > 0) {
        // Get smart suggestions based on viewed hotels
        const suggestedIds = getSmartSuggestions(viewedHotels, {});
        const recommended = allHotels.filter(h => suggestedIds.includes(h.id)).slice(0, 4);
        setRecommendations(recommended);
      } else {
        // Show top-rated hotels if no history
        const topRated = allHotels.sort((a, b) => b.rating - a.rating).slice(0, 4);
        setRecommendations(topRated);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="text-blue-900" size={28} />
            <h2 className="text-3xl font-bold text-gray-900">Recommendations For You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-900" size={28} />
            <h2 className="text-3xl font-bold text-gray-900">Recommendations For You</h2>
          </div>
          <Link
            to="/hotels-map"
            className="text-blue-900 hover:text-blue-700 font-bold flex items-center gap-2"
          >
            View All <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map(hotel => (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105"
            >
              {/* Hotel Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
                        <rect width="100%" height="100%" fill="#e5e7eb"/>
                        <text x="50%" y="50%" fill="#6b7280" font-family="Arial" font-size="20" text-anchor="middle" dominant-baseline="middle">${hotel.name}</text>
                      </svg>`
                    );
                  }}
                />
                <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-sm">{hotel.rating}</span>
                </div>
              </div>

              {/* Hotel Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <MapPin size={16} />
                  <span>{hotel.destination}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-blue-900">
                    {hotel.price}
                  </span>
                  <span className="text-sm text-gray-600">JOD/night</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ✨ These recommendations are based on your browsing history
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('viewedHotels');
              loadRecommendations();
            }}
            className="text-sm text-blue-900 hover:underline"
          >
            Reset recommendations
          </button>
        </div>
      </div>
    </div>
  );
}
