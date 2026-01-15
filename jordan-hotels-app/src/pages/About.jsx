import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo.jsx';

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
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-2xl mb-16 mx-4 sm:mx-6 mt-10">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-4 sm:px-6 py-16 md:py-20 text-center text-white max-w-4xl mx-auto">
          <div className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-80 mb-3">
            {t('pages.about.kicker', 'Authentic Jordanian Hospitality')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display mb-4">
            {t('pages.about.title', 'Your Gateway to Extraordinary Experiences')}
          </h1>
          <p className="text-sm md:text-base opacity-95 leading-relaxed max-w-3xl mx-auto">
            {t('pages.about.intro', 'We\'re not just another booking platform. We\'re your trusted local experts, passionate storytellers, and dedicated hosts who believe that every traveler deserves to experience the real Jordan - the hidden gems, the authentic moments, and the genuine connections that transform ordinary trips into lifelong memories.')}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        <section className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('pages.about.cards.localFirst.title')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.about.cards.localFirst.body')}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('pages.about.cards.curated.title')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.about.cards.curated.body')}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{t('pages.about.cards.planning.title')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.about.cards.planning.body')}
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {t('pages.about.focus.title')}
            </h2>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li>{t('pages.about.focus.items.0')}</li>
              <li>{t('pages.about.focus.items.1')}</li>
              <li>{t('pages.about.focus.items.2')}</li>
              <li>{t('pages.about.focus.items.3')}</li>
              <li>{t('pages.about.focus.items.4')}</li>
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-6 text-sm text-slate-700 dark:text-slate-200 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">
              {t('pages.about.reviews.title')}
            </h3>
            <p>
              {t('pages.about.reviews.body1')}
            </p>
            <p>
              {t('pages.about.reviews.body2')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
