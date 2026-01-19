import React, { useState } from 'react';
import ReviewsSection from '../components/ReviewsSection.jsx';
import { useTranslation } from 'react-i18next';
import { Star, Shield, Users, Heart, MessageSquare, Award, Sparkles, Quote, TrendingUp, CheckCircle } from 'lucide-react';
import Seo from '../components/Seo.jsx';

const FEATURES = [
  {
    key: 'verified',
    icon: Shield,
    title: 'Verified Reviews',
    description: 'Every review is authenticated and comes from real guests who have stayed with us.'
  },
  {
    key: 'context',
    icon: Users,
    title: 'Rich Context',
    description: 'Detailed reviews with photos, tips, and specific recommendations for your trip.'
  },
  {
    key: 'signals',
    icon: TrendingUp,
    title: 'Trust Signals',
    description: 'See review patterns, ratings distribution, and helpfulness scores at a glance.'
  },
];

const INITIAL_DEMO_REVIEWS = [];

function Reviews() {
  const { i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [reviews, setReviews] = useState(INITIAL_DEMO_REVIEWS);

  const handleAddReview = async (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <div className="min-h-screen bg-light-cool dark:bg-dark-cool">
      <Seo
        title="Jordan Hotel Reviews - Authentic Guest Experiences | VISIT-JO"
        description="Read genuine reviews from travelers who have experienced Jordan's finest hotels. Verified reviews with photos and detailed insights to help you choose the perfect stay."
        canonicalUrl="https://VISIT-JO.com/reviews"
        keywords="Jordan hotel reviews, guest experiences, verified reviews, Jordan travel reviews, hotel ratings"
      />

      {/* Enhanced Content Sections */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 space-y-24">

          {/* Featured Review Quote */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue/5 to-jordan-teal/5 dark:from-jordan-blue/10 dark:to-jordan-teal/10">
              <div className="max-w-4xl mx-auto text-center">
                <Quote className="w-16 h-16 text-jordan-gold mx-auto mb-8 opacity-50" />
                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-700 dark:text-slate-200 italic leading-relaxed mb-8">
                  "VISIT-JO's review system gave us the confidence to choose the perfect hotel for our honeymoon in Petra. The detailed reviews with photos helped us visualize exactly what to expect. It was absolutely perfect!"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-jordan-gold to-jordan-rose rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900 dark:text-slate-100">Sarah & Michael</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Newlyweds from London</div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-jordan-gold fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="animate-fade-in-up pt-64" style={{ animationDelay: '0.6s' }}>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Community Reviews
              </h2>
              <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-200 max-w-4xl mx-auto leading-relaxed">
                Join thousands of travelers sharing their authentic Jordan experiences
              </p>
            </div>

            <ReviewsSection
              hotelId="general"
              reviews={reviews.map((r) => ({ ...r, comment: isArabic ? (r.commentAr || r.comment) : r.comment }))}
              onAddReview={handleAddReview}
            />
          </section>

          {/* Call to Action Section */}
          <section className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                    Share Your Experience
                  </h2>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Help fellow travelers discover the magic of Jordan. Your authentic review could inspire someone's perfect journey.
                </p>
                <div className="flex justify-center">
                  <button className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift min-h-[48px] sm:min-h-[56px] flex items-center justify-center">
                    Write a Review
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Reviews);
