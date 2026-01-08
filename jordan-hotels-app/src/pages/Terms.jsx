import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-card rounded-3xl p-10 space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 mb-2">
              {t('pages.terms.kicker')}
            </p>
            <h1 className="text-3xl md:text-4xl font-black font-display mb-2 text-slate-900 dark:text-slate-100">
              {t('pages.terms.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('pages.terms.intro')}
            </p>
          </header>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.1.title')}
            </h2>
            <p>
              {t('pages.terms.sections.1.body')}
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.2.title')}
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('pages.terms.sections.2.items.0')}</li>
              <li>{t('pages.terms.sections.2.items.1')}</li>
              <li>{t('pages.terms.sections.2.items.2')}</li>
              <li>{t('pages.terms.sections.2.items.3')}</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.3.title')}
            </h2>
            <p>
              {t('pages.terms.sections.3.body')}
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.4.title')}
            </h2>
            <p>
              {t('pages.terms.sections.4.body')}
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.5.title')}
            </h2>
            <p>
              {t('pages.terms.sections.5.body')}
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.6.title')}
            </h2>
            <p>
              {t('pages.terms.sections.6.body')}
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.7.title')}
            </h2>
            <p>
              {t('pages.terms.sections.7.body')}
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t('pages.terms.sections.8.title')}
            </h2>
            <p>
              {t('pages.terms.sections.8.body')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
