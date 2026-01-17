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

export default function Reviews() {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [reviews, setReviews] = useState(INITIAL_DEMO_REVIEWS);

  const handleAddReview = async (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Jordan Hotel Reviews - Authentic Guest Experiences | VisitJo"
        description="Read genuine reviews from travelers who have experienced Jordan's finest hotels. Verified reviews with photos and detailed insights to help you choose the perfect stay."
        canonicalUrl="https://visitjo.com/reviews"
        keywords="Jordan hotel reviews, guest experiences, verified reviews, Jordan travel reviews, hotel ratings"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift"></div>
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
            <MessageSquare className="w-5 h-5 text-jordan-gold" />
            {t('pages.reviews.hero.kicker', 'Traveler Stories')}
            <MessageSquare className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">{t("pages.reviews.hero.titleMain", "Hear from the")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {t("pages.reviews.hero.titleAccent", "Community")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('pages.reviews.hero.subtitle', 'Real experiences from real travelers. Discover why visitors fall in love with Jordan.')}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-jordan-gold" />
                4.9★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <CheckCircle className="w-8 h-8 text-jordan-teal" />
                100%
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Verified Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Users className="w-8 h-8 text-jordan-rose" />
                50K+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Heart className="w-8 h-8 text-jordan-blue" />
                98%
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Would Recommend</div>
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

      {/* Enhanced Content Sections */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 space-y-24">

          {/* Features Section */}
          <section className="animate-fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Why Our Reviews Matter
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                We don't just collect reviews – we curate authentic experiences that help you make confident travel decisions
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {FEATURES.map((feature, index) => (
                <article key={feature.key} className="group card-modern p-8 lg:p-10 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${0.2 * index}s` }}>
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jordan-blue to-jordan-teal rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-jordan-blue transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Featured Review Quote */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue/5 to-jordan-teal/5 dark:from-jordan-blue/10 dark:to-jordan-teal/10">
              <div className="max-w-4xl mx-auto text-center">
                <Quote className="w-16 h-16 text-jordan-gold mx-auto mb-8 opacity-50" />
                <blockquote className="text-2xl lg:text-3xl font-light text-slate-700 dark:text-slate-200 italic leading-relaxed mb-8">
                  "VisitJo's review system gave us the confidence to choose the perfect hotel for our honeymoon in Petra. The detailed reviews with photos helped us visualize exactly what to expect. It was absolutely perfect!"
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
          <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Community Reviews
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
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
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                    Share Your Experience
                  </h2>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Help fellow travelers discover the magic of Jordan. Your authentic review could inspire someone's perfect journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                    Write a Review
                  </button>
                  <button className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                    Explore Hotels
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
