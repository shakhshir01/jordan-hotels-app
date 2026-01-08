import React, { useState } from 'react';
import ReviewsSection from '../components/ReviewsSection.jsx';
import { useTranslation } from 'react-i18next';

const FEATURES = [
  { key: 'verified' },
  { key: 'context' },
  { key: 'signals' },
];

const INITIAL_DEMO_REVIEWS = [
  {
    rating: 5,
    comment: 'Perfect base for exploring Petra. Staff helped arrange sunrise entry and packed breakfast.',
    commentAr: 'مكان مثالي لاستكشاف البتراء. ساعدنا الطاقم في ترتيب دخول شروق الشمس وجهزوا لنا الإفطار.',
    timestamp: new Date().toISOString(),
  },
  {
    rating: 4,
    comment: 'Great Dead Sea pools and spa. Wi‑Fi could be stronger in the rooms, but views were incredible.',
    commentAr: 'مسبح وسبا البحر الميت رائعان. الواي فاي بحاجة لتحسين في الغرف، لكن الإطلالة مذهلة.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export default function Reviews() {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [reviews, setReviews] = useState(INITIAL_DEMO_REVIEWS);

  const handleAddReview = async (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-700 via-slate-900 to-slate-950 shadow-2xl mb-16 mx-6 mt-10">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-4 sm:px-6 py-16 md:py-20 text-center text-white max-w-3xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-80 mb-3">
            {t('pages.reviews.hero.kicker')}
          </p>
          <h1 className="text-4xl md:text-5xl font-black font-display mb-4">
            {t('pages.reviews.hero.title')}
          </h1>
          <p className="text-sm md:text-base opacity-95 leading-relaxed">
            {t('pages.reviews.hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 space-y-12">
        <section className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <article
              key={f.key}
              className="glass-card rounded-2xl p-5 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {t(`pages.reviews.features.${f.key}.title`)}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t(`pages.reviews.features.${f.key}.meta`)}</p>
            </article>
          ))}
        </section>

        <section>
          <ReviewsSection
            hotelId="demo-hub"
            reviews={reviews.map((r) => ({ ...r, comment: isArabic ? (r.commentAr || r.comment) : r.comment }))}
            onAddReview={handleAddReview}
          />
        </section>
      </div>
    </div>
  );
}
