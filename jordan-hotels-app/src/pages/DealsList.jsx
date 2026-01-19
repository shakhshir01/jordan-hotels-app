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
import { Sparkles, Clock, Zap, Crown, Star, MapPin, TrendingDown, Gift, Loader2 } from 'lucide-react';


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
    <div className="min-h-screen bg-light-premium dark:bg-dark-premium">
      <Seo
        title="Exclusive Hotel Deals in Jordan - Up to 35% Off Luxury Hotels"
        description="Discover amazing hotel deals in Jordan. Save up to 35% on luxury accommodations in Petra, Wadi Rum, Dead Sea, and Amman. Limited time offers on premium properties."
        canonicalUrl="https://visitjo.com/deals"
        keywords="Jordan hotel deals, luxury hotels discount, Petra deals, Wadi Rum offers, Dead Sea spa deals, Amman hotel discounts"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-jordan-rose via-jordan-gold to-jordan-emerald animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Animated Mesh Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-jordan-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-jordan-rose/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-jordan-teal/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-16 w-6 h-6 bg-white/20 rotate-45 animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-32 right-20 w-8 h-8 bg-jordan-gold/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-24 left-24 w-5 h-5 bg-jordan-rose/25 rotate-12 animate-float" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute bottom-32 right-32 w-7 h-7 bg-jordan-teal/20 rounded-full animate-float" style={{ animationDelay: '3.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-3 px-8 py-4 mb-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white/90 text-sm font-bold uppercase tracking-widest shadow-2xl animate-fade-in">
            <Gift className="w-5 h-5 text-jordan-gold" />
            {t('pages.dealsList.hero.kicker', 'Exclusive Deals')}
            <Gift className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">{t("pages.dealsList.hero.titleMain", "Unbeatable")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {t("pages.dealsList.hero.titleAccent", "Jordan Deals")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('pages.dealsList.hero.subtitle', 'Discover extraordinary savings on Jordan\'s finest accommodations. From luxury resorts to boutique stays, enjoy up to 35% off premium properties across Petra, Wadi Rum, Dead Sea, and Amman.')}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <TrendingDown className="w-8 h-8 text-jordan-gold" />
                35%
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Max Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Crown className="w-8 h-8 text-jordan-rose" />
                750+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Premium Hotels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-jordan-gold" />
                4.9★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Clock className="w-8 h-8 text-jordan-teal" />
                24hrs
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Limited Time</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 mt-16">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        )}

        {!loading && hotels.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No deals available right now
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Check back soon for amazing Jordan hotel deals!
            </p>
          </div>
        )}

        {!loading && hotels.length > 0 && (
          <div className="space-y-12">
            {/* Deals Spotlight */}
            <section className="text-center pt-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">
                {t('pages.dealsList.spotlight.title', 'Premium Deals You Can\'t Miss')}
              </h2>
              <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
                {t('pages.dealsList.spotlight.subtitle', 'Handpicked luxury accommodations with unbeatable savings. Book now and save big on your Jordan adventure.')}
              </p>
            </section>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel, index) => {
                const discount = DISCOUNTS[index % DISCOUNTS.length];
                const originalPrice = hotel.price || 0;
                const discountedPrice = originalPrice * (1 - discount / 100);
                const discountedPriceNum = Math.round(discountedPrice * 100) / 100;
                const hotelName = getHotelDisplayName(hotel, i18n.language);

                return (
                  <article key={hotel.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
                    {/* Image Header */}
                    <div className="relative h-64 bg-gradient-to-br from-jordan-rose to-jordan-gold flex items-center justify-center group-hover:scale-105 transition duration-300">
                      <OptimizedImage
                        src={hotel.image}
                        alt={hotelName}
                        onError={createHotelImageOnErrorHandler(hotel.id)}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/20" />

                      {/* Discount Badge */}
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg animate-pulse">
                        -{discount}%
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ★ {hotel.rating || 'N/A'}
                      </div>

                      {/* Wishlist Button */}
                      <WishlistButton item={hotel} className="absolute bottom-4 right-4" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">{hotelName}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex items-center gap-2">
                        <MapPin size={16} />
                        {hotel.location || hotel.city || 'Jordan'}
                      </p>

                      {/* Pricing */}
                      <div className="mb-6 space-y-1">
                        <p className="text-slate-400 line-through text-sm">{originalPrice.toFixed(2)} JOD {t('hotels.perNight')}</p>
                        <p className="text-3xl font-bold text-red-600">{discountedPriceNum.toFixed(2)} JOD {t('hotels.perNight')}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <Sparkles size={14} className="text-jordan-gold" />
                          {t('pages.dealsList.save', { amount: (originalPrice - discountedPriceNum).toFixed(2) })} - Limited Time!
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => handleClaimDeal(hotel, discount)}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-xl hover:shadow-lg transition font-bold min-h-[48px] flex items-center justify-center gap-2 hover-lift"
                        aria-label={`Claim ${discount}% off at ${hotelName}`}
                      >
                        <Zap size={18} />
                        {t('pages.dealsList.claimDeal', 'Book This Amazing Deal Now!')}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Call to Action */}
            <section className="text-center py-16">
              <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                    Don't Miss Out!
                  </h2>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    These exclusive deals are limited time offers. Book now and save up to 35% on your dream Jordan vacation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                      View All Hotels
                    </button>
                    <button className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                      Contact Concierge
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

const DISCOUNTS = [30, 25, 20, 35, 15, 22, 28, 18];
