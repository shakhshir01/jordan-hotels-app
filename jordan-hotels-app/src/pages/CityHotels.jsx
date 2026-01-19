import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Filter, Search } from 'lucide-react';
import { hotelAPI } from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import Seo from '../components/Seo.jsx';

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#d67d61"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,.92)" font-family="Arial" font-size="56" text-anchor="middle" dominant-baseline="middle">VisitJo Hotel</text>
  </svg>`);

export default function CityHotels() {
  const { city } = useParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await hotelAPI.searchHotels({
          location: city,
          limit: 50
        });
        setHotels(response.hotels || []);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchHotels();
    }
  }, [city]);

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = !searchTerm ||
      hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'budget' && hotel.price <= 50) ||
      (priceRange === 'mid' && hotel.price > 50 && hotel.price <= 150) ||
      (priceRange === 'luxury' && hotel.price > 150);

    return matchesSearch && matchesPrice;
  });

  const cityDisplayName = city?.replace(/%20/g, ' ') || '';

  // City descriptions
  const getCityDescription = (cityName) => {
    const descriptions = {
      'Petra': 'Discover luxury hotels near the ancient Rose City. Experience world-class accommodations just steps from Petra\'s magnificent archaeological wonders.',
      'Amman': 'Find the best hotels in Jordan\'s vibrant capital. From boutique stays to luxury resorts, explore Amman\'s diverse accommodation options.',
      'Dead Sea': 'Relax in premium hotels along the Dead Sea shores. Enjoy healing mineral waters and stunning desert views at these exclusive properties.',
      'Wadi Rum': 'Stay in authentic desert camps and luxury resorts in Wadi Rum. Experience Bedouin hospitality amidst Martian-like landscapes.',
      'Aqaba': 'Book beachfront hotels in Aqaba. Enjoy Red Sea diving, water sports, and luxury accommodations by the sea.',
      'Jerash': 'Find comfortable hotels near the ancient city of Jerash. Explore Roman ruins and stay in modern accommodations nearby.'
    };
    return descriptions[cityName] || `Discover the best hotels in ${cityName}, Jordan.`;
  };

  const getCityHighlights = (cityName) => {
    const highlights = {
      'Petra': ['Petra Archaeological Park access', 'Desert views', 'Local Bedouin culture', 'Adventure activities'],
      'Amman': ['City center location', 'Roman Theater proximity', 'Modern amenities', 'Cultural experiences'],
      'Dead Sea': ['Spa facilities', 'Private beaches', 'Wellness treatments', 'Sunset views'],
      'Wadi Rum': ['Desert camping', 'Star gazing', 'Jeep tours', 'Bedouin hospitality'],
      'Aqaba': ['Beach access', 'Diving centers', 'Water sports', 'Marina views'],
      'Jerash': ['Historical site access', 'Roman ruins nearby', 'Cultural tours', 'Local cuisine']
    };
    return highlights[cityName] || ['Premium accommodations', 'Local experiences', 'Quality service'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title={`Hotels in ${cityDisplayName} - Best Accommodations | VisitJo`}
        description={getCityDescription(cityDisplayName)}
        canonicalUrl={`https://vist-jo.com/cities/${city}/hotels`}
        keywords={`hotels in ${cityDisplayName}, ${cityDisplayName} accommodation, luxury hotels ${cityDisplayName}, ${cityDisplayName} resorts, Jordan hotels`}
      />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Destinations
          </Link>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black font-display mb-6 tracking-tight leading-tight">
            <span className="block text-white drop-shadow-2xl mb-2">Hotels in</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {cityDisplayName}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl lg:text-3xl max-w-4xl mx-auto mb-12 text-white/90 leading-relaxed font-light drop-shadow-lg">
            {getCityDescription(cityDisplayName)}
          </p>

          {/* City Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {getCityHighlights(cityDisplayName).map((highlight, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 mt-16">

          {/* Filters */}
          <div className="card-modern p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search hotels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-jordan-blue focus:border-transparent"
                  />
                </div>

                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-jordan-blue focus:border-transparent"
                >
                  <option value="all">All Prices</option>
                  <option value="budget">Budget (≤50 JOD)</option>
                  <option value="mid">Mid-range (51-150 JOD)</option>
                  <option value="luxury">Luxury (≥151 JOD)</option>
                </select>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300">
                {filteredHotels.length} hotels found
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jordan-blue"></div>
            </div>
          ) : (
            <>
              {filteredHotels.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">No hotels found</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">Try adjusting your search criteria or explore other destinations.</p>
                  <Link to="/destinations" className="btn-primary">
                    Explore All Destinations
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredHotels.map((hotel) => (
                    <div key={hotel.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <OptimizedImage
                          src={hotel.images?.[0] || FALLBACK_IMG}
                          alt={hotel.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {hotel.price && (
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-900">
                            {hotel.price} JOD/night
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                          {hotel.name}
                        </h3>

                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-jordan-blue" />
                          {hotel.location}, Jordan
                        </p>

                        {hotel.rating && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(hotel.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {hotel.rating}/5
                            </span>
                          </div>
                        )}

                        {hotel.description && (
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                            {hotel.description}
                          </p>
                        )}

                        <Link
                          to={`/hotels/${hotel.id}`}
                          className="btn-primary w-full text-center"
                        >
                          View Details
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
                Explore Hotels in Other Cities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Petra', 'Amman', 'Dead Sea', 'Wadi Rum', 'Aqaba'].filter(c => c !== cityDisplayName).slice(0, 3).map((otherCity) => (
                  <Link
                    key={otherCity}
                    to={`/cities/${encodeURIComponent(otherCity)}/hotels`}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-jordan-blue to-jordan-teal flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-jordan-blue transition-colors">
                          Hotels in {otherCity}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {otherCity === 'Petra' ? 'Near ancient wonders' :
                           otherCity === 'Amman' ? 'Capital city luxury' :
                           otherCity === 'Dead Sea' ? 'Spa & wellness resorts' :
                           otherCity === 'Wadi Rum' ? 'Desert camp experiences' :
                           'Beachfront properties'}
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