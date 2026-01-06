// Accessibility Service
export const ACCESSIBILITY_FEATURES = [
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: '♿' },
  { id: 'elevator', label: 'Elevator Available', icon: '🛗' },
  { id: 'accessible-bathroom', label: 'Accessible Bathroom', icon: '🚿' },
  { id: 'hearing-loop', label: 'Hearing Loop', icon: '👂' },
  { id: 'service-animals', label: 'Service Animals Welcome', icon: '🐕' },
  { id: 'mobility-aids', label: 'Mobility Aids Rental', icon: '🦽' },
  { id: 'visual-impairment', label: 'Braille & Audio Guides', icon: '🔤' },
  { id: 'accessible-parking', label: 'Accessible Parking', icon: '🅿️' },
];

export const filterHotelsByAccessibility = (hotels, selectedFeatures) => {
  if (selectedFeatures.length === 0) return hotels;
  return hotels.filter(hotel => 
    selectedFeatures.some(feature => 
      hotel.accessibility?.includes(feature)
    )
  );
};

export const getAccessibilityScore = (hotel) => {
  if (!hotel.accessibility) return 0;
  return Math.round((hotel.accessibility.length / ACCESSIBILITY_FEATURES.length) * 100);
};
