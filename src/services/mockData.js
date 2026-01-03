export const mockHotels = [
  {
    id: "h-movenpick-deadsea",
    name: "Mövenpick Resort Dead Sea",
    location: "Dead Sea",
    price: 180,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&h=600&fit=crop",
    description: "Luxury resort on the Dead Sea with spa and pools.",
  },
  {
    id: "h-wadi-rum-bubble",
    name: "Wadi Rum Bubble Luxotel",
    location: "Wadi Rum",
    price: 240,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&h=600&fit=crop",
    description: "Unique bubble tents in the desert under stars.",
  },
  {
    id: "h-st-regis-amman",
    name: "The St. Regis Amman",
    location: "Amman",
    price: 210,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&h=600&fit=crop",
    description: "Five-star service in the heart of Amman.",
  },
];

export const mockDestinations = [
  { id: "d-amman", name: "Amman", description: "Capital city with rich culture and history", hotels: ["h-st-regis-amman"] },
  { id: "d-petra", name: "Petra", description: "Ancient rock-cut city, one of Seven Wonders", hotels: [] },
  { id: "d-wadi-rum", name: "Wadi Rum", description: "Dramatic desert landscapes and Bedouin camps", hotels: ["h-wadi-rum-bubble"] },
  { id: "d-dead-sea", name: "Dead Sea", description: "Lowest point on Earth with healing waters", hotels: ["h-movenpick-deadsea"] },
];

export const mockDeals = [
  { id: "deal-weekend-escape", title: "Weekend escape", meta: "City stays • Limited time", price: "From 99 JOD" },
  { id: "deal-family-bundle", title: "Family bundles", meta: "Kids-friendly • Breakfast", price: "From 199 JOD" },
  { id: "deal-desert-combo", title: "Desert + Petra combo", meta: "Curated itinerary • Best value", price: "From 299 JOD" },
  { id: "deal-last-minute", title: "Last-minute deals", meta: "Tonight & tomorrow", price: "From 79 JOD" },
];

export const mockExperiences = [
  { id: "e-petra-night", title: "Petra by Night", meta: "Evening • Culture", price: 45 },
  { id: "e-wadi-rum-4x4", title: "Wadi Rum 4x4 Tour", meta: "Desert • Sunset", price: 85 },
  { id: "e-dead-sea-spa", title: "Dead Sea Wellness Day", meta: "Spa • Relax", price: 65 },
  { id: "e-amman-food", title: "Amman Food Crawl", meta: "Local • Markets", price: 55 },
];

export const mockBlogPosts = [
  { id: "b-petra-guide", slug: "petra-guide", title: "A practical Petra guide", meta: "Routes, timing, and tickets" },
  { id: "b-wadi-rum-camps", slug: "wadi-rum-camps", title: "Choosing a Wadi Rum camp", meta: "Comfort vs. authenticity" },
  { id: "b-amman-food", slug: "amman-food", title: "Amman food map", meta: "What to eat and where" },
];

export const mockSearchResult = ({ q } = {}) => {
  const ql = (q || "").toLowerCase();
  return {
    hotels: mockHotels.filter(h => !ql || h.name.toLowerCase().includes(ql) || h.location.toLowerCase().includes(ql)),
    experiences: mockExperiences.filter(e => !ql || e.title.toLowerCase().includes(ql)),
    deals: mockDeals.filter(d => !ql || d.title.toLowerCase().includes(ql)),
    destinations: mockDestinations.filter(d => !ql || d.name.toLowerCase().includes(ql)),
  };
};
