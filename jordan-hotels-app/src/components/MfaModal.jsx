import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MfaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle MFA verification logic here
    console.log('MFA Code:', code);
    setIsOpen(false);
    setCode('');
  };

  // This component would be triggered by authentication flow
  // For now, it's a placeholder that can be opened programmatically
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-jordan-blue/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-jordan-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {t('mfa.title', 'Two-Factor Authentication')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t('mfa.description', 'Enter the 6-digit code from your authenticator app')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jordan-blue dark:bg-slate-700 dark:text-slate-100"
              maxLength={6}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-jordan-blue hover:bg-jordan-teal text-white rounded-lg transition-colors"
            >
              {t('mfa.verify', 'Verify')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
