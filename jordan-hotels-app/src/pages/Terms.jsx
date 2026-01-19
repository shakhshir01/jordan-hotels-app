import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-light-warm dark:bg-dark-warm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-card rounded-3xl p-10 space-y-8 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 shadow-2xl border border-green-200/50 dark:border-green-700/50">
          <header className="text-center pt-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              📋 Terms of Service
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-display mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              {t('pages.terms.title')}
            </h1>
            <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
              {t('pages.terms.intro')}
            </p>
            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200/50 dark:border-green-700/50">
              Last updated: January 2025
            </div>
          </header>

          <div className="space-y-8">
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/30 dark:border-green-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                {t('pages.terms.sections.1.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.terms.sections.1.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-teal-200/30 dark:border-teal-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                {t('pages.terms.sections.2.title')}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">•</span>
                  {t('pages.terms.sections.2.items.0')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">•</span>
                  {t('pages.terms.sections.2.items.1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">•</span>
                  {t('pages.terms.sections.2.items.2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-1">•</span>
                  {t('pages.terms.sections.2.items.3')}
                </li>
              </ul>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                {t('pages.terms.sections.3.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.terms.sections.3.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                {t('pages.terms.sections.4.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.terms.sections.4.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200/30 dark:border-orange-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                {t('pages.terms.sections.5.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.terms.sections.5.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-pink-200/30 dark:border-pink-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                {t('pages.terms.sections.6.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.terms.sections.6.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200/30 dark:border-indigo-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">7</span>
                {t('pages.terms.sections.7.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.terms.sections.7.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200/30 dark:border-red-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">8</span>
                {t('pages.terms.sections.8.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.terms.sections.8.body')}
              </p>
            </section>
          </div>

          <footer className="text-center pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@VISIT-JO.com" className="text-green-600 hover:text-green-700 font-semibold">
                legal@VISIT-JO.com
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
