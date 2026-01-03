import React, { useState, useEffect } from 'react';
import realHotelsAPI from '../services/realHotelsData';

export default function FeaturedHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHotels = async () => {
      const data = await realHotelsAPI.getFeaturedHotels();
      setHotels(data);
      setLoading(false);
    };
    loadHotels();
  }, []);

  if (loading) return <div className="text-center py-12">Loading featured hotels...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Featured Hotels</h1>
      <p className="text-gray-600 mb-8">Jordan's most highly rated accommodations</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition">
            <div className="relative h-64 overflow-hidden">
              <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover hover:scale-110 transition" />
              <div className="absolute top-4 left-4 bg-yellow-400 px-3 py-1 rounded-full">
                ★ {hotel.rating}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{hotel.location}</p>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{hotel.description}</p>

              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {hotel.address}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Rooms:</strong> {hotel.rooms}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Check-in:</strong> {hotel.checkIn} | <strong>Check-out:</strong> {hotel.checkOut}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">+{hotel.amenities.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-600">{hotel.price} JOD</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  View Details
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-600">
                <p>({hotel.reviews} reviews)</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
