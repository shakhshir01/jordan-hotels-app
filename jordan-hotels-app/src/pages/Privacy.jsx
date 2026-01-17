import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-card rounded-3xl p-10 space-y-8 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 shadow-2xl border border-blue-200/50 dark:border-blue-700/50">
          <header className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              🔒 Privacy Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-display mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('pages.privacy.title')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('pages.privacy.intro')}
            </p>
            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
              Last updated: January 2025
            </div>
          </header>

          <div className="space-y-8">
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                {t('pages.privacy.sections.1.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.privacy.sections.1.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                {t('pages.privacy.sections.2.title')}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  {t('pages.privacy.sections.2.items.0')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  {t('pages.privacy.sections.2.items.1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  {t('pages.privacy.sections.2.items.2')}
                </li>
              </ul>
            </section>

            <section className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-green-200/30 dark:border-green-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                {t('pages.privacy.sections.3.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.privacy.sections.3.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200/30 dark:border-orange-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                {t('pages.privacy.sections.4.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.privacy.sections.4.body')}
              </p>
            </section>

            <section className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-pink-200/30 dark:border-pink-700/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                {t('pages.privacy.sections.5.title')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t('pages.privacy.sections.5.body')}
              </p>
            </section>
          </div>

          <footer className="text-center pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@visitjo.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                privacy@visitjo.com
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
