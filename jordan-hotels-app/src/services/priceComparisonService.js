// Price Comparison Service
export const getPriceComparison = (hotelName, basePrice) => {
  const variance = 0.15; // ±15% variance
  const expediaPrice = Math.round(basePrice * (1 + (Math.random() - 0.5) * variance));
  const bookingPrice = Math.round(basePrice * (1 + (Math.random() - 0.5) * variance));
  const hotelsComPrice = Math.round(basePrice * (1 + (Math.random() - 0.5) * variance));

  return {
    'Visit-Jo': basePrice,
    expedia: expediaPrice,
    booking: bookingPrice,
    hotelscom: hotelsComPrice,
    cheapest: Math.min(basePrice, expediaPrice, bookingPrice, hotelsComPrice),
    savings: Math.max(0, Math.max(expediaPrice, bookingPrice, hotelsComPrice) - basePrice),
  };
};

export const getCompetitorLink = (platform, hotelName) => {
  const links = {
    expedia: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(hotelName)}`,
    booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotelName)}`,
    hotelscom: `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(hotelName)}`,
  };
  return links[platform] || '#';
};
