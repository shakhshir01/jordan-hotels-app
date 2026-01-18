import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Clock, Users, Calendar, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../components/OptimizedImage';
import Seo from '../components/Seo.jsx';

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#d67d61"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,.92)" font-family="Arial" font-size="56" text-anchor="middle" dominant-baseline="middle">VisitJo Experience</text>
  </svg>`);

export default function CityExperiences() {
  const { city } = useParams();
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        // For now, we'll use mock data since the API might not have experiences by city
        const mockExperiences = getMockExperiences(city);
        setExperiences(mockExperiences);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setExperiences([]);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchExperiences();
    }
  }, [city]);

  const getMockExperiences = (cityName) => {
    const experienceData = {
      'Petra': [
        {
          id: 'e-petra-full-day',
          name: 'Petra Full Day Tour',
          description: 'Explore the ancient Rose City with a professional guide. Walk through the Siq, visit the Treasury, Monastery, and Royal Tombs.',
          price: 85,
          duration: '8 hours',
          rating: 4.8,
          reviews: 1247,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800',
          category: 'Cultural',
          highlights: ['Professional guide', 'Siq Canyon walk', 'Treasury & Monastery', 'Lunch included']
        },
        {
          id: 'e-petra-night',
          name: 'Petra by Night',
          description: 'Experience the magical atmosphere of Petra illuminated by over 1,500 candles. A unique evening experience.',
          price: 45,
          duration: '2 hours',
          rating: 4.9,
          reviews: 892,
          image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800',
          category: 'Cultural',
          highlights: ['Candlelit atmosphere', 'Bedouin music', 'Tea ceremony', 'Magical experience']
        },
        {
          id: 'e-petra-horse',
          name: 'Petra Horse & Camel Ride',
          description: 'Ride a horse through the Siq Canyon and enjoy a traditional camel ride in the desert surroundings.',
          price: 35,
          duration: '2 hours',
          rating: 4.6,
          reviews: 567,
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
          category: 'Adventure',
          highlights: ['Horse riding', 'Camel experience', 'Siq exploration', 'Photo opportunities']
        }
      ],
      'Amman': [
        {
          id: 'e-amman-food-tour',
          name: 'Amman Food Tour',
          description: 'Discover Amman\'s culinary scene with a local guide. Visit traditional restaurants and try authentic Jordanian dishes.',
          price: 65,
          duration: '4 hours',
          rating: 4.7,
          reviews: 734,
          image: 'https://images.unsplash.com/photo-1544124099-e2d381b0410a?q=80&w=800',
          category: 'Food',
          highlights: ['Local guide', 'Traditional cuisine', 'Market visits', 'Cultural insights']
        },
        {
          id: 'e-amman-citadel',
          name: 'Amman Citadel & Roman Theater',
          description: 'Explore Amman\'s ancient history at the Citadel and Roman Theater with an archaeologist guide.',
          price: 40,
          duration: '3 hours',
          rating: 4.5,
          reviews: 623,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800',
          category: 'Cultural',
          highlights: ['Ancient ruins', 'Expert guide', 'Historical insights', 'Panoramic views']
        }
      ],
      'Dead Sea': [
        {
          id: 'e-dead-sea-spa',
          name: 'Dead Sea Spa Day',
          description: 'Relax with mineral mud treatments and flotation therapy at a luxury Dead Sea spa resort.',
          price: 120,
          duration: '6 hours',
          rating: 4.8,
          reviews: 445,
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
          category: 'Wellness',
          highlights: ['Mud therapy', 'Flotation', 'Spa treatments', 'Wellness experience']
        },
        {
          id: 'e-dead-sea-hike',
          name: 'Dead Sea Desert Hike',
          description: 'Hike through the dramatic desert landscapes surrounding the Dead Sea with stunning views.',
          price: 55,
          duration: '4 hours',
          rating: 4.4,
          reviews: 234,
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
          category: 'Adventure',
          highlights: ['Desert hiking', 'Scenic views', 'Wildlife spotting', 'Photography']
        }
      ],
      'Wadi Rum': [
        {
          id: 'e-wadi-rum-jeep',
          name: 'Wadi Rum Jeep Tour',
          description: 'Explore the Martian-like desert landscapes of Wadi Rum in a 4x4 vehicle with a Bedouin guide.',
          price: 75,
          duration: '4 hours',
          rating: 4.9,
          reviews: 1234,
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
          category: 'Adventure',
          highlights: ['4x4 tour', 'Bedouin guide', 'Desert landscapes', 'Photo stops']
        },
        {
          id: 'e-wadi-rum-camp',
          name: 'Wadi Rum Overnight Camp',
          description: 'Stay overnight in a traditional Bedouin camp with stargazing, dinner, and desert activities.',
          price: 150,
          duration: '24 hours',
          rating: 4.8,
          reviews: 678,
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
          category: 'Adventure',
          highlights: ['Bedouin camp', 'Stargazing', 'Traditional dinner', 'Desert activities']
        }
      ],
      'Aqaba': [
        {
          id: 'e-aqaba-diving',
          name: 'Aqaba Scuba Diving',
          description: 'Discover the vibrant coral reefs of the Red Sea with a PADI certified diving instructor.',
          price: 95,
          duration: '6 hours',
          rating: 4.7,
          reviews: 345,
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',
          category: 'Adventure',
          highlights: ['Scuba diving', 'Coral reefs', 'Marine life', 'Professional instruction']
        },
        {
          id: 'e-aqaba-boat',
          name: 'Aqaba Boat Tour',
          description: 'Cruise the Red Sea coastline, visit coral reefs, and enjoy snorkeling in crystal-clear waters.',
          price: 60,
          duration: '4 hours',
          rating: 4.6,
          reviews: 456,
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
          category: 'Adventure',
          highlights: ['Boat cruise', 'Snorkeling', 'Coral reefs', 'Marine wildlife']
        }
      ]
    };

    return experienceData[cityName] || [];
  };

  const filteredExperiences = experiences.filter(exp => {
    return category === 'all' || exp.category.toLowerCase() === category.toLowerCase();
  });

  const cityDisplayName = city?.replace(/%20/g, ' ') || '';

  const getCityDescription = (cityName) => {
    const descriptions = {
      'Petra': 'Discover unforgettable experiences in the ancient Rose City. From guided tours to adventure activities, explore Petra like never before.',
      'Amman': 'Experience the vibrant culture and history of Jordan\'s capital. Join food tours, archaeological explorations, and cultural experiences.',
      'Dead Sea': 'Relax and rejuvenate with wellness experiences at the lowest point on Earth. Spa treatments and desert adventures await.',
      'Wadi Rum': 'Embark on desert adventures in the Martian landscapes of Wadi Rum. Jeep tours, camping, and Bedouin hospitality.',
      'Aqaba': 'Dive into adventure in the Red Sea paradise of Aqaba. Scuba diving, boat tours, and marine explorations.',
      'Jerash': 'Step back in time with archaeological tours and cultural experiences near the ancient city of Jerash.'
    };
    return descriptions[cityName] || `Discover amazing experiences in ${cityName}, Jordan.`;
  };

  const categories = ['all', 'Cultural', 'Adventure', 'Food', 'Wellness'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title={`Best Tours & Experiences in ${cityDisplayName} | VisitJo`}
        description={getCityDescription(cityDisplayName)}
        canonicalUrl={`https://visitjo.com/cities/${city}/experiences`}
        keywords={`tours in ${cityDisplayName}, ${cityDisplayName} experiences, ${cityDisplayName} activities, Jordan tours, ${cityDisplayName} adventures`}
      />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/experiences"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Experiences
          </Link>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black font-display mb-6 tracking-tight leading-tight">
            <span className="block text-white drop-shadow-2xl mb-2">Experiences in</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {cityDisplayName}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl lg:text-3xl max-w-4xl mx-auto mb-12 text-white/90 leading-relaxed font-light drop-shadow-lg">
            {getCityDescription(cityDisplayName)}
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 mt-16">

          {/* Category Filter */}
          <div className="card-modern p-6 mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    category === cat
                      ? 'bg-jordan-blue text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All Experiences' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Experiences Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jordan-blue"></div>
            </div>
          ) : (
            <>
              {filteredExperiences.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">No experiences found</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">Try selecting a different category or explore other destinations.</p>
                  <Link to="/experiences" className="btn-primary">
                    Explore All Experiences
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredExperiences.map((experience) => (
                    <div key={experience.id} className="card-modern overflow-hidden hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <OptimizedImage
                          src={experience.image || FALLBACK_IMG}
                          alt={experience.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-900">
                          {experience.price} JOD
                        </div>
                        <div className="absolute top-4 right-4 bg-jordan-blue/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white">
                          {experience.category}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                          {experience.name}
                        </h3>

                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-jordan-blue" />
                          {cityDisplayName}, Jordan
                        </p>

                        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {experience.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            {experience.rating} ({experience.reviews})
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                          {experience.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {experience.highlights.slice(0, 2).map((highlight, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>

                        <Link
                          to={`/experiences/book/${experience.id}`}
                          className="btn-primary w-full text-center"
                        >
                          Book Experience
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Related Cities */}
          <section className="mt-16">
            <div className="card-modern p-8">
              <h2 className="text-3xl font-black mb-8 gradient-text text-center">
                Explore Experiences in Other Cities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Petra', 'Amman', 'Dead Sea', 'Wadi Rum', 'Aqaba'].filter(c => c !== cityDisplayName).slice(0, 3).map((otherCity) => (
                  <Link
                    key={otherCity}
                    to={`/cities/${encodeURIComponent(otherCity)}/experiences`}
                    className="group card-modern p-6 hover:shadow-premium transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-jordan-blue to-jordan-teal flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-jordan-blue transition-colors">
                          Experiences in {otherCity}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {otherCity === 'Petra' ? 'Ancient wonders & culture' :
                           otherCity === 'Amman' ? 'Food & historical tours' :
                           otherCity === 'Dead Sea' ? 'Wellness & desert activities' :
                           otherCity === 'Wadi Rum' ? 'Desert adventures' :
                           'Marine & water activities'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}