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
    desc: 'Float effortlessly in the mineral-rich waters of the lowest point on Earth.',
    descAr: 'اختبر أخفض نقطة على سطح الأرض بمياه غنية بالمعادن',
    nameAr: 'البحر الميت',
    emoji: '💧',
    activities: ['Spa Treatments', 'Mud Therapy', 'Floating', 'Sunbathing'],
    bestTime: 'Year-round',
    duration: '1-2 days',
    highlights: ['Lowest point on Earth', 'Therapeutic mud', 'Salt harvesting', 'Desert views'],
    icon: Waves,
  },
  'Amman': {
    desc: 'A mesmerizing blend of ancient Roman history and vibrant modern culture.',
    descAr: 'العاصمة بتاريخ روماني وأسواق نابضة بالحياة وثقافة حديثة',
    nameAr: 'عمّان',
    emoji: '🏛️',
    activities: ['Roman Theater', 'Citadel Tour', 'Souq Shopping', 'Street Food'],
    bestTime: 'March-May, Sep-Nov',
    duration: '2-3 days',
    highlights: ['Roman Theater', 'Amman Citadel', 'Rainbow Street', 'Modern art scene'],
    icon: Castle,
  },
  'Petra': {
    desc: 'Walk through history in the Rose City, a world wonder carved into red stone.',
    descAr: 'موقع تراث عالمي لليونسكو — المدينة الوردية الأسطورية المنحوتة في الصخر',
    nameAr: 'البتراء',
    emoji: '🪨',
    activities: ['Petra Tour', 'Horse Riding', 'Camel Safari', 'Bedouin Camp'],
    bestTime: 'March-May, Sep-Nov',
    duration: '1-2 days',
    highlights: ['Treasury Building', 'Monastery', 'Siq Canyon', 'Caravan routes'],
    icon: Mountain,
  },
  'Aqaba': {
    desc: 'Dive into the crystal-clear waters and vibrant coral reefs of the Red Sea.',
    descAr: 'منتجع شاطئي على البحر الأحمر مع الغوص والرياضات المائية وشعاب مرجانية خلابة',
    nameAr: 'العقبة',
    emoji: '🏖️',
    activities: ['Scuba Diving', 'Snorkeling', 'Boat Tours', 'Beach Relaxation'],
    bestTime: 'April-June, Sep-Oct',
    duration: '3-5 days',
    highlights: ['Coral reefs', 'Marine life', 'Ayla Oasis', 'Duty-free shopping'],
    icon: Sun,
  },
  'Wadi Rum': {
    desc: 'Lose yourself in the Martian landscapes of the Valley of the Moon.',
    descAr: 'مناظر صحراوية تشبه سطح المريخ ومخيمات بدوية وتجارب مغامرة',
    nameAr: 'وادي رم',
    emoji: '🏜️',
    activities: ['Desert Safari', 'Stargazing', 'Rock Climbing', 'Bedouin Experience'],
    bestTime: 'October-April',
    duration: '1-2 days',
    highlights: ['Sand dunes', 'Rock formations', 'Lawrence Spring', 'Bedouin culture'],
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
    <div className="min-h-screen">
      <Seo
        title="Explore Jordan Destinations - Petra, Wadi Rum, Dead Sea & More"
        description="Discover Jordan's most incredible destinations. From Petra's ancient wonders to Wadi Rum's desert majesty, explore the best places to visit in Jordan."
        canonicalUrl="https://visitjo.com/destinations"
        keywords="Jordan destinations, Petra, Wadi Rum, Dead Sea, Amman, Jerash, Aqaba, Jordan travel guide, places to visit Jordan"
      />
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">{t('pages.destinations.hero.kicker', 'Explore Jordan')}</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6 tracking-tight">{t('pages.destinations.hero.title', 'Journey Through Time')}</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95 leading-relaxed">
            {t('pages.destinations.hero.subtitle', 'From the bustling streets of Amman to the silent majesty of Wadi Rum, discover destinations that will capture your heart.')}
          </p>
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
            <section className="text-center">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">
                {t('pages.destinations.spotlight.title', 'Destination Spotlight')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('pages.destinations.spotlight.subtitle', 'Discover what makes each destination unique')}
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
