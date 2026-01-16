import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext({
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  keyboardNavigation: false,
  setFontSize: (() => {}) as React.Dispatch<React.SetStateAction<number>>,
  setHighContrast: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  setReducedMotion: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  setKeyboardNavigation: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  resetSettings: () => {},
});

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('accessibility-fontSize');
    return saved ? parseInt(saved) : 100; // percentage
  });

  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('accessibility-highContrast');
    return saved === 'true';
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem('accessibility-reducedMotion');
    return saved === 'true';
  });

  const [keyboardNavigation, setKeyboardNavigation] = useState(() => {
    const saved = localStorage.getItem('accessibility-keyboardNavigation');
    return saved === 'true';
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty('--font-size-multiplier', `${fontSize / 100}`);
    root.style.fontSize = `${fontSize}%`;

    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Save to localStorage
    localStorage.setItem('accessibility-fontSize', fontSize.toString());
    localStorage.setItem('accessibility-highContrast', highContrast.toString());
    localStorage.setItem('accessibility-reducedMotion', reducedMotion.toString());
    localStorage.setItem('accessibility-keyboardNavigation', keyboardNavigation.toString());
  }, [fontSize, highContrast, reducedMotion, keyboardNavigation]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 10, 150));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 10, 80));
  };

  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
    setReducedMotion(false);
    setKeyboardNavigation(false);
  };

  const value = {
    fontSize,
    highContrast,
    reducedMotion,
    keyboardNavigation,
    setFontSize,
    setHighContrast,
    setReducedMotion,
    setKeyboardNavigation,
    increaseFontSize,
    decreaseFontSize,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};