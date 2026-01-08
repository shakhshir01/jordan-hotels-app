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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 shadow-2xl mb-16 mx-6 mt-8">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative px-4 sm:px-6 py-20 text-center text-white">
            <h1 className="text-5xl md:text-6xl font-black font-display mb-6">{t('pages.wishlist.title')}</h1>
            <p className="text-lg opacity-95">{t('pages.wishlist.subtitle')}</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12">
            <div className="text-6xl mb-4">💭</div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t('pages.wishlist.empty.title')}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t('pages.wishlist.empty.body')}
            </p>
            <Link
              to="/destinations"
              className="inline-block px-8 py-3 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('pages.wishlist.empty.cta')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 shadow-2xl mb-16 mx-6 mt-8">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">{t('pages.wishlist.title')}</h1>
          <p className="text-lg opacity-95">{t('pages.wishlist.itemsSaved', { count: wishlist.length })}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <article key={item.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.type === 'experience' ? (item.name || '') : getHotelDisplayName(item, i18n.language)}
                  onError={createHotelImageOnErrorHandler(item.id)}
                  className="w-full h-full object-cover hover:scale-110 transition"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                  title={t('pages.wishlist.remove')}
                >
                  ❌
                </button>
                {item.rating && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    ★ {item.rating}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{item.type === 'experience' ? item.name : getHotelDisplayName(item, i18n.language)}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{item.location || item.description}</p>
                
                <div className="mb-6 space-y-1">
                  {item.price && (
                    <p className="text-2xl font-bold text-jordan-blue">
                      {item.price} JOD{item.type === 'experience' ? '' : ` ${t('hotels.perNight')}`}
                    </p>
                  )}
                  {item.addedAt && (
                    <p className="text-xs text-slate-500">
                      {t('pages.wishlist.savedOn', { date: new Date(item.addedAt).toLocaleDateString() })}
                    </p>
                  )}
                </div>

                <Link
                  to={item.type === 'experience' ? '/experiences' : `/hotels/${item.id}`}
                  className="w-full block text-center bg-gradient-to-r from-jordan-blue to-jordan-teal text-white py-2 rounded-lg hover:shadow-lg transition font-bold"
                >
                  {t('pages.wishlist.viewDetails')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
