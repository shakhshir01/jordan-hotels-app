import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import hotelsService from '../services/hotelsService';
import { getSmartSuggestions } from '../services/chatbot';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';
import { haversineKm } from '../utils/geo';

const JORDAN_PLACES = [
  { name: 'Amman', lat: 31.9539, lon: 35.9106 },
  { name: 'Aqaba', lat: 29.5319, lon: 35.0061 },
  { name: 'Petra', lat: 30.3285, lon: 35.4444 },
  { name: 'Wadi Rum', lat: 29.5764, lon: 35.4195 },
  { name: 'Dead Sea', lat: 31.7191, lon: 35.5744 },
  { name: 'Jerash', lat: 32.2769, lon: 35.8960 },
  { name: 'Madaba', lat: 31.7150, lon: 35.7939 },
];

const getNearestJordanPlace = ({ lat, lon }) => {
  let best = JORDAN_PLACES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const p of JORDAN_PLACES) {
    const d = haversineKm(lat, lon, p.lat, p.lon);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
};

export default function SmartRecommendations({ limit = 8 }) {
  const { i18n } = useTranslation();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basedOnLocation, setBasedOnLocation] = useState(false);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setBasedOnLocation(false);
      
      // Get viewed hotels from localStorage
      const viewedHotels = JSON.parse(localStorage.getItem('viewedHotels') || '[]');
      
      if (viewedHotels.length > 0) {
        // Get smart suggestions based on viewed hotels (fetch only needed hotels by id)
        const suggestedIds = getSmartSuggestions(viewedHotels, {}).slice(0, Math.max(6, limit * 2));
        const items = await Promise.all(
          suggestedIds.map((id) => hotelsService.getHotelById(id).catch(() => null))
        );
        const recommended = items.filter(Boolean).slice(0, limit);
        setRecommendations(recommended);
      } else {
        // Otherwise, attempt location-based recommendations.
        const geoHotels = await new Promise((resolve) => {
          if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const place = getNearestJordanPlace({ lat, lon });

                // Only fetch a few truly-close hotels.
                const nearby = await hotelsService.getNearbyHotelsByGeo({
                  lat,
                  lon,
                  limit,
                  targetKm: 15,
                  pageLimit: 200,
                  maxPages: 6,
                });

                resolve({ place: place.name, hotels: nearby });
              } catch {
                resolve(null);
              }
            },
            () => resolve(null),
            { enableHighAccuracy: false, timeout: 3500, maximumAge: 5 * 60 * 1000 }
          );
        });

        if (geoHotels && Array.isArray(geoHotels.hotels) && geoHotels.hotels.length > 0) {
          setBasedOnLocation(true);
          setRecommendations(geoHotels.hotels.slice(0, limit));
        } else {
          const hotels = await hotelsService.getHotelsSample({ limit: 250 });
          const topRated = [...hotels]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, limit);
          setRecommendations(topRated);
        }
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  if (loading) {
    return (
      <div className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="text-blue-900" size={28} />
            <h2 className="text-3xl font-bold text-gray-900">Recommendations For You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
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
            (() => {
              const hotelName = getHotelDisplayName(hotel, i18n.language);
              return (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105"
            >
              {/* Hotel Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={hotel.image}
                  alt={hotelName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={createHotelImageOnErrorHandler(
                    hotel.id,
                    'data:image/svg+xml;charset=UTF-8,' +
                      encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
                          <rect width="100%" height="100%" fill="#e5e7eb"/>
                          <text x="50%" y="50%" fill="#6b7280" font-family="Arial" font-size="20" text-anchor="middle" dominant-baseline="middle">${hotelName}</text>
                        </svg>`
                      )
                  )}
                />
                <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-sm">{hotel.rating}</span>
                </div>
              </div>

              {/* Hotel Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                  {hotelName}
                </h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <MapPin size={16} />
                  <span>{hotel.location || hotel.destination || 'Jordan'}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-blue-900">
                    {hotel.price}
                  </span>
                  <span className="text-sm text-gray-600">{hotel.currency || 'JOD'}/night</span>
                </div>
              </div>
            </Link>
              );
            })()
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ✨ These recommendations are based on {basedOnLocation ? 'your location' : 'your browsing history'}
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
