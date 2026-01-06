// Group Booking Service
export const calculateGroupDiscount = (numPeople) => {
  if (numPeople >= 10) return 0.20;
  if (numPeople >= 6) return 0.15;
  if (numPeople >= 4) return 0.10;
  if (numPeople >= 2) return 0.05;
  return 0;
};

export const createGroupBooking = (basePrice, numPeople, nights) => {
  const discount = calculateGroupDiscount(numPeople);
  const discountedPrice = basePrice * (1 - discount);
  const totalPerPerson = discountedPrice * nights;
  const totalPrice = totalPerPerson * numPeople;

  return {
    basePrice,
    discountPercentage: discount * 100,
    pricePerPerson: Math.round(discountedPrice),
    totalPerPerson: Math.round(totalPerPerson),
    totalPrice: Math.round(totalPrice),
    savings: Math.round(basePrice * discount * nights * numPeople),
    costSplitWays: generateCostSplit(totalPrice, numPeople),
  };
};

export const generateCostSplit = (totalPrice, numPeople) => {
  const baseAmount = Math.floor(totalPrice / numPeople);
  const remainder = totalPrice % numPeople;

  return Array.from({ length: numPeople }, (_, i) => {
    return baseAmount + (i < remainder ? 1 : 0);
  });
};

export const validateGroupBooking = (groupSize, nights, selectedRooms) => {
  const errors = [];
  if (groupSize < 2) errors.push('Group must have at least 2 people');
  if (nights < 1) errors.push('Stay must be at least 1 night');
  if (!selectedRooms || selectedRooms.length === 0) errors.push('Select at least one room');
  return { valid: errors.length === 0, errors };
};
