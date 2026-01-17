import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';
import OptimizedImage from '../components/OptimizedImage';
import Seo from '../components/Seo.jsx';
import { Heart, Star, MapPin, Sparkles, Eye } from 'lucide-react';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { t, i18n } = useTranslation();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-8xl mb-8">💭</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black gradient-text mb-6">
              {t('pages.wishlist.title', 'Your Dream List')}
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t('pages.wishlist.subtitle', 'The places you\'re dreaming of, all in one place.')}
            </p>

            <div className="card-modern max-w-md mx-auto p-8 sm:p-12">
              <div className="text-6xl mb-6">🏨</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {t('pages.wishlist.empty.title', 'Your wishlist is empty')}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8">
                {t('pages.wishlist.empty.body', 'Start exploring amazing hotels and experiences to add to your wishlist!')}
              </p>
              <Link
                to="/"
                className="btn-primary px-8 py-4 text-lg font-bold hover-lift touch-manipulation inline-block"
              >
                {t('pages.wishlist.empty.cta', 'Explore Hotels')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Your Wishlist - Save Your Dream Jordan Hotels & Experiences"
        description="Keep track of your favorite Jordan hotels and experiences. Save properties you love and plan your perfect trip to Petra, Wadi Rum, Dead Sea, and more."
        canonicalUrl="https://visitjo.com/wishlist"
        keywords="Jordan wishlist, save hotels, favorite destinations, travel planning, Jordan hotels wishlist"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 pt-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-gradient-to-r from-jordan-rose to-jordan-gold text-white text-sm font-bold rounded-full shadow-lg">
            <Heart className="w-5 h-5" />
            {wishlist.length} {t('pages.wishlist.itemsSaved', { count: wishlist.length, defaultValue: 'Saved Adventures' })}
            <Heart className="w-5 h-5" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6">
            {t('pages.wishlist.title', 'Your Dream Collection')}
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
            {t('pages.wishlist.subtitle', 'Carefully curated places that captured your heart. Turn these dreams into unforgettable memories.')}
          </p>
        </div>

        {/* Enhanced Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => (
            <article key={item.id} className="group card-modern overflow-hidden hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
              {/* Enhanced Image Container */}
              <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src={item.image}
                  alt={item.type === 'experience' ? (item.name || '') : getHotelDisplayName(item, i18n.language)}
                  onError={createHotelImageOnErrorHandler(item.id)}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Enhanced Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      removeFromWishlist(item.id);
                    }
                  }}
                  className="absolute top-4 right-4 bg-red-500/90 hover:bg-red-600 text-white p-3 rounded-2xl shadow-lg hover-lift transition-all duration-300 touch-manipulation opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title={t('pages.wishlist.remove')}
                  aria-label={t('pages.wishlist.remove')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Enhanced Rating Badge */}
                {item.rating && (
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-glow backdrop-blur-sm border border-white/20">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                )}

                {/* Wishlist Indicator */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur-sm text-slate-900 font-semibold shadow-lg">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                  <span className="text-xs">Saved</span>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-jordan-blue dark:group-hover:text-jordan-blue transition-colors duration-300">
                  {item.type === 'experience' ? item.name : getHotelDisplayName(item, i18n.language)}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex items-start gap-2">
                  <MapPin size={16} className="text-jordan-rose flex-shrink-0 mt-0.5" />
                  <span>{item.location || item.description}</span>
                </p>

                {/* Enhanced Price Section */}
                <div className="mb-6">
                  {item.price && (
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl sm:text-4xl font-black gradient-text">{item.price}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">JOD</span>
                      {item.type !== 'experience' && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">{t('hotels.perNight')}</span>
                      )}
                    </div>
                  )}
                  {item.addedAt && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Sparkles size={14} className="text-jordan-gold" />
                      {t('pages.wishlist.savedOn', { date: new Date(item.addedAt).toLocaleDateString() })}
                    </p>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    to={item.type === 'experience' ? '/experiences' : `/hotels/${item.id}`}
                    className="flex-1 btn-primary py-4 text-center font-bold hover-lift touch-manipulation inline-flex items-center justify-center gap-2 min-h-[48px]"
                    aria-label={t('pages.wishlist.viewDetails', 'View Details')}
                  >
                    <Eye size={18} />
                    {t('pages.wishlist.viewDetails', 'View Details')}
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removeFromWishlist(item.id);
                      }
                    }}
                    className="px-4 py-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700 dark:text-red-400 rounded-2xl transition-all duration-300 touch-manipulation min-h-[48px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={t('pages.wishlist.remove', 'Remove from wishlist')}
                  >
                    <Heart size={18} className="fill-current" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 text-center pt-16">
          <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue/5 to-jordan-teal/5 dark:from-jordan-blue/10 dark:to-jordan-teal/10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-6">
              Ready to Make Your Dreams Come True?
            </h2>
            <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              You've saved some amazing places. Now it's time to turn those saved items into real memories. Book your perfect Jordan adventure today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/trip-planner" className="btn-primary px-8 py-4 text-lg font-bold hover-lift">
                Plan Your Trip
              </Link>
              <Link to="/" className="btn-secondary px-8 py-4 text-lg font-bold hover-lift">
                Discover More Hotels
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
