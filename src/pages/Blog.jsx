import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const POSTS = [
  { slug: "petra-guide", title: "A practical Petra guide", titleAr: "دليل عملي للبتراء", meta: "Routes, timing, and tickets", metaAr: "المسارات والتوقيت والتذاكر" },
  { slug: "wadi-rum-camps", title: "Choosing a Wadi Rum camp", titleAr: "اختيار مخيم في وادي رم", meta: "Comfort vs. authenticity", metaAr: "الراحة مقابل الأصالة" },
  { slug: "amman-food", title: "Amman food map", titleAr: "خريطة طعام عمّان", meta: "What to eat and where", metaAr: "ماذا تأكل وأين" },
];

export default function Blog() {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">{t('pages.blog.hero.kicker')}</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">{t('pages.blog.hero.title')}</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">{t('pages.blog.hero.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((p) => (
            <article key={p.slug} className="hotel-card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{isArabic ? p.titleAr : p.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{isArabic ? p.metaAr : p.meta}</p>
                <Link to={`/blog/${p.slug}`} className="btn-ghost">{t('pages.blog.read')}</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
