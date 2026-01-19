import React, { useState } from "react";
import { Link } from "react-router-dom";
import { hotelAPI } from "../services/api";
import { Plane, MapPin, Calendar, Search, ArrowRight, Clock, Users, Star, Sparkles, Loader2 } from "lucide-react";
import Seo from '../components/Seo.jsx';

export default function FlightsSearch() {
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [tripType, setTripType] = useState("round-trip");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!origin || !dest || !date) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await hotelAPI.searchFlights({
        origin,
        destination: dest,
        date,
        passengers: parseInt(passengers),
        tripType
      });
      setResults(res || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(dest);
    setDest(temp);
  };

  return (
    <div className="min-h-screen bg-light-premium dark:bg-dark-premium">
      <Seo
        title="Search Flights to Jordan - Book Cheap Flights | VisitJo"
        description="Find and book cheap flights to Jordan. Search flights to Amman, Aqaba, and all major Jordanian destinations. Best prices guaranteed."
        canonicalUrl="https://visitjo.com/flights"
        keywords="flights to Jordan, cheap flights Jordan, Amman flights, Aqaba flights, book flights Jordan"
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
            <Plane className="w-5 h-5 text-jordan-gold" />
            Flight Search
            <Plane className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">Find Your</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              Perfect Flight
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            Discover amazing flight deals to Jordan's most spectacular destinations. Book with confidence and start your adventure.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Plane className="w-8 h-8 text-jordan-blue" />
                500+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Daily Flights</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-8 h-8 text-jordan-teal" />
                25+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-jordan-rose" />
                4.8★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-jordan-gold" />
                24/7
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Support</div>
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

      {/* Enhanced Search Form */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="card-modern p-8 lg:p-10 animate-fade-in-up">
            <form onSubmit={handleSearch} className="space-y-8">
              {/* Trip Type Selector */}
              <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => setTripType('round-trip')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      tripType === 'round-trip'
                        ? 'bg-white dark:bg-slate-700 text-jordan-blue shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    Round Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('one-way')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      tripType === 'one-way'
                        ? 'bg-white dark:bg-slate-700 text-jordan-blue shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    One Way
                  </button>
                </div>
              </div>

              {/* Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Origin */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    From
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Origin city or airport"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 glass-card border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-jordan-blue focus:ring-2 focus:ring-jordan-blue/20 outline-none text-slate-900 dark:text-slate-100 transition-all duration-300 hover:shadow-floating"
                      required
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex items-end justify-center md:hidden">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="p-3 bg-jordan-blue text-white rounded-full hover:bg-jordan-teal transition-colors duration-300 shadow-lg"
                    aria-label="Swap origin and destination"
                  >
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </button>
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    To
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Destination city or airport"
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 glass-card border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-jordan-blue focus:ring-2 focus:ring-jordan-blue/20 outline-none text-slate-900 dark:text-slate-100 transition-all duration-300 hover:shadow-floating"
                      required
                    />
                  </div>
                </div>

                {/* Swap Button - Desktop */}
                <div className="hidden md:flex items-end justify-center">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="p-3 bg-jordan-blue text-white rounded-full hover:bg-jordan-teal transition-colors duration-300 shadow-lg"
                    aria-label="Swap origin and destination"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Departure Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-4 glass-card border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-jordan-blue focus:ring-2 focus:ring-jordan-blue/20 outline-none text-slate-900 dark:text-slate-100 transition-all duration-300 hover:shadow-floating"
                      required
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Passengers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 glass-card border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-jordan-blue focus:ring-2 focus:ring-jordan-blue/20 outline-none text-slate-900 dark:text-slate-100 transition-all duration-300 hover:shadow-floating appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <option key={num} value={num.toString()}>{num} Passenger{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-12 py-4 text-xl font-bold rounded-2xl hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Searching Flights...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      Search Flights
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
        {searched && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-jordan-blue mx-auto mb-4" />
                <p className="text-xl text-slate-600 dark:text-slate-300">Searching for the best flights...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Flights Found</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Try adjusting your search criteria or check back later for new flight options.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setSearched(false)}
                    className="btn-secondary px-6 py-3"
                  >
                    Modify Search
                  </button>
                  <Link to="/" className="btn-primary px-6 py-3">
                    Explore Hotels Instead
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
                    {results.length} Flight{results.length !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    Select your preferred flight to continue booking
                  </p>
                </div>

                <div className="grid gap-6">
                  {results.map((flight, index) => (
                    <article
                      key={flight.id || index}
                      className="card-modern p-6 lg:p-8 hover:shadow-premium transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Flight Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-jordan-blue to-jordan-teal rounded-2xl flex items-center justify-center">
                              <Plane className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                                {flight.airline || 'Airline'} • {flight.flightNumber || 'Flight'}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300">
                                {flight.departure || 'Origin'} → {flight.arrival || 'Destination'}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-jordan-blue" />
                              <span className="text-slate-600 dark:text-slate-300">
                                {flight.departureTime || 'Time'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-jordan-teal" />
                              <span className="text-slate-600 dark:text-slate-300">
                                {flight.duration || 'Duration'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-jordan-rose" />
                              <span className="text-slate-600 dark:text-slate-300">
                                {flight.aircraft || 'Aircraft'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-jordan-gold" />
                              <span className="text-slate-600 dark:text-slate-300">
                                {flight.seats || 'Seats'} available
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Booking */}
                        <div className="text-center lg:text-right">
                          <div className="mb-4">
                            <div className="text-3xl font-black text-jordan-gold mb-1">
                              {flight.price || 'Price'} JOD
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              per passenger
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button className="btn-secondary px-6 py-3">
                              View Details
                            </button>
                            <button className="btn-primary px-6 py-3">
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Additional Actions */}
                <div className="text-center pt-8">
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Not finding what you're looking for?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setSearched(false)}
                      className="btn-secondary px-6 py-3"
                    >
                      Modify Search
                    </button>
                    <Link to="/support" className="btn-primary px-6 py-3">
                      Get Help
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
