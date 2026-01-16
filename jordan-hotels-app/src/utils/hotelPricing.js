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

// Currency conversion rates (approximate, should be updated with real rates)
const CURRENCY_RATES = {
  JOD: 1,      // Jordanian Dinar (base currency)
  USD: 1.41,   // 1 JOD = 1.41 USD
  EUR: 1.22,   // 1 JOD = 1.22 EUR
  GBP: 1.03,   // 1 JOD = 1.03 GBP
};

const CURRENCY_SYMBOLS = {
  JOD: 'JOD',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format a price with currency symbol
 * @param {number} price - Price in JOD
 * @param {string} currency - Currency code (JOD, USD, EUR, GBP)
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = 'JOD') => {
  if (typeof price !== 'number' || isNaN(price)) return 'N/A';

  const rate = CURRENCY_RATES[currency] || 1;
  const convertedPrice = price / rate;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // Format with 2 decimal places, but remove .00 if whole number
  const formatted = convertedPrice.toFixed(2).replace(/\.00$/, '');

  return `${symbol}${formatted}`;
};

/**
 * Convert price from JOD to target currency
 * @param {number} priceJOD - Price in JOD
 * @param {string} targetCurrency - Target currency code
 * @returns {number} - Converted price
 */
export const convertPrice = (priceJOD, targetCurrency) => {
  if (typeof priceJOD !== 'number' || isNaN(priceJOD)) return priceJOD;
  const rate = CURRENCY_RATES[targetCurrency] || 1;
  return priceJOD / rate;
};