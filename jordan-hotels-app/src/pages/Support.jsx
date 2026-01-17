import { useTranslation } from 'react-i18next';
import { MessageCircle, Mail, Phone, Clock, Shield, Users, Zap, Heart, Sparkles, Headphones, CheckCircle, ArrowRight } from 'lucide-react';
import Seo from '../components/Seo.jsx';

export default function Support() {
  const { t } = useTranslation();

  const FAQ = [
    {
      icon: Shield,
      q: t('support.faq.cancellations.q', 'How do I cancel or modify my booking?'),
      a: t('support.faq.cancellations.a', 'You can cancel or modify your booking through your account dashboard up to 24 hours before check-in. Contact us immediately for assistance.'),
      category: 'Bookings'
    },
    {
      icon: Users,
      q: t('support.faq.bookings.q', 'What should I do if I have booking issues?'),
      a: t('support.faq.bookings.a', 'Check your booking confirmation email first. If you need help, contact our support team with your booking ID and we\'ll assist you immediately.'),
      category: 'Bookings'
    },
    {
      icon: Zap,
      q: t('support.faq.currency.q', 'What currencies do you accept?'),
      a: t('support.faq.currency.a', 'We accept major credit cards and display prices in Jordanian Dinar (JOD), US Dollar (USD), and Euro (EUR). Your bank will convert accordingly.'),
      category: 'Payments'
    },
    {
      icon: Heart,
      q: t('support.faq.problem.q', 'What if I encounter problems during my stay?'),
      a: t('support.faq.problem.a', 'Our 24/7 concierge service is available for any issues. Contact us via phone, email, or our in-app chat for immediate assistance.'),
      category: 'During Stay'
    },
  ];

  const SUPPORT_CHANNELS = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: '24/7 Available',
      action: 'Start Chat',
      primary: true,
      onClick: () => {
        console.log('Support: Live Chat button clicked, calling window.openChatBot()');
        // Use global function to open the chatbot
        if (window.openChatBot) {
          window.openChatBot();
        } else {
          console.error('Support: window.openChatBot function not available, retrying in 100ms...');
          // Retry after a short delay in case ChatBot hasn't mounted yet
          setTimeout(() => {
            if (window.openChatBot) {
              window.openChatBot();
            } else {
              console.error('Support: window.openChatBot still not available after retry');
            }
          }, 100);
        }
      }
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed inquiries anytime',
      availability: 'Response within 2 hours',
      action: 'Send Email',
      primary: false,
      onClick: () => {
        window.location.href = 'mailto:support@visitjo.com';
      }
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      availability: '9 AM - 9 PM JST',
      action: 'Call Now',
      primary: false,
      onClick: () => {
        window.location.href = 'tel:+962-6-123-4567';
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="VisitJo Support Center - 24/7 Help for Your Jordan Trip"
        description="Get instant support for your Jordan travel plans. Our expert team is here 24/7 to help with bookings, cancellations, and any questions about your trip."
        canonicalUrl="https://visitjo.com/support"
        keywords="VisitJo support, Jordan travel help, booking assistance, travel support, customer service"
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
            <Headphones className="w-5 h-5 text-jordan-gold" />
            {t('support.hero.kicker', 'We\'re Here to Help')}
            <Headphones className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">{t("support.hero.titleMain", "Support")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {t("support.hero.titleAccent", "Center")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('support.hero.subtitle', 'Have questions? We have answers. Let us help you make your trip seamless.')}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Clock className="w-8 h-8 text-jordan-blue" />
                24/7
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <CheckCircle className="w-8 h-8 text-jordan-teal" />
                2hrs
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Average Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Users className="w-8 h-8 text-jordan-rose" />
                50K+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Heart className="w-8 h-8 text-jordan-gold" />
                4.9★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Satisfaction Rate</div>
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

          {/* Support Channels */}
          <section className="animate-fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                How Can We Help You?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Choose your preferred way to get in touch. Our expert team is ready to assist you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {SUPPORT_CHANNELS.map((channel, index) => (
                <article key={channel.title} className="group card-modern p-8 lg:p-10 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${0.2 * index}s` }}>
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-jordan-blue to-jordan-teal rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <channel.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-jordan-blue transition-colors duration-300">
                    {channel.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {channel.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <Clock className="w-4 h-4" />
                    {channel.availability}
                  </div>
                  <button 
                    onClick={channel.onClick}
                    className={`w-full btn-primary px-6 py-3 text-lg font-bold rounded-2xl hover-lift group-hover:scale-105 transition-all duration-300 ${channel.primary ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {channel.action}
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Quick answers to common questions about bookings, payments, and travel
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {FAQ.map((item, index) => (
                <article key={item.q} className="group card-modern p-8 hover:shadow-floating transition-all duration-500 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-jordan-gold/20 to-jordan-rose/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-6 h-6 text-jordan-gold" />
                    </div>
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-jordan-teal/20 to-jordan-blue/20 text-jordan-teal font-semibold text-sm rounded-full mb-3">
                        {item.category}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-jordan-blue transition-colors duration-300 leading-tight">
                        {item.q}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
