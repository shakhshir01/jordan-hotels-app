import React, { useState } from 'react';
import { X, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Utensils } from 'lucide-react';

const TravelPreferencesQuestionnaire = ({ preferences, setPreferences, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tempPreferences, setTempPreferences] = useState({ ...preferences });

  const steps = [
    {
      title: 'Travel Style',
      description: 'What type of traveler are you?',
      icon: <MapPin size={24} />,
      options: [
        { value: 'luxury', label: 'Luxury Traveler', description: '5-star hotels, premium experiences' },
        { value: 'budget', label: 'Budget Conscious', description: 'Value for money, affordable stays' },
        { value: 'adventure', label: 'Adventure Seeker', description: 'Unique experiences, outdoor activities' },
        { value: 'cultural', label: 'Culture Explorer', description: 'Historical sites, local experiences' },
      ],
    },
    {
      title: 'Accommodation Preferences',
      description: 'What matters most in your stay?',
      icon: <Star size={24} />,
      options: [
        { value: 'location', label: 'Prime Location', description: 'Close to attractions and city center' },
        { value: 'amenities', label: 'Full Amenities', description: 'Pool, spa, fitness center' },
        { value: 'authenticity', label: 'Local Experience', description: 'Traditional Jordanian hospitality' },
        { value: 'comfort', label: 'Modern Comfort', description: 'Contemporary amenities and design' },
      ],
    },
    {
      title: 'Room Preferences',
      description: 'Your ideal room setup',
      icon: <Users size={24} />,
      options: [
        { value: 'king', label: 'King Bed', description: 'Spacious and comfortable' },
        { value: 'twin', label: 'Twin Beds', description: 'Flexible for families/friends' },
        { value: 'suite', label: 'Suite', description: 'Extra space and luxury' },
        { value: 'standard', label: 'Standard Room', description: 'Comfortable and affordable' },
      ],
    },
    {
      title: 'Amenities Priority',
      description: 'Which amenities are important to you?',
      icon: <Wifi size={24} />,
      options: [
        { value: 'wifi', label: 'Free WiFi', description: 'Essential for work and connectivity' },
        { value: 'parking', label: 'Free Parking', description: 'Convenient for road trips' },
        { value: 'restaurant', label: 'On-site Restaurant', description: 'Convenient dining options' },
        { value: 'breakfast', label: 'Breakfast Included', description: 'Start your day right' },
      ],
    },
  ];

  const handleOptionSelect = (stepIndex, value) => {
    setTempPreferences(prev => ({
      ...prev,
      travelStyle: stepIndex === 0 ? value : prev.travelStyle,
      accommodationPriority: stepIndex === 1 ? value : prev.accommodationPriority,
      bedPreference: stepIndex === 2 ? value : prev.bedPreference,
      amenityPriority: stepIndex === 3 ? value : prev.amenityPriority,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and close
      setPreferences(tempPreferences);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="text-blue-600 dark:text-blue-400">
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentStepData.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentStepData.options.map((option) => {
              const isSelected =
                (currentStep === 0 && tempPreferences.travelStyle === option.value) ||
                (currentStep === 1 && tempPreferences.accommodationPriority === option.value) ||
                (currentStep === 2 && tempPreferences.bedPreference === option.value) ||
                (currentStep === 3 && tempPreferences.amenityPriority === option.value);

              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(currentStep, option.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <h3 className={`font-semibold mb-1 ${
                    isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {option.label}
                  </h3>
                  <p className={`text-sm ${
                    isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              currentStep === 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelPreferencesQuestionnaire;