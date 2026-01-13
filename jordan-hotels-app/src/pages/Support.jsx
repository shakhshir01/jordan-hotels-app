import { useTranslation } from 'react-i18next';

export default function Support() {
  const { t } = useTranslation();

  const FAQ = [
    {
      q: t('support.faq.cancellations.q'),
      a: t('support.faq.cancellations.a'),
    },
    {
      q: t('support.faq.bookings.q'),
      a: t('support.faq.bookings.a'),
    },
    {
      q: t('support.faq.currency.q'),
      a: t('support.faq.currency.a'),
    },
    {
      q: t('support.faq.problem.q'),
      a: t('support.faq.problem.a'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 shadow-2xl mb-12 sm:mb-16 mx-4 sm:mx-6 mt-8 sm:mt-10">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-12 sm:py-16 text-center text-white max-w-3xl mx-auto">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3">{t('support.hero.kicker', 'We\'re Here to Help')}</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display mb-4">{t('support.hero.title', 'Support Center')}</h1>
          <p className="text-sm md:text-base opacity-95">{t('support.hero.subtitle', 'Have questions? We have answers. Let us help you make your trip seamless.')}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 grid md:grid-cols-3 gap-6 sm:gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {item.q}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="glass-card rounded-2xl p-6 text-sm text-slate-700 dark:text-slate-200">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {t('support.chat.title')}
            </h2>
            <p className="mb-2">{t('support.chat.body')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('support.chat.note')}</p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-sm text-slate-700 dark:text-slate-200 space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">
              {t('support.email.title')}
            </h2>
            <p>{t('support.email.body')}</p>
            <a
              href="mailto:khaledshakhshir2133@gmail.com?subject=VisitJo%20Support%20Request&body=Booking%20ID%3A%0A%0ADates%3A%0A%0ADescription%3A%0A"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors"
            >
              {t('support.email.cta')}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
