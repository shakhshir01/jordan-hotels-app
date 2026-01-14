import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';
import { getHotelDisplayName } from '../utils/hotelLocalization';

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
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black gradient-text mb-4">
            {t('pages.wishlist.title', 'Your Dream List')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            {t('pages.wishlist.itemsSaved', { count: wishlist.length, defaultValue: `${wishlist.length} adventures waiting for you` })}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pb-8">
          {wishlist.map((item) => (
            <article key={item.id} className="card-modern group overflow-hidden hover-lift">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                <img
                  src={item.image}
                  alt={item.type === 'experience' ? (item.name || '') : getHotelDisplayName(item, i18n.language)}
                  onError={createHotelImageOnErrorHandler(item.id)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 bg-red-500/90 hover:bg-red-600 text-white p-3 rounded-2xl shadow-lg hover-lift transition-all duration-300 touch-manipulation"
                  title={t('pages.wishlist.remove')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {item.rating && (
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-glow">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-sm">{item.rating}</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.type === 'experience' ? item.name : getHotelDisplayName(item, i18n.language)}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {item.location || item.description}
                </p>

                <div className="mb-6">
                  {item.price && (
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-black gradient-text">{item.price}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">JOD</span>
                      {item.type !== 'experience' && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">{t('hotels.perNight')}</span>
                      )}
                    </div>
                  )}
                  {item.addedAt && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      💝 {t('pages.wishlist.savedOn', { date: new Date(item.addedAt).toLocaleDateString() })}
                    </p>
                  )}
                </div>

                <Link
                  to={item.type === 'experience' ? '/experiences' : `/hotels/${item.id}`}
                  className="btn-primary w-full py-4 text-center font-bold hover-lift touch-manipulation block"
                >
                  {t('pages.wishlist.viewDetails', 'View Details')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
