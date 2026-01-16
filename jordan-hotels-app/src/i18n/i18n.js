import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import arTranslations from './ar.json';
import frTranslations from './fr.json';
import deTranslations from './de.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
      fr: { translation: frTranslations },
      de: { translation: deTranslations },
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Keep <html lang> and direction in sync
const applyDocumentLangDir = (lng) => {
  if (typeof document === 'undefined') return;
  try {
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  } catch {
    // ignore
  }
};

applyDocumentLangDir(i18n.language);
i18n.on('languageChanged', applyDocumentLangDir);

export default i18n;
