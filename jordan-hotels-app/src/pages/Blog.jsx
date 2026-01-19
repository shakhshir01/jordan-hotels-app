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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Seo
        title="Jordan Travel Blog - Tips, Guides & Stories from VisitJo"
        description="Read expert travel guides, tips, and stories about Jordan. From Petra to Wadi Rum, get insider knowledge for your Jordan adventure."
        canonicalUrl="https://vist-jo.com/blog"
        keywords="Jordan travel blog, Petra guide, Wadi Rum camps, Amman food, Jordan travel tips, travel stories"
      />

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Simple Background */}
        <div className="absolute inset-0 bg-purple-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Clean Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Simple Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-semibold uppercase tracking-wide animate-fade-in">
            <BookOpen className="w-5 h-5" />
            {t('pages.blog.hero.kicker', 'Travel Inspiration')}
            <BookOpen className="w-5 h-5" />
          </div>

          {/* Simple Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display mb-6 sm:mb-8 tracking-tight leading-tight animate-slide-up px-2 sm:px-0">
            <span className="block text-white drop-shadow-2xl mb-1 sm:mb-2">
              {t("pages.blog.hero.titleMain", "Stories from")}
            </span>
            <span className="block text-white drop-shadow-2xl">
              {t("pages.blog.hero.titleAccent", "Jordan")}
            </span>
          </h1>

          {/* Simple Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto mb-12 sm:mb-16 text-white/90 leading-relaxed font-light animate-fade-in drop-shadow-lg px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
            {t('pages.blog.hero.subtitle', 'Expert guides, hidden gems, and local secrets to help you plan your perfect trip.')}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 space-y-24 mt-16">

          {/* Featured Posts Section */}
          <section className="animate-fade-in-up pt-64">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-10 leading-tight">
                Featured Stories
              </h2>
              <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-200 max-w-4xl mx-auto leading-relaxed">
                Dive into our most popular travel guides and insider tips for exploring Jordan
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {POSTS.filter(post => post.featured).map((post) => (
                <article key={post.slug} className="group bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:-translate-y-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-xl">
                      <div className="text-5xl">{post.image}</div>
                    </div>
                    <div className="flex-1">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm rounded-full shadow-lg">
                        <Sparkles className="w-4 h-4" />
                        {post.category}
                      </span>
                      <div className="flex items-center gap-2 mt-3 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{post.readTime}</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">Featured</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
                    {isArabic ? post.titleAr : post.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed text-lg">
                    {post.excerpt}
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium">
                      {isArabic ? post.metaAr : post.meta}
                    </p>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  >
                    Read Full Story
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* All Posts Grid */}
          <section className="animate-fade-in-up pt-64" style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                All Travel Guides
              </h2>
              <p className="text-xl sm:text-2xl font-medium text-slate-700 dark:text-slate-200 max-w-4xl mx-auto leading-relaxed">
                Comprehensive guides to help you make the most of your Jordan adventure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {POSTS.map((post, index) => (
                <article key={post.slug} className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 hover:-translate-y-1" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-xl">
                      <div className="text-4xl">{post.image}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium text-xs rounded-full shadow-md">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 font-semibold text-sm rounded-full mb-4 border border-orange-200 dark:border-orange-700">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 leading-tight line-clamp-2">
                      {isArabic ? post.titleAr : post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium">
                        {isArabic ? post.metaAr : post.meta}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-bold hover:text-green-700 dark:hover:text-green-300 transition-all duration-300 group-hover:translate-x-2 transform"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
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
