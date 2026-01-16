import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { hotelAPI } from '../services/api';

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
  loading: false,
});

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

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

  // Load preferences from AWS when user is authenticated
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user || !userProfile) {
        // Not authenticated, use localStorage defaults
        return;
      }

      try {
        setLoading(true);
        const profile = await hotelAPI.getUserProfile();

        if (profile?.preferences?.accessibility) {
          const prefs = profile.preferences.accessibility;
          setFontSize(prefs.fontSize ?? 100);
          setHighContrast(prefs.highContrast ?? false);
          setReducedMotion(prefs.reducedMotion ?? false);
          setKeyboardNavigation(prefs.keyboardNavigation ?? false);
        }
      } catch (error) {
        console.warn('Failed to load accessibility preferences from AWS:', error);
        // Check if it's a CORS error and enable mock mode if needed
        if (error?.message?.includes('CORS') || error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
          console.warn('CORS error detected, accessibility preferences will use localStorage only');
        }
        // Fall back to localStorage
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, userProfile]);

  // Save preferences to AWS when they change
  const savePreferencesToAWS = useCallback(async (preferences) => {
    if (!user) return;

    try {
      const profile = await hotelAPI.getUserProfile();
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          accessibility: preferences,
        },
      };
      await hotelAPI.updateUserProfile(updatedProfile);
    } catch (error) {
      console.warn('Failed to save accessibility preferences to AWS:', error);
    }
  }, [user]);

  // Apply settings to document and save to AWS
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

    // Save to AWS if user is authenticated
    if (user && !loading) {
      const preferences = {
        fontSize,
        highContrast,
        reducedMotion,
        keyboardNavigation,
      };
      savePreferencesToAWS(preferences);
    }
  }, [fontSize, highContrast, reducedMotion, keyboardNavigation, user, loading, savePreferencesToAWS]);

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
    loading,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};