/**
 * Loyalty & Promotions Service
 */

export const PROMOTIONS = [
  {
    id: 'promo-first-time',
    code: 'WELCOME15',
    title: 'First Time Visitor Discount',
    description: '15% off your first booking',
    discount: 15,
    type: 'percentage',
    minPrice: 0,
    expiry: '2025-02-28',
    badge: 'First Time'
  },
  {
    id: 'promo-seasonal',
    code: 'WINTER20',
    title: 'Winter Season Special',
    description: '20% off on Dead Sea resorts',
    discount: 20,
    type: 'percentage',
    minPrice: 100,
    applicableHotels: ['h-dead-sea-marriott', 'h-movenpick-deadsea'],
    expiry: '2025-01-31',
    badge: 'Hot Deal'
  },
  {
    id: 'promo-referral',
    code: 'REFER50',
    title: 'Referral Reward',
    description: '50 JOD credit when you refer a friend',
    discount: 50,
    type: 'fixed',
    expiry: '2025-12-31',
    badge: 'Refer'
  },
  {
    id: 'promo-weekend',
    code: 'WEEKEND10',
    title: 'Weekend Getaway',
    description: '10% off all bookings',
    discount: 10,
    type: 'percentage',
    minPrice: 85,
    expiry: '2025-03-15',
    badge: 'Weekend'
  },
];

export const LOYALTY_TIERS = {
  bronze: {
    name: 'Bronze',
    pointsRequired: 0,
    benefits: ['1 point per 1 JOD spent', 'Welcome email with 50 bonus points'],
    color: '#B87333'
  },
  silver: {
    name: 'Silver',
    pointsRequired: 500,
    benefits: ['1.25 points per 1 JOD spent', '10% room upgrade', 'Exclusive deals'],
    color: '#C0C0C0'
  },
  gold: {
    name: 'Gold',
    pointsRequired: 2000,
    benefits: ['1.5 points per 1 JOD spent', '15% room upgrade', 'Free breakfast', 'Priority support'],
    color: '#FFD700'
  },
  platinum: {
    name: 'Platinum',
    pointsRequired: 5000,
    benefits: ['2 points per 1 JOD spent', 'Free room upgrades', 'Free breakfast & lounge', 'Concierge 24/7'],
    color: '#E5E4E2'
  },
};

export const validatePromoCode = (code, cartTotal, hotelId) => {
  const promo = PROMOTIONS.find(p => p.code.toUpperCase() === code.toUpperCase());
  
  if (!promo) return { valid: false, error: 'Invalid promotion code' };
  if (new Date(promo.expiry) < new Date()) return { valid: false, error: 'Promotion expired' };
  if (cartTotal < promo.minPrice) return { valid: false, error: `Minimum order ${promo.minPrice} JOD required` };
  if (promo.applicableHotels && !promo.applicableHotels.includes(hotelId)) {
    return { valid: false, error: 'Not applicable to this hotel' };
  }
  
  const discountAmount = promo.type === 'percentage' 
    ? Math.round((cartTotal * promo.discount) / 100)
    : promo.discount;
  
  return {
    valid: true,
    promo,
    discountAmount,
    finalPrice: Math.max(0, cartTotal - discountAmount)
  };
};

export const getUserTier = (points) => {
  if (points >= LOYALTY_TIERS.platinum.pointsRequired) return 'platinum';
  if (points >= LOYALTY_TIERS.gold.pointsRequired) return 'gold';
  if (points >= LOYALTY_TIERS.silver.pointsRequired) return 'silver';
  return 'bronze';
};

export const getLoyaltyPoints = (bookingAmount, userTier = 'bronze') => {
  const multiplier = {
    bronze: 1,
    silver: 1.25,
    gold: 1.5,
    platinum: 2
  };
  return Math.round(bookingAmount * multiplier[userTier]);
};

export default {
  PROMOTIONS,
  LOYALTY_TIERS,
  validatePromoCode,
  getUserTier,
  getLoyaltyPoints
};
