import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Camera, Star, Clock, Users, Calendar, ArrowRight, Compass, Mountain, Waves, Castle, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hotelAPI } from "../services/api";
import destinationImages from '../data/destination-images.json';
import OptimizedImage from '../components/OptimizedImage';
import Seo from '../components/Seo.jsx';

const DESTINATION_DETAILS = {
  'Dead Sea': {
    desc: 'Experience the world\'s most extraordinary spa treatment at 1,412 feet below sea level. Float effortlessly in mineral-rich waters that heal and rejuvenate, surrounded by dramatic desert landscapes and ancient salt formations.',
    descAr: 'اختبر أخفض نقطة على سطح الأرض بمياه غنية بالمعادن',
    nameAr: 'البحر الميت',
    emoji: '💧',
    activities: ['Therapeutic Spa Treatments', 'Mud Therapy & Skin Care', 'Floating Meditation', 'Sunset Desert Walks'],
    bestTime: 'Year-round',
    duration: '1-2 days',
    highlights: ['Lowest point on Earth', 'Therapeutic mud baths', 'Salt harvesting traditions', 'Stunning desert sunsets'],
    icon: Waves,
  },
  'Amman': {
    desc: 'Jordan\'s vibrant capital blends 7,000 years of history with modern sophistication. Wander through ancient Roman theaters, explore bustling souqs, and discover world-class museums in this fascinating city of contrasts.',
    descAr: 'العاصمة بتاريخ روماني وأسواق نابضة بالحياة وثقافة حديثة',
    nameAr: 'عمّان',
    emoji: '🏛️',
    activities: ['Roman Theater Exploration', 'Citadel Archaeological Site', 'Rainbow Street Shopping', 'Contemporary Art Galleries'],
    bestTime: 'March-May, Sep-Nov',
    duration: '2-3 days',
    highlights: ['Roman Theater & Citadel', 'Rainbow Street nightlife', 'Modern art scene', 'Culinary adventures'],
    icon: Castle,
  },
  'Petra': {
    desc: 'Marvel at one of the world\'s most spectacular archaeological sites - the Rose City carved directly into vibrant red sandstone cliffs. Walk through 2,000 years of history in this UNESCO World Heritage wonder.',
    descAr: 'موقع تراث عالمي لليونسكو — المدينة الوردية الأسطورية المنحوتة في الصخر',
    nameAr: 'البتراء',
    emoji: '🪨',
    activities: ['Petra Archaeological Park Tour', 'Horse & Camel Riding', 'Bedouin Camp Experience', 'Siq Canyon Exploration'],
    bestTime: 'March-May, Sep-Nov',
    duration: '1-2 days',
    highlights: ['Treasury & Monastery', 'Siq Canyon entrance', 'Caravan trade routes', 'Bedouin hospitality'],
    icon: Mountain,
  },
  'Aqaba': {
    desc: 'Jordan\'s only coastal city offers pristine Red Sea diving, luxury beach resorts, and duty-free shopping. Explore vibrant coral reefs, relax on golden beaches, and experience underwater adventures in crystal-clear waters.',
    descAr: 'منتجع شاطئي على البحر الأحمر مع الغوص والرياضات المائية وشعاب مرجانية خلابة',
    nameAr: 'العقبة',
    emoji: '🏖️',
    activities: ['Scuba Diving & Snorkeling', 'Boat Tours & Yachting', 'Beach Relaxation', 'Duty-Free Shopping'],
    bestTime: 'April-June, Sep-Oct',
    duration: '3-5 days',
    highlights: ['Vibrant coral reefs', 'Marine biodiversity', 'Ayla Oasis development', 'Duty-free paradise'],
    icon: Sun,
  },
  'Wadi Rum': {
    desc: 'Venture into a desert wilderness that inspired T.E. Lawrence and served as a filming location for Star Wars and The Martian. Camp under star-filled skies and experience authentic Bedouin hospitality.',
    descAr: 'مناظر صحراوية تشبه سطح المريخ ومخيمات بدوية وتجارب مغامرة',
    nameAr: 'وادي رم',
    emoji: '🏜️',
    activities: ['4x4 Desert Safari', 'Stargazing & Astronomy', 'Rock Climbing Adventures', 'Traditional Bedouin Meals'],
    bestTime: 'October-April',
    duration: '1-2 days',
    highlights: ['Massive sand dunes', 'Ancient rock formations', 'Lawrence Spring', 'Authentic Bedouin culture'],
    icon: Compass,
  },
};

