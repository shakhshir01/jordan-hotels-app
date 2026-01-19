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
        canonicalUrl="https://vist-jo.com/destinations"
        keywords="Jordan destinations, Petra, Wadi Rum, Dead Sea, Amman, Jerash, Aqaba, Jordan travel guide, places to visit Jordan"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Simple Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-blue-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        {/* Simple Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 backdrop-blur-sm border border-emerald-300/30 rounded-full text-white text-sm font-semibold uppercase tracking-wide animate-fade-in shadow-lg">
            <Compass className="w-5 h-5 text-emerald-400" />
            {t('pages.destinations.hero.kicker', '🗺️ Explore Jordan')}
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Premium Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display mb-6 sm:mb-8 tracking-tight leading-tight animate-slide-up px-2 sm:px-0">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-100 drop-shadow-2xl mb-1 sm:mb-2">
              {t("pages.destinations.hero.titleMain", "Jordan's Iconic")}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 drop-shadow-2xl">
              {t("pages.destinations.hero.titleAccent", "Destinations")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-5xl mx-auto mb-12 sm:mb-16 text-white/95 leading-relaxed font-light animate-fade-in drop-shadow-lg px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
            {t('pages.destinations.hero.subtitle', '🏛️ From the ancient wonders of Petra to the Martian landscapes of Wadi Rum, discover Jordan\'s most breathtaking destinations with Visit-Jo\'s expert guidance.')}
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
            {/* Premium Destination Spotlight */}
            <section className="text-center pt-20 pb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Why Choose These Destinations?
              </h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Each destination offers a unique blend of history, culture, and natural beauty. Discover what makes Jordan truly extraordinary.
              </p>
              <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
            </section>

            {/* Destination Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {destinations.map((d) => {
                const IconComponent = d.icon || MapPin;
                return (
                  <article key={d.id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    {/* Simple Image Header */}
                    <div className="relative h-72 bg-green-600 flex items-center justify-center overflow-hidden">
                      {destinationImages[d.query] && (
                        <OptimizedImage
                          src={destinationImages[d.query]}
                          alt={d.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                          sizes="100vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                      {/* Premium Overlay with Enhanced Content */}
                      <div className="relative z-10 text-center text-white transform group-hover:scale-105 transition-transform duration-500">
                        <div className="text-7xl sm:text-8xl mb-4 animate-pulse-glow">{d.emoji}</div>
                        <div className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">{d.name}</div>
                        <div className="flex flex-col gap-2 mt-4">
                          <div className="inline-flex items-center gap-2 text-sm font-bold bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full shadow-sm">
                            <Star size={16} className="text-jordan-gold" />
                            {d.topRatedCount} {t('pages.destinations.topRatedHotels', 'top-rated hotels')}
                          </div>
                          {d.averageRating && (
                            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 px-3 py-1.5 rounded-full shadow-sm">
                              <span className="text-yellow-600">⭐</span>
                              {d.averageRating} {t('pages.destinations.avgRating', 'avg rating')}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Premium Content */}
                    <div className="p-8 sm:p-10">
                      <p className="text-slate-600 dark:text-slate-300 mb-8 text-base sm:text-lg leading-relaxed font-medium">
                        {d.desc}
                      </p>

                      {/* Premium Key Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-jordan-blue/20 dark:from-blue-900/30 dark:to-jordan-blue/10 rounded-2xl border border-white/20 group-hover:shadow-md transition-all duration-300">
                          <div className="p-2 bg-gradient-to-r from-jordan-blue to-blue-600 rounded-xl shadow-md">
                            <Clock className="text-white" size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{t('pages.destinations.duration', 'Duration')}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">{d.duration}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50/80 to-jordan-emerald/20 dark:from-emerald-900/30 dark:to-jordan-emerald/10 rounded-2xl border border-white/20 group-hover:shadow-md transition-all duration-300">
                          <div className="p-2 bg-gradient-to-r from-jordan-emerald to-green-600 rounded-xl shadow-md">
                            <Calendar className="text-white" size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{t('pages.destinations.bestTime', 'Best Time')}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">{d.bestTime}</div>
                          </div>
                        </div>
                      </div>

                      {/* Premium Activities */}
                      {d.activities && d.activities.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <div className="p-1.5 bg-gradient-to-r from-jordan-gold to-amber-500 rounded-lg shadow-md">
                              <Star className="text-white" size={16} />
                            </div>
                            {t('pages.destinations.activities', 'Top Activities')}
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {d.activities.slice(0, 3).map((activity, idx) => (
                              <span key={idx} className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-purple-50 to-jordan-purple/20 dark:from-purple-900/30 dark:to-jordan-purple/10 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
                                <span className="w-2 h-2 bg-gradient-to-r from-jordan-purple to-purple-500 rounded-full"></span>
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Premium Top Rated Hotels Preview */}
                      {d.topHotels && d.topHotels.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <div className="p-1.5 bg-gradient-to-r from-jordan-gold to-amber-500 rounded-lg shadow-md">
                              <Star className="text-white" size={16} />
                            </div>
                            {t('pages.destinations.topRated', 'Top Rated Hotels')}
                          </h4>
                          <div className="space-y-3">
                            {d.topHotels.slice(0, 2).map((hotel, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white/60 dark:from-slate-700/60 dark:to-slate-600/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex-1">
                                  <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                                    {hotel.name || hotel.title}
                                  </div>
                                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    {hotel.location || hotel.city}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4 px-3 py-2 bg-gradient-to-r from-jordan-gold/20 to-amber-400/20 rounded-xl border border-jordan-gold/30">
                                  <Star className="text-jordan-gold fill-current" size={14} />
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    {hotel.rating || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Premium Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => navigate(`/search?destination=${d.query}&topRated=true`)}
                          className="flex-1 bg-button-gradient hover:bg-button-hover text-white py-4 px-6 rounded-3xl font-bold text-base flex items-center justify-center gap-3 shadow-premium hover:shadow-floating transition-all duration-500 transform hover:scale-105 active:scale-95 border border-white/20"
                        >
                          <MapPin size={18} />
                          <span className="font-extrabold">{t('pages.destinations.exploreHotels')}</span>
                        </button>
                        <button
                          onClick={() => navigate(`/experiences?destination=${d.query}`)}
                          className="flex-1 bg-gradient-to-r from-jordan-purple to-purple-600 hover:from-purple-600 hover:to-jordan-purple text-white py-4 px-6 rounded-3xl font-bold text-base flex items-center justify-center gap-3 shadow-premium hover:shadow-floating transition-all duration-500 transform hover:scale-105 active:scale-95 border border-white/20"
                        >
                          <Camera size={18} />
                          <span className="font-extrabold">{t('pages.destinations.exploreExperiences', 'Explore Experiences')}</span>
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
