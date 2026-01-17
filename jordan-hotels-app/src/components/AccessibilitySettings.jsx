import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../context/AccessibilityContext';
import { AccessibleButton } from './AccessibilityComponents.jsx';

const AccessibilitySettings = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const {
    fontSize,
    highContrast,
    reducedMotion,
    keyboardNavigation,
    increaseFontSize,
    decreaseFontSize,
    setHighContrast,
    setReducedMotion,
    setKeyboardNavigation,
    resetSettings,
  } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t('accessibility.settings', 'Accessibility Settings')}
            </h2>
            <AccessibleButton
              onClick={onClose}
              ariaLabel={t('common.close', 'Close')}
              ariaPressed={false}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </AccessibleButton>
          </div>

          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t('accessibility.fontSize', 'Font Size')}
              </label>
              <div className="flex items-center space-x-3">
                <AccessibleButton
                  onClick={decreaseFontSize}
                  ariaLabel={t('accessibility.decreaseFont', 'Decrease font size')}
                  ariaPressed={false}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </AccessibleButton>
                <span className="text-lg font-medium text-slate-900 dark:text-white min-w-[3rem] text-center">
                  {fontSize}%
                </span>
                <AccessibleButton
                  onClick={increaseFontSize}
                  ariaLabel={t('accessibility.increaseFont', 'Increase font size')}
                  ariaPressed={false}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </AccessibleButton>
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <label htmlFor="high-contrast" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('accessibility.highContrast', 'High Contrast')}
              </label>
              <button
                id="high-contrast"
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  highContrast ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={highContrast}
                aria-label={highContrast ? t('accessibility.highContrastEnabled', 'High contrast enabled') : t('accessibility.highContrastDisabled', 'High contrast disabled')}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <label htmlFor="reduced-motion" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('accessibility.reducedMotion', 'Reduced Motion')}
              </label>
              <button
                id="reduced-motion"
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  reducedMotion ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={reducedMotion}
                aria-label={reducedMotion ? t('accessibility.reducedMotionEnabled', 'Reduced motion enabled') : t('accessibility.reducedMotionDisabled', 'Reduced motion disabled')}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <label htmlFor="keyboard-nav" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('accessibility.keyboardNav', 'Keyboard Navigation')}
              </label>
              <button
                id="keyboard-nav"
                type="button"
                onClick={() => setKeyboardNavigation(!keyboardNavigation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  keyboardNavigation ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={keyboardNavigation}
                aria-label={keyboardNavigation ? t('accessibility.keyboardNavEnabled', 'Keyboard navigation enabled') : t('accessibility.keyboardNavDisabled', 'Keyboard navigation disabled')}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex space-x-3 mt-8">
            <AccessibleButton
              onClick={resetSettings}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              ariaLabel={t('accessibility.resetSettings', 'Reset settings')}
              ariaPressed={false}
            >
              {t('accessibility.reset', 'Reset')}
            </AccessibleButton>
            <AccessibleButton
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              ariaLabel={t('common.close', 'Close')}
              ariaPressed={false}
            >
              {t('common.close', 'Close')}
            </AccessibleButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;