export default function Destinations() {
  const navigate = useNavigate();
  const [destinationsData, setDestinationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const loadDestinationData = useCallback(async () => {
      try {
        setError("");
        setLoading(true);

        // Get destination data by searching for each destination
        const destinationPromises = Object.keys(DESTINATION_DETAILS).map(async (destName) => {
          try {
            const searchResults = await hotelAPI.searchHotelsPage({ q: destName, limit: 50 });
            const hotels = Array.isArray(searchResults?.hotels) ? searchResults.hotels : [];

            // Filter for highly-rated hotels (4.5+ stars) and sort by rating
            const topRated = hotels
              .filter(hotel => hotel.rating && typeof hotel.rating === 'number' && hotel.rating >= 4.5)
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 10); // Top 10 highly-rated hotels

            return {
              destName,
              topRated,
              totalFound: hotels.length
            };
          } catch (e) {
            console.warn(`Failed to load hotels for ${destName}:`, e);
            return { destName, topRated: [], totalFound: 0 };
          }
        });

        const destinationResults = await Promise.all(destinationPromises);

        // Process results
        const processedDestinations = destinationResults
          .filter(result => result.topRated.length > 0)
          .map(({ destName, topRated }) => {
            const details = DESTINATION_DETAILS[destName] || {};

            return {
              id: `dest-${destName.toLowerCase().replace(/\s+/g, '-')}`,
              query: destName,
              name: isArabic ? (details.nameAr || destName) : destName,
              topRatedCount: topRated.length,
              averageRating: topRated.length > 0
                ? (topRated.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / topRated.length).toFixed(1)
                : null,
              emoji: details.emoji,
              desc: isArabic
                ? (details.descAr || details.desc)
                : details.desc,
              activities: details.activities || [],
              bestTime: details.bestTime || '',
              duration: details.duration || '',
              highlights: details.highlights || [],
              icon: details.icon,
              topHotels: topRated.slice(0, 3) // Show top 3 for preview
            };
          });

        setDestinationsData(processedDestinations);
      } catch (e) {
        console.error('Error loading destinations:', e);
        setDestinationsData([]);
        setError(e?.message || "Failed to load destinations");
      } finally {
        setLoading(false);
      }
    }, [isArabic]);

  useEffect(() => {
    loadDestinationData();
  }, [loadDestinationData]);

  // Use the processed destinations data
  const destinations = destinationsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Explore Jordan Destinations - Petra, Wadi Rum, Dead Sea & More"
        description="Discover Jordan's most incredible destinations. From Petra's ancient wonders to Wadi Rum's desert majesty, explore the best places to visit in Jordan."
        canonicalUrl="https://visitjo.com/destinations"
        keywords="Jordan destinations, Petra, Wadi Rum, Dead Sea, Amman, Jerash, Aqaba, Jordan travel guide, places to visit Jordan"
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
            <Compass className="w-5 h-5 text-jordan-gold" />
            {t('pages.destinations.hero.kicker', 'Explore the Extraordinary')}
            <Compass className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">{t("pages.destinations.hero.titleMain", "Jordan's Iconic")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {t("pages.destinations.hero.titleAccent", "Destinations")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('pages.destinations.hero.subtitle', 'From the rose-red city of Petra to the Martian landscapes of Wadi Rum, embark on a journey through Jordan\'s most breathtaking and historically rich destinations. Each place tells a story of ancient civilizations, natural wonders, and unforgettable adventures.')}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Mountain className="w-8 h-8 text-jordan-gold" />
                25+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Castle className="w-8 h-8 text-jordan-rose" />
                750+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Verified Hotels</div>
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
                <Users className="w-8 h-8 text-jordan-teal" />
                50K+
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        )}
        {!loading && error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}
        {!loading && (
          <div className="space-y-12">
            {/* Featured Destination Spotlight */}
            <section className="text-center pt-64">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">
                {t('pages.destinations.spotlight.title', 'Why Choose These Destinations?')}
              </h2>
              <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
                {t('pages.destinations.spotlight.subtitle', 'Each destination offers a unique blend of history, culture, and natural beauty. Discover what makes Jordan truly extraordinary.')}
              </p>
            </section>

            {/* Destination Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {destinations.map((d) => {
                const IconComponent = d.icon || MapPin;
                return (
                  <article key={d.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Image Header */}
                    <div className="relative h-64 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-105 transition duration-300">
                      {destinationImages[d.query] && (
                        <OptimizedImage
                          src={destinationImages[d.query]}
                          alt={d.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                          sizes="100vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative z-10 text-center text-white">
                        <div className="text-6xl mb-2">{d.emoji}</div>
                        <div className="text-2xl font-bold">{d.name}</div>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="text-sm opacity-90 bg-black/20 px-3 py-1 rounded-full inline-block">
                            {d.topRatedCount} {t('pages.destinations.topRatedHotels', 'top-rated hotels')}
                          </div>
                          {d.averageRating && (
                            <div className="text-xs opacity-75 bg-black/20 px-2 py-1 rounded-full inline-block">
                              ⭐ {d.averageRating} {t('pages.destinations.avgRating', 'avg rating')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                        {d.desc}
                      </p>

                      {/* Key Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="text-blue-500" size={16} />
                          <span className="text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-900 dark:text-slate-100">{t('pages.destinations.duration', 'Duration')}:</strong> {d.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="text-green-500" size={16} />
                          <span className="text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-900 dark:text-slate-100">{t('pages.destinations.bestTime', 'Best Time')}:</strong> {d.bestTime}
                          </span>
                        </div>
                      </div>

                      {/* Activities */}
                      {d.activities && d.activities.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                            <Star className="text-yellow-500" size={16} />
                            {t('pages.destinations.activities', 'Top Activities')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {d.activities.slice(0, 3).map((activity, idx) => (
                              <span key={idx} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top Rated Hotels Preview */}
                      {d.topHotels && d.topHotels.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                            <Star className="text-yellow-500" size={16} />
                            {t('pages.destinations.topRated', 'Top Rated Hotels')}
                          </h4>
                          <div className="space-y-2">
                            {d.topHotels.slice(0, 2).map((hotel, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {hotel.name || hotel.title}
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {hotel.location || hotel.city}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <Star className="text-yellow-500 fill-current" size={12} />
                                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {hotel.rating || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/search?destination=${d.query}&topRated=true`)}
                          className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl hover:bg-emerald-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <MapPin size={16} />
                          {t('pages.destinations.exploreHotels')}
                        </button>
                        <button
                          onClick={() => navigate(`/experiences?destination=${d.query}`)}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <Camera size={16} />
                          {t('pages.destinations.exploreExperiences', 'Explore Experiences')}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Travel Tips Section */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {t('pages.destinations.tips.title', 'Travel Smart')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                {t('pages.destinations.tips.subtitle', 'Get the most out of your Jordan adventure with these insider tips')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                  <div className="text-3xl mb-3">🗺️</div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {t('pages.destinations.tips.plan', 'Plan Your Route')}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('pages.destinations.tips.planDesc', 'Jordan is compact but destinations are spread out. Plan your itinerary to minimize travel time.')}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                  <div className="text-3xl mb-3">🌤️</div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {t('pages.destinations.tips.weather', 'Check the Weather')}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('pages.destinations.tips.weatherDesc', 'Temperatures vary greatly. Summer heat can be intense, while winter brings rain.')}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                  <div className="text-3xl mb-3">🎫</div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {t('pages.destinations.tips.book', 'Book in Advance')}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('pages.destinations.tips.bookDesc', 'Popular sites like Petra fill up quickly. Book tickets and tours ahead for peak season.')}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
