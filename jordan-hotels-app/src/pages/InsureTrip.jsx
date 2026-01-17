import React, { useState } from 'react';
import { Shield, Heart, Star, CheckCircle, Sparkles, MapPin, Plane, Users, Clock, Award, ArrowRight } from 'lucide-react';
import Seo from '../components/Seo.jsx';

export default function InsureTrip() {
  const [selected, setSelected] = useState('standard');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 25,
      tagline: 'Essential Protection',
      icon: Shield,
      color: 'from-jordan-blue to-jordan-teal',
      coverage: [
        'Trip Cancellation',
        'Medical Coverage',
        'Baggage Loss'
      ],
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 45,
      tagline: 'Complete Coverage',
      icon: Heart,
      color: 'from-jordan-teal to-jordan-emerald',
      coverage: [
        'Trip Cancellation',
        'Medical Coverage',
        'Baggage Loss',
        'Flight Delay',
        'Emergency Evacuation'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 75,
      tagline: 'Ultimate Peace of Mind',
      icon: Star,
      color: 'from-jordan-gold to-jordan-rose',
      coverage: [
        'Trip Cancellation',
        'Medical Coverage',
        'Baggage Loss',
        'Flight Delay',
        'Emergency Evacuation',
        'Travel Assistance 24/7',
        'Rental Car Coverage'
      ],
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Jordan Travel Insurance - Protect Your Trip | VisitJo"
        description="Get comprehensive travel insurance for your Jordan adventure. Coverage for trip cancellations, medical emergencies, and more. Peace of mind for your Petra and Wadi Rum journey."
        canonicalUrl="https://visitjo.com/insurance"
        keywords="Jordan travel insurance, trip protection, medical coverage, travel insurance Jordan, Petra insurance"
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
            <Shield className="w-5 h-5 text-jordan-gold" />
            Travel Protection
            <Shield className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">Travel</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              Insurance
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            Protect your Jordan adventure with comprehensive coverage. From Petra explorations to Dead Sea relaxation, travel with confidence.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Users className="w-8 h-8 text-jordan-blue" />
                50K+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Trips Protected</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <CheckCircle className="w-8 h-8 text-jordan-teal" />
                99.9%
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Claim Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Clock className="w-8 h-8 text-jordan-rose" />
                24/7
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Emergency Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Award className="w-8 h-8 text-jordan-gold" />
                4.8★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Customer Rating</div>
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

          {/* Insurance Plans */}
          <section className="animate-fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Choose Your Protection
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Comprehensive coverage options designed specifically for Jordan travelers
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {plans.map((plan, index) => (
                <article
                  key={plan.id}
                  className={`group relative card-modern p-8 lg:p-10 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up ${
                    plan.popular ? 'ring-2 ring-jordan-gold shadow-premium' : ''
                  }`}
                  style={{ animationDelay: `${0.2 * index}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-jordan-gold to-jordan-rose text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                      {plan.tagline}
                    </p>
                    <div className="text-center mb-6">
                      <span className="text-5xl font-black text-jordan-gold">${plan.price}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-lg">/person</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.coverage.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-jordan-teal mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelected(plan.id)}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover-lift ${
                      selected === plan.id
                        ? 'bg-gradient-to-r from-jordan-gold to-jordan-rose text-white shadow-premium'
                        : 'bg-gradient-to-r from-jordan-blue to-jordan-teal text-white hover:shadow-floating'
                    }`}
                  >
                    {selected === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Why Jordan Travelers Choose Us
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Specialized insurance coverage designed for the unique adventures of Jordan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center group hover:shadow-floating transition-all duration-500 hover:-translate-y-1">
                <MapPin className="w-12 h-12 text-jordan-blue mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3">Local Expertise</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Coverage tailored for Jordan's unique destinations, from Petra's ancient ruins to Wadi Rum's desert landscapes.
                </p>
              </div>

              <div className="card-modern p-8 text-center group hover:shadow-floating transition-all duration-500 hover:-translate-y-1">
                <Plane className="w-12 h-12 text-jordan-teal mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3">24/7 Support</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Round-the-clock assistance in multiple languages, with local emergency contacts and medical facilities knowledge.
                </p>
              </div>

              <div className="card-modern p-8 text-center group hover:shadow-floating transition-all duration-500 hover:-translate-y-1">
                <Sparkles className="w-12 h-12 text-jordan-gold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3">Quick Claims</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Fast, hassle-free claims process with dedicated support for Jordan-based incidents and emergencies.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift">
              <div className="max-w-3xl mx-auto">
                <Shield className="w-16 h-16 text-white mx-auto mb-6" />
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  Travel with Confidence
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Don't let unexpected events ruin your Jordan adventure. Get comprehensive protection and focus on creating memories.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                    Compare Plans
                  </button>
                  <button className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                    Get Protected Now
                    <ArrowRight className="w-5 h-5 ml-2" />
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
