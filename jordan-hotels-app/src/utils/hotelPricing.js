// Utility functions for hotel pricing and deals
const DISCOUNTS = [30, 25, 20, 35, 15, 22, 28, 18];

/**
 * Check if a hotel qualifies for deals
 * @param {Object} hotel - Hotel object with price and rating properties
 * @returns {boolean} - Whether the hotel qualifies for deals
 */
export const qualifiesForDeals = (hotel) => {
  if (!hotel || typeof hotel.price !== 'number') return false;
  const price = hotel.price;
  const rating = hotel.rating || 0;
  // Same criteria as DealsList: price between 40-120 JOD AND rating >= 4.9 (to match exactly what's shown on deals page)
  return price >= 40 && price <= 120 && rating >= 4.9;
};

/**
 * Calculate the discounted price for a hotel that qualifies for deals
 * @param {Object} hotel - Hotel object with price and id properties
 * @returns {number|null} - The discounted price, or null if doesn't qualify
 */
export const getDiscountedPrice = (hotel) => {
  if (!qualifiesForDeals(hotel)) return null;

  // Use hotel ID to consistently get the same discount for the same hotel
  const hash = hotel.id ? hotel.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0) : Math.random();

  const discountIndex = Math.abs(hash) % DISCOUNTS.length;
  const discount = DISCOUNTS[discountIndex];

  const originalPrice = hotel.price;
  const discountedPrice = originalPrice * (1 - discount / 100);

  return Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places
};

/**
 * Get the display price for a hotel (discounted if qualifies for deals)
 * @param {Object} hotel - Hotel object
 * @returns {number} - The price to display
 */
export const getDisplayPrice = (hotel) => {
  const discountedPrice = getDiscountedPrice(hotel);
  return discountedPrice !== null ? discountedPrice : hotel.price;
};

/**
 * Check if a hotel has a discounted price
 * @param {Object} hotel - Hotel object
 * @returns {boolean} - Whether the hotel has a discounted price
 */
export const hasDiscountedPrice = (hotel) => {
  return getDiscountedPrice(hotel) !== null;
};

/**
 * Get the discount percentage for a hotel
 * @param {Object} hotel - Hotel object
 * @returns {number|null} - The discount percentage, or null if no discount
 */
export const getDiscountPercentage = (hotel) => {
  if (!qualifiesForDeals(hotel)) return null;

  const hash = hotel.id ? hotel.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0) : Math.random();

  const discountIndex = Math.abs(hash) % DISCOUNTS.length;
  return DISCOUNTS[discountIndex];
};