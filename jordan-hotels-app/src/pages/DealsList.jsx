import React, { useState, useEffect } from "react";
import hotelsService from "../services/hotelsService";
import { Link, useNavigate } from "react-router-dom";
import getDefaultBookingData from "../utils/bookingDefaults";
import { useAuth } from "../context/AuthContext";
import WishlistButton from "../components/WishlistButton";
import { createHotelImageOnErrorHandler } from "../utils/hotelImageFallback";
import { useTranslation } from "react-i18next";
import { getHotelDisplayName } from "../utils/hotelLocalization";
import OptimizedImage from "../components/OptimizedImage";
import Seo from '../components/Seo.jsx';

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
      <Seo
        title="Exclusive Hotel Deals in Jordan - Up to 35% Off Luxury Hotels"
        description="Discover amazing hotel deals in Jordan. Save up to 35% on luxury accommodations in Petra, Wadi Rum, Dead Sea, and Amman. Limited time offers on premium properties."
        canonicalUrl="https://visitjo.com/deals"
        keywords="Jordan hotel deals, discounted hotels, luxury hotel offers, Jordan travel deals, hotel discounts, cheap hotels Jordan"
      />
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">{t('pages.dealsList.hero.kicker', 'Exclusive Savings')}</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">{t('pages.dealsList.hero.title', 'Luxury Hotels at Unbeatable Prices')}</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">{t('pages.dealsList.hero.subtitle', 'Unlock extraordinary savings on Jordan\'s finest accommodations. Experience world-class hospitality, breathtaking destinations, and unforgettable memories without breaking the bank. These limited-time offers won\'t last long!')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel, idx) => {
            const hotelName = getHotelDisplayName(hotel, i18n.language);
            const discount = DISCOUNTS[idx % DISCOUNTS.length];
            const originalPrice = hotel.price;
            const discountedPriceNum = Number(((originalPrice * (1 - discount / 100))).toFixed(2));
            const discountedPrice = discountedPriceNum.toFixed(2);
            
            return (
              <article key={hotel.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden">
                  <OptimizedImage
                    src={hotel.image}
                    alt={hotelName}
                    onError={createHotelImageOnErrorHandler(hotel.id)}
                    className="w-full h-full object-cover hover:scale-110 transition"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                    <p className="text-xs text-slate-500">{t('pages.dealsList.save', { amount: (originalPrice - discountedPriceNum).toFixed(2) })} - Limited Time!</p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleClaimDeal(hotel, discount)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg transition font-bold min-h-[48px]"
                    aria-label={`Claim ${discount}% off at ${hotelName}`}
                  >
                    {t('pages.dealsList.claimDeal', 'Book This Amazing Deal Now!')}
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
