// Gamification Service
export const ACHIEVEMENTS = {
  firstBooking: { id: 'first-booking', name: 'First Explorer', icon: '🎫', description: 'Complete your first booking' },
  fiveBookings: { id: 'five-bookings', name: 'Seasoned Traveler', icon: '✈️', description: 'Make 5 bookings' },
  reviewMaster: { id: 'review-master', name: 'Reviewer', icon: '⭐', description: 'Write 5 reviews' },
  desertLover: { id: 'desert-lover', name: 'Desert Explorer', icon: '🏜️', description: 'Book Wadi Rum' },
  beachBum: { id: 'beach-bum', name: 'Beach Lover', icon: '🏖️', description: 'Book Aqaba' },
  historianBuff: { id: 'historian', name: 'History Buff', icon: '🏛️', description: 'Book Petra' },
  wellnessWarrior: { id: 'wellness', name: 'Wellness Warrior', icon: '💆', description: 'Book Dead Sea' },
  citySlicker: { id: 'city', name: 'City Slicker', icon: '🏙️', description: 'Book Amman' },
};

export const BADGES = {
  bronze: { level: 'Bronze', minPoints: 0, icon: '🥉', color: '#CD7F32' },
  silver: { level: 'Silver', minPoints: 500, icon: '🥈', color: '#C0C0C0' },
  gold: { level: 'Gold', minPoints: 2000, icon: '🥇', color: '#FFD700' },
  platinum: { level: 'Platinum', minPoints: 5000, icon: '💎', color: '#E5E4E2' },
};

export const getUserBadge = (points) => {
  if (points >= 5000) return BADGES.platinum;
  if (points >= 2000) return BADGES.gold;
  if (points >= 500) return BADGES.silver;
  return BADGES.bronze;
};

export const getAchievements = (bookings, reviews, destinations) => {
  const achieved = [];
  if (bookings >= 1) achieved.push(ACHIEVEMENTS.firstBooking);
  if (bookings >= 5) achieved.push(ACHIEVEMENTS.fiveBookings);
  if (reviews >= 5) achieved.push(ACHIEVEMENTS.reviewMaster);
  if (destinations.includes('Wadi Rum')) achieved.push(ACHIEVEMENTS.desertLover);
  if (destinations.includes('Aqaba')) achieved.push(ACHIEVEMENTS.beachBum);
  if (destinations.includes('Petra')) achieved.push(ACHIEVEMENTS.historianBuff);
  if (destinations.includes('Dead Sea')) achieved.push(ACHIEVEMENTS.wellnessWarrior);
  if (destinations.includes('Amman')) achieved.push(ACHIEVEMENTS.citySlicker);
  return achieved;
};
