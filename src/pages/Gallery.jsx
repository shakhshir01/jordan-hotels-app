import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import realHotelsAPI from '../services/realHotelsData';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';

export default function Gallery() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadHotels = async () => {
      const data = await realHotelsAPI.getAllHotels();
      setHotels(data);
      setLoading(false);
    };
    loadHotels();
  }, []);

  if (loading) return <div className="text-center py-12">Loading gallery...</div>;

  const FALLBACK_IMG =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#d67d61"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" fill="rgba(255,255,255,.92)" font-family="Arial" font-size="40" text-anchor="middle" dominant-baseline="middle">VisitJo Hotel</text>
    </svg>`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Hotel Gallery</h1>
          <p className="text-blue-100 text-lg">Explore stunning images from all our partner hotels across Jordan</p>
        </div>
      </section>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">⏳</div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        ) : (
          <div className="space-y-20">
            {hotels.map((hotel) => (
              (() => {
                const hotelName = getHotelDisplayName(hotel, i18n.language);
                return (
              <div key={hotel.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                {/* Hotel Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8">
                  <h2 className="text-3xl font-bold mb-2">{hotelName}</h2>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex gap-6">
                      <span className="text-blue-100">📍 {hotel.location}</span>
                      <span className="text-blue-100">💰 {hotel.price} JOD/night</span>
                      <span className="text-blue-100">⭐ {hotel.rating}</span>
                    </div>
                    <Link 
                      to={`/hotels/${hotel.id}`}
                      className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Images Grid */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Gallery Images</h3>
                  {hotel.images && hotel.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {hotel.images.map((img, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group cursor-pointer">
                          <div className="relative h-56 bg-slate-200 overflow-hidden">
                            <img 
                              src={img} 
                              alt={`${hotelName} - Image ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                          </div>
                          <div className="bg-slate-50 p-2 text-center text-sm text-slate-600">
                            Image {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No images available for this hotel
                    </div>
                  )}
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
