/**
 * AI Chatbot Service - Smart travel recommendations and support
 */

const HOTEL_DATA = {
  'h-dead-sea-marriott': {
    name: 'Dead Sea Marriott Resort & Spa',
    bestFor: ['relaxation', 'spa', 'wellness', 'couples'],
    highlights: ['world-class spa', 'thermal pools', 'beach access', 'award-winning dining'],
    keywords: ['dead sea', 'spa', 'thermal', 'wellness']
  },
  'h-movenpick-deadsea': {
    name: 'Mövenpick Resort Dead Sea',
    bestFor: ['families', 'all-inclusive', 'beach', 'water activities'],
    highlights: ['all-inclusive', 'direct beach access', 'kids club', 'multiple restaurants'],
    keywords: ['dead sea', 'family-friendly', 'all-inclusive', 'beach']
  },
  'h-amman-grand-hyatt': {
    name: 'Grand Hyatt Amman',
    bestFor: ['business', 'city exploration', 'luxury', 'culture'],
    highlights: ['city center location', 'modern amenities', 'business facilities', 'shopping nearby'],
    keywords: ['amman', 'city', 'business', 'luxury']
  },
  'h-petra-movenpick': {
    name: 'Mövenpick Resort Petra',
    bestFor: ['adventure', 'history', 'sightseeing', 'photography'],
    highlights: ['near Petra UNESCO site', 'historic architecture', 'tour arrangements', 'authentic cuisine'],
    keywords: ['petra', 'history', 'adventure', 'ancient']
  },
  'h-aqaba-hilton': {
    name: 'Hilton Aqaba',
    bestFor: ['diving', 'water sports', 'beach', 'adventure'],
    highlights: ['Red Sea diving', 'water sports center', 'beach resort', 'marine life'],
    keywords: ['aqaba', 'diving', 'beach', 'water sports']
  },
  'h-amman-kempinski': {
    name: 'Amman Kempinski Hotel',
    bestFor: ['luxury', 'fine dining', 'business', 'special occasions'],
    highlights: ['Michelin-star dining', 'premium spa', 'luxury suites', 'premium service'],
    keywords: ['kempinski', 'luxury', 'fine dining', 'premium']
  },
  'h-wadi-rum-luxury': {
    name: 'Wadi Rum Luxury Camp',
    bestFor: ['desert adventure', 'romance', 'unique experience', 'stargazing'],
    highlights: ['luxury Bedouin tents', 'camel trekking', 'stargazing', 'desert landscape'],
    keywords: ['wadi rum', 'desert', 'bedouin', 'camping', 'stargazing']
  },
  'h-amman-intercontinental': {
    name: 'Intercontinental Amman',
    bestFor: ['business travel', 'families', 'leisure', 'mixed purpose'],
    highlights: ['central location', 'modern facilities', 'good value', 'business center'],
    keywords: ['amman', 'intercontinental', 'central', 'convenient']
  }
};

const CONVERSATIONS = {
  greeting: [
    "Hello! 👋 Welcome to VisitJo! I'm your travel assistant. How can I help you find the perfect hotel today?",
    "Hi there! Looking for an amazing stay in Jordan? Tell me about your preferences and I'll recommend the best hotels for you!",
    "Welcome! 🎉 I'm here to help you discover incredible accommodations across Jordan. What are you interested in?"
  ],
  notFound: [
    "I'm not sure I understand that. Try asking about hotels by location, type of experience, or your preferences!",
    "Could you rephrase that? I can help with hotel recommendations, booking info, amenities, and more!",
    "Hmm, I didn't catch that. Want to tell me what kind of experience you're looking for?"
  ],
  followUp: [
    "Would you like more details about any specific hotel?",
    "Can I help you find anything else?",
    "Interested in any of these options?",
    "Would you like to book one of these?"
  ]
};

