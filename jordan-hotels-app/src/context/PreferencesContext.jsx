import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { hotelAPI } from '../services/api';
import { useAuth } from './AuthContext';
import i18n from '../i18n/i18n';

const PreferencesContext = createContext(null);

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
  return ctx;
};

export const PreferencesProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    try {
      const raw = localStorage.getItem('userPreferences');
      return raw ? JSON.parse(raw) : { 
        currency: 'JOD', 
        language: 'en', 
        theme: 'light',
        notifications: {
          emailBookings: true,
          emailPromotions: false,
          pushNotifications: true
        }
      };
    } catch {
      return { 
        currency: 'JOD', 
        language: 'en', 
        theme: 'light',
        notifications: {
          emailBookings: true,
          emailPromotions: false,
          pushNotifications: true
        }
      };
    }
  });

  // Load from API when user is authenticated
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const prefs = await hotelAPI.getUserPreferences();
        if (prefs) {
          setPreferences((prev) => {
            const merged = { ...prev, ...prefs };
            // Ensure notifications structure exists
            if (!merged.notifications) {
              merged.notifications = {
                emailBookings: true,
                emailPromotions: false,
                pushNotifications: true
              };
            }
            return merged;
          });
          localStorage.setItem('userPreferences', JSON.stringify({ ...preferences, ...prefs }));
        }
      } catch (err) {
        console.warn('Failed to load user preferences from API', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Apply language and theme immediately
  useEffect(() => {
    try {
      if (preferences?.language) {
        i18n.changeLanguage(preferences.language);
        localStorage.setItem('language', preferences.language);
      }
    } catch {
      // ignore
    }

    try {
      const root = document.documentElement;
      if (preferences?.theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    } catch {
      // ignore
    }

    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  const savePreferences = useCallback(async (nextPrefs) => {
    setPreferences((p) => {
      const updated = { ...p, ...nextPrefs };
      // Ensure notifications structure exists
      if (!updated.notifications) {
        updated.notifications = {
          emailBookings: true,
          emailPromotions: false,
          pushNotifications: true
        };
      }
      return updated;
    });
    try {
      localStorage.setItem('userPreferences', JSON.stringify({ ...preferences, ...nextPrefs }));
    } catch {}
    if (user) {
      try {
        await hotelAPI.updateUserPreferences({ ...preferences, ...nextPrefs });
      } catch (err) {
        console.warn('Failed to save preferences to API', err);
      }
    }
  }, [user, preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences: savePreferences, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export default PreferencesContext;
