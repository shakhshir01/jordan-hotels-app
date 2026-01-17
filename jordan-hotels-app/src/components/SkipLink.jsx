import React from 'react';
import { useTranslation } from 'react-i18next';

const SkipLink = () => {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="skip-link"
      onFocus={(e) => {
        // Ensure the link is visible when focused
        e.target.style.top = '6px';
      }}
      onBlur={(e) => {
        // Hide the link when it loses focus
        e.target.style.top = '-40px';
      }}
    >
      {t('accessibility.skipToMain', 'Skip to main content')}
    </a>
  );
};

export default SkipLink;