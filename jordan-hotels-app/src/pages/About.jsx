import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { MapPin, Star, Users, Award, Heart, Globe, Shield, Sparkles, Crown, Gem } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <Seo
        title="About VisitJo - Your Authentic Jordan Travel Guide"
        description="Learn about VisitJo's mission to provide authentic Jordan travel experiences. Discover our commitment to showcasing Jordan's hidden gems and warm hospitality."
        canonicalUrl="https://visitjo.com/about"
        keywords="about VisitJo, Jordan travel company, authentic travel, Jordan tourism, travel platform"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-3 px-8 py-4 mb-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-white/90 text-sm font-bold uppercase tracking-widest shadow-2xl animate-fade-in">
            <Crown className="w-5 h-5 text-jordan-gold" />
            {t('pages.about.kicker', 'Authentic Jordanian Hospitality')}
            <Crown className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">{t("pages.about.titleMain", "Your Gateway to")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {t("pages.about.titleAccent", "Extraordinary Experiences")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('pages.about.intro', 'We\'re not just another booking platform. We\'re your trusted local experts, passionate storytellers, and dedicated hosts who believe that every traveler deserves to experience the real Jordan - the hidden gems, the authentic moments, and the genuine connections that transform ordinary trips into lifelong memories.')}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Gem className="w-8 h-8 text-jordan-gold" />
                750+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Verified Hotels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-8 h-8 text-jordan-rose" />
                25+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-jordan-gold" />
                4.9★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Guest Rating</div>
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

      {/* Enhanced Content Sections */}
      <div className="relative -mt-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 space-y-24">

          {/* Core Values Section */}
          <section className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group card-modern p-8 lg:p-10 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jordan-blue to-jordan-teal rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-jordan-blue transition-colors duration-300">
                {t('pages.about.cards.localFirst.title', 'Local First Approach')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('pages.about.cards.localFirst.body', 'We partner directly with local businesses and artisans, ensuring that every booking supports the Jordanian economy and preserves authentic cultural experiences.')}
              </p>
            </div>

            <div className="group card-modern p-8 lg:p-10 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jordan-rose to-jordan-gold rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-jordan-rose transition-colors duration-300">
                {t('pages.about.cards.curated.title', 'Expertly Curated')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('pages.about.cards.curated.body', 'Every hotel, experience, and destination in our collection is personally vetted by our team of local experts who know Jordan inside and out.')}
              </p>
            </div>

            <div className="group card-modern p-8 lg:p-10 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jordan-emerald to-jordan-teal rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-jordan-emerald transition-colors duration-300">
                {t('pages.about.cards.planning.title', 'Seamless Planning')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('pages.about.cards.planning.body', 'From the moment you book until you return home, our dedicated concierge team ensures every detail of your Jordan adventure is perfect.')}
              </p>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                  {t('pages.about.mission.title', 'Our Mission')}
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                  {t('pages.about.mission.body', 'To showcase the authentic beauty of Jordan while supporting local communities and preserving cultural heritage for future generations.')}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">
                  {t('pages.about.focus.title', 'What Sets Us Apart')}
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: Globe, text: t('pages.about.focus.items.0', 'Direct partnerships with local businesses') },
                    { icon: Sparkles, text: t('pages.about.focus.items.1', 'Authentic, off-the-beaten-path experiences') },
                    { icon: Users, text: t('pages.about.focus.items.2', 'Personalized recommendations from locals') },
                    { icon: Shield, text: t('pages.about.focus.items.3', '100% satisfaction guarantee') },
                    { icon: Heart, text: t('pages.about.focus.items.4', 'Sustainable tourism practices') }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-700/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/20 hover:shadow-floating transition-all duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-jordan-gold to-jordan-rose rounded-xl flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="animate-slide-in-right">
              <div className="card-modern p-8 lg:p-10 bg-gradient-to-br from-jordan-blue/5 to-jordan-teal/5 dark:from-jordan-blue/10 dark:to-jordan-teal/10">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-6 h-6 text-jordan-gold" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {t('pages.about.reviews.title', 'Trusted by Travelers Worldwide')}
                  </h3>
                </div>

                <div className="space-y-6">
                  <blockquote className="text-lg text-slate-700 dark:text-slate-200 italic leading-relaxed">
                    "{t('pages.about.reviews.body1', 'VisitJo transformed our understanding of Jordan. The authentic experiences and genuine hospitality exceeded all expectations. Every moment felt like discovering hidden treasures.')}"
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-jordan-gold to-jordan-rose rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Sarah Mitchell</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Adventure Traveler</div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-3xl font-black text-jordan-gold">4.9</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Average Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-jordan-blue">50K+</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Happy Travelers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-jordan-rose">750+</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Verified Hotels</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="text-center py-16">
            <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                  Ready to Discover Jordan?
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Join thousands of travelers who have experienced the real Jordan through VisitJo. Your extraordinary adventure awaits.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/destinations"
                    className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl hover-lift inline-block text-center"
                  >
                    Start Your Journey
                  </Link>
                  <Link
                    to="/blog"
                    className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift inline-block text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
