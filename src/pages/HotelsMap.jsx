import React, { useState, useEffect } from 'react';
import realHotelsAPI from '../services/realHotelsData';

export default function HotelsMap() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    const loadHotels = async () => {
      const data = await realHotelsAPI.getAllHotels();
      setHotels(data);
      if (data.length > 0) setSelectedHotel(data[0]);
    };
    loadHotels();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Hotels Map</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-200 rounded-lg h-96 relative overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <p className="text-gray-600 text-center">
              <span className="text-3xl mb-4 block">🗺️</span>
              Interactive Map Integration Ready
            </p>
          </div>

          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => setSelectedHotel(hotel)}
              className="absolute cursor-pointer hover:scale-125 transition"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
            >
              <div className="text-2xl">📍</div>
              {selectedHotel?.id === hotel.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                  {hotel.name}
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-4">Hotels Nearby</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => setSelectedHotel(hotel)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedHotel?.id === hotel.id
                    ? 'bg-blue-100 border-2 border-blue-600'
                    : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                <p className="font-bold text-sm">{hotel.name}</p>
                <p className="text-xs text-gray-600">{hotel.location}</p>
                <p className="text-sm font-semibold text-blue-600">{hotel.price} JOD</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedHotel && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-64 object-cover rounded-lg" />
            <div>
              <h2 className="text-3xl font-bold mb-2">{selectedHotel.name}</h2>
              <p className="text-gray-600 mb-4">{selectedHotel.description}</p>
              <p className="text-gray-700 mb-2">
                <strong>Phone:</strong> {selectedHotel.phone}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Email:</strong> {selectedHotel.email}
              </p>
              <p className="text-2xl font-bold text-blue-600">{selectedHotel.price} JOD / night</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
