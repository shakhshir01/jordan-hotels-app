import React, { useState, useEffect } from 'react';
import hotelsService from '../services/hotelsService';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';

export default function FeaturedHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadHotels = async () => {
      const data = await hotelsService.getFeaturedHotels();
      setHotels(data);
      setLoading(false);
    };
    loadHotels();
  }, []);

  if (loading) return <div className="text-center py-12">Loading featured hotels...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Featured Hotels</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Jordan's most highly rated accommodations</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel) => (
          (() => {
            const hotelName = getHotelDisplayName(hotel, i18n.language);
            return (
          <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={hotel.image}
                alt={hotelName}
                onError={createHotelImageOnErrorHandler(hotel.id)}
                className="w-full h-full object-cover hover:scale-110 transition"
              />
              <div className="absolute top-4 left-4 bg-yellow-400 px-3 py-1 rounded-full">
                ★ {hotel.rating}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{hotelName}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{hotel.location}</p>
              <p className="text-gray-700 dark:text-gray-200 text-sm mb-4 line-clamp-2">{hotel.description}</p>

              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Address:</strong> {hotel.address}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Rooms:</strong> {hotel.rooms}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Check-in:</strong> {hotel.checkIn} | <strong>Check-out:</strong> {hotel.checkOut}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 ? (
                    <>
                      {hotel.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">+{hotel.amenities.length - 3}</span>
                      )}
                    </>
                  ) : (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">—</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{hotel.price} JOD</p>
                <div className="flex gap-2">
                  <Link to={`/hotels/${hotel.id}`} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm font-medium">
                    View Details
                  </Link>
                  <Link to={`/hotels/${hotel.id}?book=true`} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    📅 Book Now
                  </Link>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-600">
                <p>({hotel.reviews} reviews)</p>
              </div>
            </div>
          </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}
