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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Seo
        title="Jordan Experiences - Authentic Adventures & Cultural Tours"
        description="Discover authentic Jordanian experiences. From Petra tours to Wadi Rum safaris, Dead Sea spas to Red Sea diving. Create unforgettable memories in Jordan."
        canonicalUrl="https://visitjo.com/experiences"
        keywords="Jordan experiences, Petra tours, Wadi Rum safari, Dead Sea spa, Red Sea diving, Jordan adventures, cultural tours"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Simple Background */}
        <div className="absolute inset-0 bg-green-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Clean Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Simple Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-semibold uppercase tracking-wide animate-fade-in">
            <Sparkles className="w-5 h-5" />
            {t('pages.experiences.hero.kicker', 'Unforgettable Moments')}
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Simple Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display mb-6 sm:mb-8 tracking-tight leading-tight animate-slide-up px-2 sm:px-0">
            <span className="block text-white drop-shadow-2xl mb-1 sm:mb-2">
              {t("pages.experiences.hero.titleMain", "Go Beyond the")}
            </span>
            <span className="block text-white drop-shadow-2xl">
              {t("pages.experiences.hero.titleAccent", "Ordinary")}
            </span>
          </h1>

          {/* Simple Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto mb-12 sm:mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
            {t('pages.experiences.hero.subtitle', 'Don\'t just visit Jordan—live it. From Bedouin tea in the desert to diving in the Red Sea, create memories that last a lifetime.')}
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
                        style={{ background: '#f3f4f6' }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-400 flex items-center justify-center">
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
