/// <reference path="../types/globals.d.ts" />

import { useTranslation } from 'react-i18next';
import { MessageCircle, Mail, Phone, Clock, Shield, Users, Zap, Heart, Sparkles, Headphones, CheckCircle, ArrowRight } from 'lucide-react';
import Seo from '../components/Seo.jsx';

export default function Support() {
  const { t } = useTranslation();

  const FAQ = [
    {
      icon: Shield,
      q: t('support.faq.cancellations.q', 'How do cancellations and changes work?'),
      a: t('support.faq.cancellations.a', 'Each booking clearly shows if it is flexible or non‑refundable. Flexible stays usually allow changes up to a certain time before check‑in.'),
      category: 'Bookings'
    },
    {
      icon: Users,
      q: t('support.faq.bookings.q', 'Where can I see my bookings?'),
      a: t('support.faq.bookings.a', 'Open your Profile and go to the My Bookings section. From there you can review details and, where supported, request cancellation.'),
      category: 'Bookings'
    },
    {
      icon: Zap,
      q: t('support.faq.currency.q', 'Do you support multi‑currency?'),
      a: t('support.faq.currency.a', 'Prices are shown in Jordanian Dinar (JOD) for now. Your bank or card provider may convert from your home currency.'),
      category: 'Payments'
    },
    {
      icon: Heart,
      q: t('support.faq.problem.q', 'Something is wrong with my stay—what should I do?'),
      a: t('support.faq.problem.a', 'First, speak to the property directly so they can resolve it quickly. If you still need help, contact Visit-Jo support with your booking ID.'),
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
        // Track contact form submission
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'contact_submit', {
            event_category: 'engagement',
            event_label: 'Contact Form'
          });
        }
        window.location.href = 'mailto:support@vist-jo.com';
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

  // FAQ Structured Data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Visit-Jo Support Center - 24/7 Help for Your Jordan Trip"
        description="Get instant support for your Jordan travel plans. Our expert team is here 24/7 to help with bookings, cancellations, and any questions about your trip."
        canonicalUrl="https://vist-jo.com/support"
        keywords="Visit-Jo support, Jordan travel help, booking assistance, travel support, customer service"
        structuredData={[faqStructuredData]}
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
          <section className="animate-fade-in-up pt-64">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-8 leading-tight">
                How Can We Help You?
              </h2>
              <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-200 max-w-4xl mx-auto leading-relaxed">
                Choose your preferred way to get in touch. Our expert team is ready to assist you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {SUPPORT_CHANNELS.map((channel, index) => (
                <article key={channel.title} className="group bg-white dark:bg-gray-800 rounded-lg p-6 lg:p-8 shadow-md hover:shadow-lg transition-shadow duration-200" style={{ animationDelay: `${0.2 * index}s` }}>
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
          <section className="animate-fade-in-up mt-16 lg:mt-24 pt-64" style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-slate-100 mb-4 lg:mb-6 leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 max-w-4xl mx-auto px-4 leading-relaxed">
                Quick answers to common questions about bookings, payments, and travel
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-4 lg:px-0">
              {FAQ.map((item, index) => (
                <article key={item.q} className="group bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[180px] lg:min-h-[200px]" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-jordan-gold/20 to-jordan-rose/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-6 h-6 lg:w-7 lg:h-7 text-jordan-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-jordan-teal/20 to-jordan-blue/20 text-jordan-teal font-semibold text-sm rounded-full mb-3">
                        {item.category}
                      </span>
                      <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-jordan-blue transition-colors duration-300 leading-tight">
                        {item.q}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm lg:text-base">
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
