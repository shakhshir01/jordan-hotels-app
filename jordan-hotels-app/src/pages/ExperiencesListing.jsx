import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Clock, Star } from "lucide-react";
import { hotelAPI } from "../services/api";
import { useTranslation } from "react-i18next";

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

  console.log('ExperiencesListing - loading:', loading, 'error:', error, 'items:', items);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">
            {t('pages.experiences.hero.kicker', 'Unforgettable Moments')}
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6 tracking-tight">
            {t('pages.experiences.hero.title', 'Go Beyond the Ordinary')}
          </h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95 leading-relaxed">
            {t('pages.experiences.hero.subtitle', 'Don\'t just visit Jordan—live it. From Bedouin tea in the desert to diving in the Red Sea, create memories that last a lifetime.')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
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
            <p>Found {items.length} experiences</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((experience) => (
                <article
                  key={experience.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/experiences/${experience.id}`)}
                >
                  {/* Experience Image/Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">
                        {experience.id === 'e-petra-night' && '🏛️'}
                        {experience.id === 'e-wadi-rum-safari' && '🏜️'}
                        {experience.id === 'e-dead-sea-spa' && '🧖'}
                        {experience.id === 'e-amman-food-tour' && '🍽️'}
                        {experience.id === 'e-coral-reef-diving' && '🤿'}
                        {experience.id === 'e-jeep-adventure' && '🚙'}
                        {!['e-petra-night', 'e-wadi-rum-safari', 'e-dead-sea-spa', 'e-amman-food-tour', 'e-coral-reef-diving', 'e-jeep-adventure'].includes(experience.id) && '✨'}
                      </div>
                      <div className="text-sm font-medium bg-black/20 px-3 py-1 rounded-full inline-block">
                        {experience.price} JOD
                      </div>
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
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
