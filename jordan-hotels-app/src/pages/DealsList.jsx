import React, { useState, useEffect } from "react";
import hotelsService from "../services/hotelsService";
import { Link, useNavigate } from "react-router-dom";
import getDefaultBookingData from "../utils/bookingDefaults";
import { useAuth } from "../context/AuthContext";
import WishlistButton from "../components/WishlistButton";
import { createHotelImageOnErrorHandler } from "../utils/hotelImageFallback";
import { useTranslation } from "react-i18next";
import { getHotelDisplayName } from "../utils/hotelLocalization";

const DISCOUNTS = [30, 25, 20, 35, 15, 22, 28, 18];

export default function DealsList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const data = await hotelsService.getFeaturedHotels();

        // Filter for best deals: price between 40-120 JOD, sort by rating, limit to 20
        const filteredDeals = (data || [])
          .filter(hotel => {
            const price = hotel.price && typeof hotel.price === 'number' ? hotel.price : 0;
            return price >= 40 && price <= 120;
          })
          .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating descending
          .slice(0, 20); // Limit to 20 deals

        setHotels(filteredDeals);
      } catch (error) {
        console.error('Error loading deals:', error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    loadHotels();
  }, []);

  const handleClaimDeal = (hotel, discount) => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/deals' } });
      return;
    }
    const bookingData = getDefaultBookingData();
    navigate('/checkout', { state: { hotelId: hotel?.id, hotel, discount, bookingData } });
  };

  if (loading) return <div className="p-24 text-center">{t('pages.dealsList.loading')}</div>;

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">{t('pages.dealsList.hero.kicker', 'Limited Time Offers')}</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">{t('pages.dealsList.hero.title', 'Luxury for Less')}</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">{t('pages.dealsList.hero.subtitle', 'Experience the best of Jordan with exclusive rates on premium hotels and resorts.')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel, idx) => {
            const hotelName = getHotelDisplayName(hotel, i18n.language);
            const discount = DISCOUNTS[idx % DISCOUNTS.length];
            const originalPrice = hotel.price;
            const discountedPrice = (originalPrice * (1 - discount / 100)).toFixed(2);
            
            return (
              <article key={hotel.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotelName}
                    onError={createHotelImageOnErrorHandler(hotel.id)}
                    className="w-full h-full object-cover hover:scale-110 transition"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                    -{discount}%
                  </div>
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    ★ {hotel.rating}
                  </div>
                  <WishlistButton item={hotel} className="absolute bottom-4 right-4" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{hotelName}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{hotel.location}</p>
                  
                  <div className="mb-6 space-y-1">
                    <p className="text-slate-400 line-through text-sm">{originalPrice} JOD {t('hotels.perNight')}</p>
                    <p className="text-3xl font-bold text-red-600">{discountedPrice} JOD {t('hotels.perNight')}</p>
                    <p className="text-xs text-slate-500">{t('pages.dealsList.save', { amount: (originalPrice - discountedPrice).toFixed(2) })}</p>
                  </div>

                  <button 
                    onClick={() => handleClaimDeal(hotel, discount)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg transition font-bold"
                  >
                    {t('pages.dealsList.claimDeal')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
