import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Seo from '../components/Seo.jsx';
import { BookOpen, MapPin, Camera, Coffee, Star, Clock, ArrowRight, Sparkles, Compass, Heart } from 'lucide-react';

const POSTS = [
  {
    slug: "petra-guide",
    title: "A practical Petra guide",
    titleAr: "دليل عملي للبتراء",
    meta: "Routes, timing, and tickets",
    metaAr: "المسارات والتوقيت والتذاكر",
    readTime: "8 min read",
    category: "Destinations",
    featured: true,
    image: "🏛️",
    excerpt: "Everything you need to know for an unforgettable visit to the Rose City"
  },
  {
    slug: "wadi-rum-camps",
    title: "Choosing a Wadi Rum camp",
    titleAr: "اختيار مخيم في وادي رم",
    meta: "Comfort vs. authenticity",
    metaAr: "الراحة مقابل الأصالة",
    readTime: "6 min read",
    category: "Accommodation",
    featured: false,
    image: "⛺",
    excerpt: "Find the perfect balance between desert adventure and modern comfort"
  },
  {
    slug: "amman-food",
    title: "Amman food map",
    titleAr: "خريطة طعام عمّان",
    meta: "What to eat and where",
    metaAr: "ماذا تأكل وأين",
    readTime: "10 min read",
    category: "Food & Culture",
    featured: true,
    image: "🍽️",
    excerpt: "Discover the culinary treasures of Jordan's vibrant capital"
  },
];

export default function Blog() {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-luxury-50 to-premium-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Seo
        title="Jordan Travel Blog - Tips, Guides & Stories from VisitJo"
        description="Read expert travel guides, tips, and stories about Jordan. From Petra to Wadi Rum, get insider knowledge for your Jordan adventure."
        canonicalUrl="https://visitjo.com/blog"
        keywords="Jordan travel blog, Petra guide, Wadi Rum camps, Amman food, Jordan travel tips, travel stories"
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
            <BookOpen className="w-5 h-5 text-jordan-gold" />
            {t('pages.blog.hero.kicker', 'Travel Inspiration')}
            <BookOpen className="w-5 h-5 text-jordan-gold" />
          </div>

          {/* Enhanced Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black font-display mb-8 tracking-tight leading-tight animate-slide-up">
            <span className="block text-white drop-shadow-2xl mb-2">{t("pages.blog.hero.titleMain", "Stories from")}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jordan-gold via-jordan-rose to-jordan-gold bg-300% animate-gradient-flow drop-shadow-2xl">
              {t("pages.blog.hero.titleAccent", "Jordan")}
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-xl sm:text-2xl lg:text-3xl max-w-5xl mx-auto mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('pages.blog.hero.subtitle', 'Expert guides, hidden gems, and local secrets to help you plan your perfect trip.')}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-8 h-8 text-jordan-blue" />
                25+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Camera className="w-8 h-8 text-jordan-rose" />
                100+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Travel Stories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Coffee className="w-8 h-8 text-jordan-gold" />
                50K+
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Readers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-jordan-teal" />
                4.9★
              </div>
              <div className="text-white/70 text-sm sm:text-base font-medium">Satisfaction</div>
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

          {/* Featured Posts Section */}
          <section className="animate-fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                Featured Stories
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Dive into our most popular travel guides and insider tips for exploring Jordan
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {POSTS.filter(post => post.featured).map((post) => (
                <article key={post.slug} className="group card-modern p-8 lg:p-10 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">{post.image}</div>
                    <div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-jordan-gold/20 to-jordan-rose/20 text-jordan-gold font-semibold text-sm rounded-full">
                        <Sparkles className="w-4 h-4" />
                        {post.category}
                      </span>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-jordan-blue transition-colors duration-300 leading-tight">
                    {isArabic ? post.titleAr : post.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 italic">
                    {isArabic ? post.metaAr : post.meta}
                  </p>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-3 btn-primary px-6 py-3 text-lg font-bold rounded-2xl hover-lift group-hover:scale-105 transition-all duration-300"
                  >
                    Read Full Story
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* All Posts Grid */}
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                All Travel Guides
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Comprehensive guides to help you make the most of your Jordan adventure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {POSTS.map((post, index) => (
                <article key={post.slug} className="group card-modern p-6 hover:shadow-floating transition-all duration-500 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{post.image}</div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-jordan-teal/20 to-jordan-blue/20 text-jordan-teal font-medium text-xs rounded-full">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-jordan-gold/10 to-jordan-rose/10 text-jordan-gold font-semibold text-sm rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-jordan-blue transition-colors duration-300 leading-tight">
                      {isArabic ? post.titleAr : post.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {isArabic ? post.metaAr : post.meta}
                    </p>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-jordan-blue font-bold hover:text-jordan-teal transition-colors duration-300 group-hover:translate-x-1 transform"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="card-modern p-12 lg:p-16 bg-gradient-to-r from-jordan-blue via-jordan-teal to-jordan-rose animate-gradient-shift">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Compass className="w-8 h-8 text-white" />
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                    Ready for Your Journey?
                  </h2>
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Let our expert guides and local insights transform your Jordan adventure into an unforgettable experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/" className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                    Explore Hotels
                  </Link>
                  <Link to="/destinations" className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                    Discover Destinations
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
