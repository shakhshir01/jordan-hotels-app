/**
 * AI Chatbot Service - Smart travel recommendations and support
 */

import i18n from '../i18n/i18n.js';

export const HOTEL_DATA = {
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

const levenshtein = (a, b) => {
  const s = String(a || '');
  const t = String(b || '');
  if (s === t) return 0;
  if (!s) return t.length;
  if (!t) return s.length;

  const v0 = new Array(t.length + 1).fill(0);
  const v1 = new Array(t.length + 1).fill(0);
  for (let i = 0; i < v0.length; i++) v0[i] = i;

  for (let i = 0; i < s.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < t.length; j++) {
      const cost = s[i] === t[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j < v0.length; j++) v0[j] = v1[j];
  }
  return v1[t.length];
};

const stripDiacritics = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const normalizeText = (text) =>
  stripDiacritics(text)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const fuzzyIncludes = (haystack, needle, maxDistance = 2) => {
  const h = normalizeText(haystack);
  const n = normalizeText(needle);
  if (!h || !n) return false;
  if (h.includes(n)) return true;
  if (n.length <= 12) {
    const windowText = h.slice(0, Math.min(h.length, n.length + 3));
    return levenshtein(windowText, n) <= maxDistance;
  }
  return false;
};

const extractDestination = (text) => {
  const msg = normalizeText(text);
  const destinations = [
    { key: 'dead sea', aliases: ['dead sea', 'the dead sea', 'salt sea', 'البحر الميت'] },
    { key: 'amman', aliases: ['amman', 'the capital', 'capital', 'عمّان', 'عمان'] },
    { key: 'petra', aliases: ['petra', 'rose city', 'nabatean', 'البتراء'] },
    { key: 'aqaba', aliases: ['aqaba', 'red sea', 'gulf', 'العقبة'] },
    { key: 'wadi rum', aliases: ['wadi rum', 'wadi', 'desert', 'red sand', 'وادي رم', 'الرم'] },
  ];
  for (const d of destinations) {
    if (d.aliases.some((a) => msg.includes(normalizeText(a)))) return d.key;
  }
  return null;
};

export const generateChatResponse = (userMessage, conversationHistory = []) => {
  const rawMessage = String(userMessage || '');
  const message = normalizeText(rawMessage);
  let response = '';
  let recommendedHotels = [];
  let links = [];

  const findHotelIdsByText = (text) => {
    const t = (text || '').toLowerCase();
    if (!t) return [];
    return Object.entries(HOTEL_DATA)
      .filter(([id, meta]) => {
        const name = (meta?.name || '').toLowerCase();
        const kws = Array.isArray(meta?.keywords) ? meta.keywords.join(' ').toLowerCase() : '';
        return name.includes(t) || t.includes(name) || kws.includes(t) || t.split(/\s+/).some((w) => w && (name.includes(w) || kws.includes(w)));
      })
      .map(([id]) => id);
  };

  const lastBot = [...conversationHistory].reverse().find((m) => m?.sender === 'bot');
  const lastHotels = Array.isArray(lastBot?.hotels) ? lastBot.hotels : [];

  // Smalltalk (typo-tolerant): "how areu", "hru", etc.
  const smallTalkHowAreYou = [
    'how are you',
    'how are u',
    'how r u',
    'how areu',
    'hru',
    'whats up',
    'what is up',
    'كيف حالك',
    'شلونك',
  ];
  if (smallTalkHowAreYou.some((p) => fuzzyIncludes(message, p))) {
    return {
      text: i18n.t('chat.smalltalk.howAreYou'),
      hotels: [],
      suggestions: [
        i18n.t('chat.suggestions.luxury'),
        i18n.t('chat.suggestions.budget'),
        i18n.t('chat.suggestions.spa'),
        i18n.t('chat.suggestions.adventure'),
      ],
    };
  }

  // Greeting detection (also Arabic)
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'start', 'مرحبا', 'أهلا', 'اهلا', 'السلام عليكم'];
  if (greetings.some((g) => message === normalizeText(g) || message.startsWith(normalizeText(g) + ' '))) {
    return {
      text: i18n.t('chat.greeting.default'),
      hotels: [],
      suggestions: [
        i18n.t('chat.suggestions.luxury'),
        i18n.t('chat.suggestions.budget'),
        i18n.t('chat.suggestions.adventure'),
        i18n.t('chat.suggestions.relaxation'),
      ]
    };
  }

  // Destination extraction from free-form text
  const destination = extractDestination(rawMessage);
  if (destination) {
    if (destination === 'dead sea') {
      recommendedHotels = ['h-dead-sea-marriott', 'h-movenpick-deadsea'];
    } else if (destination === 'amman') {
      recommendedHotels = ['h-amman-grand-hyatt', 'h-amman-kempinski', 'h-amman-intercontinental'];
    } else if (destination === 'petra') {
      recommendedHotels = ['h-petra-movenpick'];
    } else if (destination === 'aqaba') {
      recommendedHotels = ['h-aqaba-hilton'];
    } else if (destination === 'wadi rum') {
      recommendedHotels = ['h-wadi-rum-luxury'];
    }

    if (recommendedHotels.length > 0) {
      return {
        text: i18n.t('chat.recommendations.header'),
        hotels: recommendedHotels,
        links: recommendedHotels.map((id) => ({
          label: `${i18n.t('chat.links.open')} ${HOTEL_DATA[id]?.name || id}`,
          to: `/hotels/${id}`
        })),
        suggestions: [
          i18n.t('chat.suggestions.spa'),
          i18n.t('chat.suggestions.beach'),
          i18n.t('chat.suggestions.adventure'),
          i18n.t('chat.suggestions.luxury'),
        ]
      };
    }
  }

  // Direct hotel intents
  if (message.startsWith('book ') || message.startsWith('reserve ') || message.startsWith('احجز ') || message.startsWith('حجز ')) {
    const query = message.replace(/^(book|reserve|احجز|حجز)\s+/, '').trim();
    const matches = findHotelIdsByText(query).slice(0, 3);
    if (matches.length > 0) {
      return {
        text: i18n.t('chat.recommendations.pickToBook'),
        hotels: matches,
        links: [
          ...matches.map((id) => ({ label: `${i18n.t('chat.links.view')} ${HOTEL_DATA[id]?.name || id}`, to: `/hotels/${id}` })),
          { label: i18n.t('chat.links.checkout'), to: '/checkout' },
        ],
        suggestions: [i18n.t('chat.suggestions.deals'), i18n.t('chat.suggestions.map')],
      };
    }
  }

  if (
    message.match(/\b(show|view)\b.*\b(images?|photos?)\b/) ||
    (message.includes('صور') && (message.includes('عرض') || message.includes('شوف') || message.includes('اظهر')))
  ) {
    const matches = findHotelIdsByText(message).slice(0, 3);
    if (matches.length > 0) {
      return {
        text: i18n.t('chat.recommendations.openToSeeGallery'),
        hotels: matches,
        links: matches.map((id) => ({ label: `${i18n.t('chat.links.open')} ${HOTEL_DATA[id]?.name || id}`, to: `/hotels/${id}` })),
        suggestions: [i18n.t('chat.suggestions.deals'), i18n.t('chat.suggestions.map')],
      };
    }
  }

  // Navigation intents ("take me to deals", "open map", etc.)
  if (message.match(/\b(deals?|offers?)\b/) || message.includes('عروض') || message.includes('خصم') || message.includes('عرض')) {
    return {
      text: i18n.t('chat.recommendations.deals'),
      hotels: [],
      links: [
        { label: i18n.t('chat.links.deals'), to: "/deals" },
        { label: i18n.t('chat.links.specialOffers'), to: "/special-offers" },
      ],
      suggestions: [i18n.t('chat.suggestions.deals'), i18n.t('chat.suggestions.luxury'), i18n.t('chat.suggestions.budget')],
    };
  }
  if (message.match(/\b(map|nearby)\b/) || message.includes('خريطة') || message.includes('بالقرب')) {
    return {
      text: i18n.t('chat.recommendations.map'),
      hotels: [],
      links: [{ label: i18n.t('chat.links.hotelsMap'), to: "/hotels-map" }],
      suggestions: ['Dead Sea', 'Amman', 'Aqaba', 'Petra'],
    };
  }
  if (message.match(/\b(trends?|popular)\b/) || message.includes('رائج') || message.includes('الأكثر رواج')) {
    return {
      text: i18n.t('chat.recommendations.trends'),
      hotels: [],
      links: [{ label: i18n.t('chat.links.trends'), to: "/trends" }],
      suggestions: ['Dead Sea', 'Petra', 'Wadi Rum', 'Amman'],
    };
  }
  if (message.match(/\b(wishlist|saved)\b/) || message.includes('مفض') || message.includes('محفوظ')) {
    return {
      text: i18n.t('chat.recommendations.wishlist'),
      hotels: [],
      links: [{ label: i18n.t('chat.links.wishlist'), to: "/wishlist" }],
      suggestions: [i18n.t('chat.suggestions.spa'), i18n.t('chat.suggestions.beach'), i18n.t('chat.suggestions.adventure'), i18n.t('chat.suggestions.luxury')],
    };
  }
  if (message.match(/\b(destinations?)\b/) || message.includes('وجه') || message.includes('الوجهات')) {
    return {
      text: i18n.t('chat.recommendations.destinations'),
      hotels: [],
      links: [{ label: i18n.t('chat.links.destinations'), to: "/destinations" }],
      suggestions: ['Dead Sea', 'Petra', 'Aqaba', 'Wadi Rum'],
    };
  }

  // Simple follow-up
  if (message === 'yes' || message === 'yeah' || message === 'yep' || message === 'ok') {
    if (lastHotels.length > 0) {
      const first = lastHotels[0];
      const name = HOTEL_DATA[first]?.name || first;
      return {
        text: `${i18n.t('chat.followUp.default')}`,
        hotels: lastHotels,
        links: lastHotels.map((id) => ({ label: `${i18n.t('chat.links.open')} ${HOTEL_DATA[id]?.name || id}`, to: `/hotels/${id}` })),
        suggestions: [i18n.t('chat.suggestions.deals'), i18n.t('chat.suggestions.map')],
      };
    }
    return {
      text: i18n.t('chat.recommendations.askVibe'),
      hotels: [],
      suggestions: [i18n.t('chat.suggestions.spa'), i18n.t('chat.suggestions.beach'), i18n.t('chat.suggestions.adventure'), i18n.t('chat.suggestions.city')],
    };
  }

  // Spa/Wellness recommendations
  if (message.match(/spa|wellness|health|therapy|relax|massage|treatment/) || message.includes('سبا') || message.includes('استرخ')) {
    recommendedHotels = ['h-dead-sea-marriott', 'h-movenpick-deadsea'];
    response = i18n.t('chat.recommendations.header');
  }

  // Beach/Water activities
  else if (message.match(/beach|diving|snorkel|water|swim|red sea|diving/)) {
    recommendedHotels = ['h-aqaba-hilton', 'h-movenpick-deadsea'];
    response = i18n.t('chat.recommendations.header');
  }

  // Adventure/Hiking
  else if (message.match(/adventure|hike|trek|camel|desert|wadi|explore|thrill/)) {
    recommendedHotels = ['h-wadi-rum-luxury', 'h-petra-movenpick'];
    response = i18n.t('chat.recommendations.header');
  }

  // History/Culture
  else if (message.match(/petra|history|culture|ancient|archaeological|sightseeing|tour/)) {
    recommendedHotels = ['h-petra-movenpick', 'h-amman-grand-hyatt'];
    response = i18n.t('chat.recommendations.header');
  }

  // Luxury/Premium
  else if (message.match(/luxury|fine dining|premium|michelin|exclusive|upscale|high-end/)) {
    recommendedHotels = ['h-amman-kempinski', 'h-dead-sea-marriott'];
    response = i18n.t('chat.recommendations.header');
  }

  // Family-friendly
  else if (message.match(/family|kids|children|couple|romantic|honeymoon|groups/)) {
    if (message.match(/kids|children|family/)) {
      recommendedHotels = ['h-movenpick-deadsea', 'h-aqaba-hilton'];
      response = i18n.t('chat.recommendations.header');
    } else if (message.match(/couple|romantic|honeymoon/)) {
      recommendedHotels = ['h-wadi-rum-luxury', 'h-dead-sea-marriott'];
      response = i18n.t('chat.recommendations.header');
    }
  }

  // Specific locations
  else if (message.match(/dead sea|salt sea/)) {
    recommendedHotels = ['h-dead-sea-marriott', 'h-movenpick-deadsea'];
    response = i18n.t('chat.recommendations.header');
  } else if (message.match(/amman|capital|city/)) {
    recommendedHotels = ['h-amman-grand-hyatt', 'h-amman-kempinski', 'h-amman-intercontinental'];
    response = i18n.t('chat.recommendations.header');
  } else if (message.match(/petra|rose city|nabatean/)) {
    recommendedHotels = ['h-petra-movenpick'];
    response = i18n.t('chat.recommendations.header');
  } else if (message.match(/aqaba|red sea|gulf/)) {
    recommendedHotels = ['h-aqaba-hilton'];
    response = i18n.t('chat.recommendations.header');
  } else if (message.match(/wadi rum|desert|red sand/)) {
    recommendedHotels = ['h-wadi-rum-luxury'];
    response = i18n.t('chat.recommendations.header');
  }

  // Budget inquiries
  else if (message.match(/budget|cheap|affordable|price|cost|how much/)) {
    response = "What's your budget range? I can recommend hotels from budget-friendly to luxury options across all price points!";
    return { text: response, hotels: [], suggestions: ['80-100 JOD', '100-120 JOD', '120-150 JOD', 'No limit'] };
  }

  // Amenities
  else if (
    message.match(/amenities|facilities|gym|pool|restaurant|wifi|parking/) ||
    message.includes('مرافق') ||
    message.includes('خدمات') ||
    message.includes('واي فاي') ||
    message.includes('مسبح') ||
    message.includes('مطعم') ||
    message.includes('موقف')
  ) {
    response = i18n.t('chat.misc.amenitiesAsk');
    return { text: response, hotels: [], suggestions: ['WiFi', 'Pool', 'Gym', 'Restaurant', i18n.t('chat.suggestions.spa'), i18n.t('chat.suggestions.beach')] };
  }

  // Booking/Reservation
  else if (message.match(/book|reserve|booking|checkout|dates/) || message.includes('حجز') || message.includes('احجز') || message.includes('الدفع') || message.includes('تواريخ')) {
    response = i18n.t('chat.misc.bookingHelp');
    links = [{ label: i18n.t('chat.links.searchHotels'), to: '/search' }];
    return { text: response, hotels: [], links, suggestions: [i18n.t('chat.misc.pickHotelFirst'), i18n.t('chat.misc.alreadyPickedHotel'), 'Next week', 'Specific dates'] };
  }

  // Not understood
  else {
    return {
      text: i18n.t('chat.notFound.default'),
      hotels: [],
      suggestions: [i18n.t('chat.suggestions.spa'), i18n.t('chat.suggestions.beach'), i18n.t('chat.suggestions.adventure'), i18n.t('chat.suggestions.luxury'), i18n.t('chat.suggestions.city')]
    };
  }

  return {
    text: response,
    hotels: recommendedHotels,
    links: recommendedHotels.map((id) => ({ label: `${i18n.t('chat.links.open')} ${HOTEL_DATA[id]?.name || id}`, to: `/hotels/${id}` })),
    suggestions: [i18n.t('chat.suggestions.deals'), i18n.t('chat.suggestions.map'), i18n.t('chat.suggestions.spa')]
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
