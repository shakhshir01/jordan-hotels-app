import React, { useState } from 'react';
import ReviewsSection from '../components/ReviewsSection.jsx';

const FEATURES = [
  { title: 'Verified stays first', meta: 'In a live setup, only real stays tied to bookings would be able to leave a review.' },
  { title: 'Context that actually helps', meta: 'Guests can highlight what mattered most: quiet rooms, sunrise views, strong Wi‑Fi, late check‑out, and more.' },
  { title: 'Signals, not noise', meta: 'Summaries, averages and patterns guide you, instead of endless unstructured text.' },
];

const INITIAL_DEMO_REVIEWS = [
  {
    rating: 5,
    comment: 'Perfect base for exploring Petra. Staff helped arrange sunrise entry and packed breakfast.',
    timestamp: new Date().toISOString(),
  },
  {
    rating: 4,
    comment: 'Great Dead Sea pools and spa. Wi‑Fi could be stronger in the rooms, but views were incredible.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState(INITIAL_DEMO_REVIEWS);

  const handleAddReview = async (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-700 via-slate-900 to-slate-950 shadow-2xl mb-16 mx-6 mt-10">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-6 py-16 md:py-20 text-center text-white max-w-3xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-80 mb-3">
            REVIEWS & TRUST
          </p>
          <h1 className="text-4xl md:text-5xl font-black font-display mb-4">
            What guests say about Jordan stays
          </h1>
          <p className="text-sm md:text-base opacity-95 leading-relaxed">
            This page gives you a sense of how VisitJo can surface guest
            feedback. In a full production rollout, reviews would be tied to
            real bookings and moderated for quality.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-24 space-y-12">
        <section className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="glass-card rounded-2xl p-5 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {f.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{f.meta}</p>
            </article>
          ))}
        </section>

        <section>
          <ReviewsSection hotelId="demo-hub" reviews={reviews} onAddReview={handleAddReview} />
        </section>
      </div>
    </div>
  );
}
