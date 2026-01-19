import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Clock, Star, Sparkles, Compass, Mountain, Waves, Camera, Heart } from "lucide-react";
import { hotelAPI } from "../services/api";
import { useTranslation } from "react-i18next";
import OptimizedImage from "../components/OptimizedImage";
import Seo from '../components/Seo.jsx';

export default function ExperiencesListing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setLoading(true);
        const experiences = await hotelAPI.getExperiences();
        setItems(experiences || []);
      } catch (err) {
        setError(err);
        console.error('Error loading experiences:', err);
      } finally {
        setLoading(false);
      }
    };
    loadExperiences();
  }, []);

  return (
    <div className="min-h-screen bg-light-warm dark:bg-dark-warm">
      <Seo
        title="Jordan Experiences - Authentic Adventures & Cultural Tours"
        description="Discover authentic Jordanian experiences. From Petra tours to Wadi Rum safaris, Dead Sea spas to Red Sea diving. Create unforgettable memories in Jordan."
        canonicalUrl="https://visitjo.com/experiences"
        keywords="Jordan experiences, Petra tours, Wadi Rum safari, Dead Sea spa, Red Sea diving, Jordan adventures, cultural tours"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-jordan-emerald via-jordan-teal to-jordan-blue animate-gradient-shift"></div>
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
            <Sparkles className="w-5 h-5 text-jordan-gold" />
            {t('pages.experiences.hero.kicker', 'Unforgettable Moments')}
            <Sparkles className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">{t("pages.experiences.hero.titleMain", "Go Beyond the")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {t("pages.experiences.hero.titleAccent", "Ordinary")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('pages.experiences.hero.subtitle', 'Don\'t just visit Jordan—live it. From Bedouin tea in the desert to diving in the Red Sea, create memories that last a lifetime.')}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Compass className="w-8 h-8 text-jordan-gold" />
                25+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Camera className="w-8 h-8 text-jordan-rose" />
                50+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Experiences</div>
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
                <Heart className="w-8 h-8 text-jordan-teal" />
                10K+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Happy Travelers</div>
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
            <Loader2 className="animate-spin text-purple-600" size={48} />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-6">
            {error.message || t('common.error', 'An error occurred')}
          </div>
        )}

        {!loading && (!items || items.length === 0) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏜️</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t('pages.experiences.noExperiences', 'No experiences available')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('pages.experiences.checkBackLater', 'Check back later for amazing Jordanian experiences')}
            </p>
          </div>
        )}

        {!loading && items && items.length > 0 && (
          <>
            <p className="mt-8">Found {items.length} experiences</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((experience) => (
                <article
                  key={experience.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/experiences/${experience.id}`)}
                >
                  {/* Experience Image */}
                  <div className="h-48 w-full overflow-hidden relative group">
                    {experience.imageUrl ? (
                      <OptimizedImage
                        src={experience.imageUrl}
                        alt={experience.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        sizes="100vw"
                        style={{ background: 'linear-gradient(to bottom right, #a78bfa, #f472b6, #fb923c)' }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <span className="text-4xl">✨</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 text-4xl drop-shadow-lg">
                      {/* Optionally show emoji for legacy experiences */}
                      {experience.id === 'e-petra-night' && '🏛️'}
                      {experience.id === 'e-wadi-rum-safari' && '🏜️'}
                      {experience.id === 'e-dead-sea-spa' && '🧖'}
                      {experience.id === 'e-amman-food-tour' && '🍽️'}
                      {experience.id === 'e-coral-reef-diving' && '🤿'}
                      {experience.id === 'e-jeep-adventure' && '🚙'}
                    </div>
                    <div className="absolute bottom-2 right-2 text-sm font-medium bg-black/40 text-white px-3 py-1 rounded-full">
                      {experience.price} JOD
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-purple-600 transition-colors">
                      {experience.title}
                    </h3>

                    {experience.meta && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-3">
                        {experience.meta}
                      </p>
                    )}

                    {experience.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                        {experience.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{experience.duration || 'Varies'}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          experience.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          experience.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {experience.difficulty || 'Mixed'}
                        </span>
                      </div>

                      <button
                        aria-label={`Book ${experience.title || 'experience'}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm min-h-[44px] inline-flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/experiences/${experience.id}`);
                        }}
                      >
                        {t('pages.experiences.bookNow', 'Book Now')}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
