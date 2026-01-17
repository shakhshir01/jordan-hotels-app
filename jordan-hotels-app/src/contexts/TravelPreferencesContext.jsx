import React, { createContext, useContext, useState, useEffect } from 'react';

/* eslint-disable react-refresh/only-export-components */

const TravelPreferencesContext = createContext({
  preferences: {
    travelStyle: null,
    accommodationPriority: null,
    bedPreference: null,
    amenityPriority: null,
    dietaryRestrictions: [],
    accessibilityNeeds: [],
    budgetRange: { min: 0, max: 1000 },
    preferredDestinations: [],
  },
  updatePreferences: () => {},
  resetPreferences: () => {},
  isProfileComplete: () => false,
  isQuestionnaireOpen: false,
  openQuestionnaire: () => {},
  closeQuestionnaire: () => {},
});

export const useTravelPreferences = () => {
  const context = useContext(TravelPreferencesContext);
  if (!context) {
    throw new Error('useTravelPreferences must be used within a TravelPreferencesProvider');
  }
  return context;
};

export const TravelPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    travelStyle: null, // 'luxury', 'budget', 'adventure', 'cultural'
    accommodationPriority: null, // 'location', 'amenities', 'authenticity', 'comfort'
    bedPreference: null, // 'king', 'twin', 'suite', 'standard'
    amenityPriority: null, // 'wifi', 'parking', 'restaurant', 'breakfast'
    dietaryRestrictions: [], // Array of dietary preferences
    accessibilityNeeds: [], // Array of accessibility requirements
    budgetRange: { min: 0, max: 1000 }, // Price range in USD per night
    preferredDestinations: [], // Array of preferred locations
  });

  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('travelPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading travel preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('travelPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const resetPreferences = () => {
    const defaultPreferences = {
      travelStyle: null,
      accommodationPriority: null,
      bedPreference: null,
      amenityPriority: null,
      dietaryRestrictions: [],
      accessibilityNeeds: [],
      budgetRange: { min: 0, max: 1000 },
      preferredDestinations: [],
    };
    setPreferences(defaultPreferences);
    localStorage.removeItem('travelPreferences');
  };

  const isProfileComplete = () => {
    return preferences.travelStyle && preferences.accommodationPriority &&
           preferences.bedPreference && preferences.amenityPriority;
  };

  const openQuestionnaire = () => setIsQuestionnaireOpen(true);
  const closeQuestionnaire = () => setIsQuestionnaireOpen(false);

  const value = {
    preferences,
    updatePreferences,
    resetPreferences,
    isProfileComplete,
    isQuestionnaireOpen,
    openQuestionnaire,
    closeQuestionnaire,
  };

  return (
    <TravelPreferencesContext.Provider value={value}>
      {children}
    </TravelPreferencesContext.Provider>
  );
};