import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import realHotelsAPI from '../services/realHotelsData';
import { useAuth } from '../context/AuthContext';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';

export default function SpecialOffers() {
  const [hotels, setHotels] = useState([]);
  const [discounts] = useState([20, 15, 25, 10, 18, 30, 12, 22]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadHotels = async () => {
      const data = await realHotelsAPI.getFeaturedHotels();
      setHotels(data);
    };
    loadHotels();
  }, []);

  const handleBookNow = (hotel, discount) => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/special-offers' } });
      return;
    }
    navigate('/checkout', { state: { hotel, discount } });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Special Offers</h1>
      <p className="text-gray-600 mb-8">Limited time deals on Jordan's best hotels</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hotels.map((hotel, idx) => (
          (() => {
            const hotelName = getHotelDisplayName(hotel, i18n.language);
            return (
          <div key={hotel.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="relative">
              <img
                src={hotel.image}
                alt={hotelName}
                onError={createHotelImageOnErrorHandler(hotel.id)}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                -{discounts[idx]}%
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{hotelName}</h3>
              <p className="text-gray-600 text-sm mb-4">{hotel.location}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-400 line-through">{hotel.price} JOD</p>
                  <p className="text-2xl font-bold">{(hotel.price * (1 - discounts[idx] / 100)).toFixed(2)} JOD</p>
                </div>
              </div>
              <button 
                onClick={() => handleBookNow(hotel, discounts[idx])}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Book Now
              </button>
            </div>
          </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}