export const generateChatResponse = (userMessage, conversationHistory = []) => {
  const message = userMessage.toLowerCase().trim();
  let response = '';
  let recommendedHotels = [];

  // Greeting detection
  if (message.match(/^(hi|hello|hey|greetings|start)/)) {
    return {
      text: CONVERSATIONS.greeting[Math.floor(Math.random() * CONVERSATIONS.greeting.length)],
      hotels: [],
      suggestions: ['luxury', 'budget-friendly', 'adventure', 'relaxation']
    };
  }

  // Spa/Wellness recommendations
  if (message.match(/spa|wellness|health|therapy|relax|massage|treatment/)) {
    recommendedHotels = ['h-dead-sea-marriott', 'h-movenpick-deadsea'];
    response = "Perfect! For an amazing spa and wellness experience, I'd recommend our top-rated resorts with world-class facilities:";
  }

  // Beach/Water activities
  else if (message.match(/beach|diving|snorkel|water|swim|red sea|diving/)) {
    recommendedHotels = ['h-aqaba-hilton', 'h-movenpick-deadsea'];
    response = "Great choice! For beach and water activities, these properties offer incredible Red Sea and Dead Sea experiences:";
  }

  // Adventure/Hiking
  else if (message.match(/adventure|hike|trek|camel|desert|wadi|explore|thrill/)) {
    recommendedHotels = ['h-wadi-rum-luxury', 'h-petra-movenpick'];
    response = "Adventure seeker! These are perfect for desert exploration, hiking, and unforgettable outdoor experiences:";
  }

  // History/Culture
  else if (message.match(/petra|history|culture|ancient|archaeological|sightseeing|tour/)) {
    recommendedHotels = ['h-petra-movenpick', 'h-amman-grand-hyatt'];
    response = "Excellent! For historical exploration and cultural experiences, I recommend these properties:";
  }

  // Luxury/Premium
  else if (message.match(/luxury|fine dining|premium|michelin|exclusive|upscale|high-end/)) {
    recommendedHotels = ['h-amman-kempinski', 'h-dead-sea-marriott'];
    response = "For a luxurious experience with premium amenities, these are my top picks:";
  }

  // Family-friendly
  else if (message.match(/family|kids|children|couple|romantic|honeymoon|groups/)) {
    if (message.match(/kids|children|family/)) {
      recommendedHotels = ['h-movenpick-deadsea', 'h-aqaba-hilton'];
      response = "Perfect for families! These properties offer family-friendly facilities and activities:";
    } else if (message.match(/couple|romantic|honeymoon/)) {
      recommendedHotels = ['h-wadi-rum-luxury', 'h-dead-sea-marriott'];
      response = "For a romantic getaway, these are absolutely stunning:";
    }
  }

  // Specific locations
  else if (message.match(/dead sea|salt sea/)) {
    recommendedHotels = ['h-dead-sea-marriott', 'h-movenpick-deadsea'];
    response = "The Dead Sea is magical! Here are the best hotels there:";
  } else if (message.match(/amman|capital|city/)) {
    recommendedHotels = ['h-amman-grand-hyatt', 'h-amman-kempinski', 'h-amman-intercontinental'];
    response = "Amman has excellent options for city exploration:";
  } else if (message.match(/petra|rose city|nabatean/)) {
    recommendedHotels = ['h-petra-movenpick'];
    response = "Petra is incredible! Here's the perfect base for exploring it:";
  } else if (message.match(/aqaba|red sea|gulf/)) {
    recommendedHotels = ['h-aqaba-hilton'];
    response = "Aqaba is wonderful for beach and water activities:";
  } else if (message.match(/wadi rum|desert|red sand/)) {
    recommendedHotels = ['h-wadi-rum-luxury'];
    response = "Wadi Rum is unforgettable! Our luxury camp is perfect:";
  }

  // Budget inquiries
  else if (message.match(/budget|cheap|affordable|price|cost|how much/)) {
    response = "What's your budget range? I can recommend hotels from budget-friendly to luxury options across all price points!";
    return { text: response, hotels: [], suggestions: ['80-100 JOD', '100-120 JOD', '120-150 JOD', 'No limit'] };
  }

  // Amenities
  else if (message.match(/amenities|facilities|gym|pool|restaurant|wifi|parking/)) {
    response = "I can help with amenities! What specific facilities are important to you?";
    return { text: response, hotels: [], suggestions: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Beach'] };
  }

  // Booking/Reservation
  else if (message.match(/book|reserve|booking|checkout|dates/)) {
    response = "Great! I can help you book. Do you have specific dates in mind, or would you like me to show you available rooms?";
    return { text: response, hotels: [], suggestions: ['Next week', 'Next month', 'Specific dates'] };
  }

  // Not understood
  else {
    return {
      text: CONVERSATIONS.notFound[Math.floor(Math.random() * CONVERSATIONS.notFound.length)],
      hotels: [],
      suggestions: ['spa & wellness', 'beach vacation', 'adventure', 'luxury travel', 'city exploration']
    };
  }

  return {
    text: response,
    hotels: recommendedHotels,
    suggestions: CONVERSATIONS.followUp
  };
};

export const getSmartSuggestions = (viewedHotels = [], preferences = {}) => {
  // Based on viewing history, suggest similar hotels
  const viewedHotelData = viewedHotels.map(id => HOTEL_DATA[id]).filter(Boolean);
  const allHotels = Object.keys(HOTEL_DATA);
  
  if (viewedHotels.length === 0) {
    return allHotels.slice(0, 3);
  }

  // Find similar hotels
  const suggestions = allHotels.filter(hotelId => !viewedHotels.includes(hotelId));
  return suggestions.slice(0, 3);
};

export default {
  generateChatResponse,
  getSmartSuggestions,
  HOTEL_DATA
};
