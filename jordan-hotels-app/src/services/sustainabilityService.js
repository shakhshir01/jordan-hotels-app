// Sustainability Service
export const SUSTAINABILITY_BADGES = {
  ecoStars: {
    1: { label: '♻️ 1-Star', description: 'Basic sustainability' },
    2: { label: '♻️ 2-Star', description: 'Moderate eco-friendly' },
    3: { label: '♻️ 3-Star', description: 'Highly sustainable' },
    4: { label: '♻️ 4-Star', description: 'Leading green hotel' },
    5: { label: '♻️ 5-Star', description: 'Carbon neutral' },
  },
};

export const SUSTAINABILITY_FEATURES = [
  'Renewable energy',
  'Water conservation',
  'Waste reduction',
  'Organic food',
  'Green transportation',
  'Local community support',
  'Wildlife protection',
  'Carbon offset program',
];

export const calculateSustainabilityScore = (hotel) => {
  const features = hotel.sustainabilityFeatures || [];
  const score = Math.ceil((features.length / SUSTAINABILITY_FEATURES.length) * 5);
  return {
    score: Math.min(score, 5),
    features,
    carbonFootprint: Math.random() * 2 + 1, // tons/night
    certifications: features.length > 4 ? ['LEED', 'Green Key'] : ['Green Key'],
  };
};

export const getEcoScore = (score) => {
  return SUSTAINABILITY_BADGES.ecoStars[Math.max(1, Math.min(5, score))];
};
