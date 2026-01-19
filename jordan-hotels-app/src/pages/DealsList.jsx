import { useState, useEffect } from "react";
import hotelsService from "../services/hotelsService";
import { Link } from "react-router-dom";
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

  if (loading) return <div className="p-24 text-center">{t('pages.dealsList.loading')}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Exclusive Hotel Deals in Jordan - Up to 35% Off Luxury Hotels"
        description="Discover amazing hotel deals in Jordan. Save up to 35% on luxury accommodations in Petra, Wadi Rum, Dead Sea, and Amman. Limited time offers on premium properties."
        canonicalUrl="https://vist-jo.com/deals"
        keywords="Jordan hotel deals, luxury hotels discount, Petra deals, Wadi Rum offers, Dead Sea spa deals, Amman hotel discounts"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Simple Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        {/* Clean Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Simple Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-semibold uppercase tracking-wide animate-fade-in">
            <Gift className="w-5 h-5" />
            {t('pages.dealsList.hero.kicker', 'Exclusive Deals')}
            <Gift className="w-5 h-5" />
          </div>

          {/* Simple Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display mb-6 sm:mb-8 tracking-tight leading-tight animate-slide-up px-2 sm:px-0">
            <span className="block text-white drop-shadow-2xl mb-1 sm:mb-2">
              {t("pages.dealsList.hero.titleMain", "Unbeatable")}
            </span>
            <span className="block text-white drop-shadow-2xl">
              {t("pages.dealsList.hero.titleAccent", "Jordan Deals")}
            </span>
          </h1>

          {/* Simple Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto mb-12 sm:mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
            {t('pages.dealsList.hero.subtitle', 'Discover amazing savings on Jordan\'s finest accommodations. Save up to 35% on luxury hotels across Petra, Wadi Rum, Dead Sea, and Amman.')}
          </p>

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
            {/* Premium Deals Spotlight */}
            <section className="text-center pt-20 pb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Premium Deals You Can't Miss
              </h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Handpicked luxury accommodations with unbeatable savings. Book now and transform your Jordan adventure.
              </p>
              <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
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
                  <article key={hotel.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700">
                    {/* Simple Image Header */}
                    <div className="relative h-64 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-105 transition duration-300">
                      <OptimizedImage
                        src={hotel.image}
                        alt={hotelName}
                        onError={createHotelImageOnErrorHandler(hotel.id)}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/20" />

                      {/* Simple Discount Badge */}
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-md">
                        -{discount}%
                      </div>

                      {/* Simple Rating Badge */}
                      <div className="absolute top-4 left-4 bg-yellow-400 text-black px-2.5 py-1 rounded-full text-sm font-bold shadow-md">
                        ★ {hotel.rating || 'N/A'}
                      </div>

                      {/* Simple Wishlist Button */}
                      <WishlistButton item={hotel} className="absolute bottom-4 right-4" />
                    </div>

                    {/* Simple Content */}
                    <div className="p-5 sm:p-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{hotelName}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex items-center gap-2">
                        <MapPin size={16} className="flex-shrink-0" />
                        <span>{hotel.location || hotel.city || 'Jordan'}</span>
                      </p>

                      {/* Simple Pricing Section */}
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-500 dark:text-gray-400 line-through text-sm">{originalPrice.toFixed(2)} JOD</p>
                          <div className="bg-red-500 text-white px-2 py-1 rounded-full font-bold text-xs">
                            SAVE {discount}%
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {discountedPriceNum.toFixed(2)} JOD
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          per night
                        </p>
                      </div>

                      {/* Simple Action Button */}
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[48px]"
                        aria-label={`Claim ${discount}% off at ${hotelName}`}
                      >
                        <Zap size={18} />
                        <span>{t('pages.dealsList.claimDeal', 'Claim Deal')}</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Simple Call to Action */}
            <section className="text-center py-16">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Don't Miss Out!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                    These exclusive deals are limited-time offers. Book now and transform your Jordan vacation into an unforgettable journey.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300">
                      View All Hotels
                    </Link>
                    <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-300">
                      Contact Concierge
                    </Link>
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
