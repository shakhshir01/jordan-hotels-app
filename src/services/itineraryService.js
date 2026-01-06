// Itinerary Service
export const generatePersonalizedItinerary = (destination, nights, interests = []) => {
  const baseItineraries = {
    Amman: {
      activities: [
        'Roman Theater tour',
        'Citadel visit',
        'Old City shopping',
        'Modern downtown exploring',
        'Museum visits',
      ],
      restaurants: ['Hashem', 'Zalatimo', 'Tazza Cafe', 'Wild Jordan'],
      nightlife: ['Downtown clubs', 'Rooftop bars', 'Hookah cafes'],
    },
    Petra: {
      activities: ['Treasury', 'Monastery', 'High Place Sacrifice', 'Petra by night', 'Rose city walk'],
      restaurants: ['Nabataean tents', 'Local restaurants'],
      nightlife: ['Bedouin storytelling'],
    },
    'Wadi Rum': {
      activities: ['Jeep safari', 'Camel riding', 'Rock climbing', 'Sunset viewing', 'Stargazing'],
      restaurants: ['Bedouin camps'],
      nightlife: ['Desert bonfire', 'Stargazing', 'Traditional music'],
    },
    'Dead Sea': {
      activities: ['Floating', 'Mud therapy', 'Spa treatments', 'Beach walks', 'Wellness activities'],
      restaurants: ['Resort restaurants', 'Seafood cafes'],
      nightlife: ['Spa retreats', 'Beach lounges'],
    },
    Aqaba: {
      activities: ['Diving', 'Snorkeling', 'Beach relaxation', 'Fort visit', 'Water sports'],
      restaurants: ['Seafood restaurants', 'Beach cafes'],
      nightlife: ['Beach bars', 'Water sports clubs'],
    },
  };

  return baseItineraries[destination] || {};
};

export const calculateOptimalRoute = (destinations) => {
  const routes = {
    'Amman-Petra-Dead Sea': ['Amman', 'Petra', 'Dead Sea'],
    'Amman-Wadi Rum-Aqaba': ['Amman', 'Wadi Rum', 'Aqaba'],
    'All Jordan': ['Amman', 'Petra', 'Wadi Rum', 'Dead Sea', 'Aqaba'],
  };
  return routes['All Jordan'];
};
