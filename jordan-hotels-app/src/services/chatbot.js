/**
 * Nashmi - The Witty Jordan Travel Companion 🤖✨
 *
 * Nashmi is your intelligent, charismatic guide to Jordan's wonders.
 * She's knowledgeable about every corner of the Kingdom, from Petra's
 * ancient mysteries to Aqaba's coral reefs, and she's got a sharp wit
 * that makes planning your trip as enjoyable as the journey itself.
 */

import { hotelAPI } from './api';

// Get Gemini API key from runtime config
const getGeminiKey = () => {
  try {
    const cfg = typeof window !== 'undefined' && window.__VISITJO_RUNTIME_CONFIG__;
    const key = cfg?.VITE_GEMINI_API_KEY || '';
    if (key) {
      // API key found
    } else {
      // No API key found in runtime config
    }
    return key;
  } catch (error) {
    console.error('Error getting Gemini key:', error);
    return '';
  }
};

/**
 * Helper function to select the best available Gemini model.
 * Call this after fetching the list of models from the API.
 */
function selectBestModel(availableModels) {
  // 1. Filter for generation models (exclude embeddings and other types)
  const generateModels = availableModels.filter(m =>
    !m.name.includes('embedding') &&
    !m.name.includes('aqa') &&
    (m.name.includes('gemini') || m.name.includes('gemma'))
  );

  // 2. Define preference order (Newest/Fastest first)
  // Based on your logs, you have access to 2.5 and 2.0
  const preferences = [
    'gemini-2.5-flash',       // Newest stable/preview
    'gemini-2.0-flash',       // Fast and capable
    'gemini-2.0-flash-lite',  // Very fast
    'gemini-1.5-flash'        // Fallback
  ];

  // 3. Find the first matching preference
  for (const pref of preferences) {
    const found = generateModels.find(m => m.name.includes(pref));
    if (found) {
      // API returns "models/gemini-2.5-flash", we usually need just the name
      return found.name.replace('models/', '');
    }
  }

  // 4. Ultimate fallback: use the first available generation model
  if (generateModels.length > 0) {
    return generateModels[0].name.replace('models/', '');
  }

  return 'gemini-2.0-flash'; // Default safety net
}

// Call Gemini API for smart responses
const callGemini = async (messages) => {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  try {
    // First, fetch available models
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!listResponse.ok) {
      console.error('Failed to fetch models:', listResponse.status, listResponse.statusText);
      return null;
    }

    const modelsData = await listResponse.json();
    const availableModels = modelsData.models || [];

    // Use the helper function to select the best model
    const selectedModel = selectBestModel(availableModels);

    // Now use the selected model for generation

    // For simplicity, use just the last user message for now
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || 'Hello';
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';

    const prompt = systemMessage ? `${systemMessage}\n\nUser: ${lastUserMessage}` : lastUserMessage;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.8,
          topK: 10
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return generatedText.trim();
      }
    } else {
      console.warn(`Gemini API error for ${selectedModel}: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.error('Gemini API call failed:', error);
  }

  // Gemini API failed, will use local fallback
  return null; // All attempts failed
};

// Nashmi's personality constants
const NASHMI_PERSONALITY = {
  name: "Nashmi",
  greeting: "Ahlan wa Sahlan! I'm Nashmi, your witty Jordan travel companion! 🌟 Ready to turn your Jordan dreams into unforgettable adventures? Wallahi, you'll love every moment!",
  fallback: "Hmm, I'm not quite sure I caught that. But don't worry, I'm excellent at reading between the lines! Tell me more about what you're looking for, ya habibi.",
  wittyRemarks: [
    "Ah, the Dead Sea - where you can float like a boss and forget your worries! 🏊‍♀️ Just do not shave beforehand - those minerals sting!",
    "Petra at sunrise? Pure magic. Just do not forget your walking shoes - those Nabataeans knew how to build stairs! 🏛️",
    "Wadi Rum is desert vibes? It is like Mars, but with better falafel. 🚀🌵 And way better company!",
    "Amman is got that perfect blend of ancient history and modern buzz. Think Rome meets Dubai! 🏛️✨",
    "Aqaba is beaches? Crystal clear waters that make the Caribbean jealous! 🏖️ Perfect for diving or just chilling.",
    "Jerash is Roman ruins? Like stepping into a time machine - minus the dinosaurs! 🦕🏺",
    "Madaba is mosaics? Absolutely stunning! The oldest map of the Holy Land is here - GPS for ancient times! 🗺️",
    "Dana Biosphere Reserve? Hiking paradise! Just remember: what goes up must come down... eventually! 🥾",
    "Jordanian hospitality? Legendary! They will invite you for dinner after knowing you 5 minutes. ❤️",
    "Arabic coffee? Strong enough to wake up a camel! ☕ But served with such love.",
    "Mansaf for dinner? The national dish that will make you forget every other meal! 🍖🍚",
    "Bedouin camps in the desert? Starry skies, amazing stories, and zero light pollution. 🌟"
  ]
};

// Comprehensive Jordan knowledge base
const JORDAN_KNOWLEDGE = {
  destinations: {
    petra: {
      description: "The Rose City, a UNESCO World Heritage site carved into rose-red cliffs by the Nabataeans over 2,000 years ago.",
      bestTime: "March-May or September-November",
      highlights: ["Treasury", "Monastery", "Royal Tombs", "Petra by Night"],
      tips: "Bring comfortable shoes, water, and prepare for lots of walking and stairs!",
      vibe: "Ancient mystery meets natural beauty"
    },
    "dead sea": {
      description: "The lowest point on Earth, famous for its mineral-rich waters that make you float effortlessly.",
      bestTime: "Year-round, but October-May is most comfortable",
      highlights: ["Floating in the sea", "Mud treatments", "Mineral spas", "Sunset views"],
      tips: "Don't shave before swimming - the minerals sting! Bring water shoes for the salty shore.",
      vibe: "Relaxation and rejuvenation"
    },
    amman: {
      description: "Jordan's vibrant capital, blending ancient Roman theaters with modern Middle Eastern culture.",
      bestTime: "March-May or September-November",
      highlights: ["Roman Theater", "Citadel", "Rainbow Street", "Local souks"],
      tips: "Try mansaf (Jordan's national dish) and explore the street art scene!",
      vibe: "Urban energy with ancient roots"
    },
    aqaba: {
      description: "Jordan's only coastal city on the Red Sea, perfect for diving, snorkeling, and beach relaxation.",
      bestTime: "April-June or September-November",
      highlights: ["Coral reefs", "Diving sites", "South Beach", "Marine life"],
      tips: "Great for water sports and has the clearest waters in the region!",
      vibe: "Tropical paradise in the desert"
    },
    "wadi rum": {
      description: "The Valley of the Moon - vast desert landscapes that inspired Lawrence of Arabia.",
      bestTime: "October-April (cooler months)",
      highlights: ["Sand dunes", "Rock formations", "Bedouin camps", "Stargazing"],
      tips: "Stay in a desert camp for the authentic experience. The silence at night is magical!",
      vibe: "Epic adventure and tranquility"
    },
    jerash: {
      description: "One of the best-preserved Roman cities outside Italy, with massive columns and theaters.",
      bestTime: "March-May or September-November",
      highlights: ["Oval Plaza", "South Theater", "Temple of Artemis", "Colonnaded Street"],
      tips: "It's like stepping back to Roman times - bring your imagination!",
      vibe: "Living history"
    },
    madaba: {
      description: "The City of Mosaics, famous for its Byzantine churches and the oldest map of the Holy Land.",
      bestTime: "Year-round",
      highlights: ["St. George's Church mosaic", "Madaba Archaeological Park", "Local crafts"],
      tips: "Perfect day trip from Amman, and the mosaics are absolutely stunning!",
      vibe: "Artistic heritage"
    }
  },

  culture: {
    food: [
      "Mansaf (national dish) - lamb cooked in yogurt sauce with rice, a must-try!",
      "Falafel - crispy chickpea balls, perfect street food",
      "Hummus - creamy chickpea dip with tahini and olive oil",
      "Maqluba - upside-down rice dish with vegetables and meat",
      "Kunafa - sweet cheese pastry soaked in syrup, heavenly dessert",
      "Baklava - layers of filo pastry with nuts and honey",
      "Zarb - Bedouin-style meat and rice cooked in underground oven",
      "Mujaddara - lentils and rice with caramelized onions",
      "Shawarma - marinated meat wrapped in pita with veggies",
      "Labneh - strained yogurt cheese, great with olive oil and za'atar",
      "Arabic coffee - strong, cardamom-scented, served in small cups",
      "Sage tea - traditional herbal tea, perfect after meals"
    ],
    customs: [
      "Hospitality is sacred - guests are treated like family",
      "Tea/coffee ceremonies - social rituals that build connections",
      "Friday prayers - respectful silence during mosque calls",
      "Family-oriented society - multi-generational households common",
      "Handshakes with eye contact - warm greetings are important",
      "Removing shoes indoors - especially in traditional homes",
      "Gift giving - small tokens of appreciation are valued",
      "Respect for elders - standing when they enter is polite"
    ],
    festivals: [
      "Jerash Festival (July) - cultural performances in ancient Roman theater",
      "Aqaba Jazz Festival - international music under the stars",
      "Dead Sea Ultra Marathon - extreme running in extreme conditions",
      "Amman International Book Fair - literary celebration",
      "Jordan Festival - traditional music, dance, and crafts",
      "Petra Moon Festival - full moon celebrations with Bedouin traditions",
      "Olive Harvest Festival - celebrating Jordan's olive oil heritage",
      "Christmas in Madaba - festive lights and celebrations"
    ],
    tips: [
      "Dress modestly at religious sites - cover shoulders and knees",
      "Remove shoes when entering mosques - out of respect",
      "Learn basic Arabic phrases - locals appreciate the effort",
      "Accept offers of tea/coffee - it's a sign of welcome",
      "Be patient with service - Jordanian time is more relaxed",
      "Try street food - it's fresh, cheap, and authentic",
      "Respect prayer times - businesses may close briefly",
      "Photography etiquette - ask before photographing people"
    ]
  },

  practical: {
    currency: "Jordanian Dinar (JOD) - very strong currency! 1 JOD ≈ 1.41 USD. ATMs widely available, cards accepted in most places.",
    language: "Arabic (official), English widely spoken in tourist areas and cities. Basic phrases go a long way!",
    visa: "Visa on arrival for most nationalities (including US, EU, UK, Canada). Free for many countries, valid for 30-90 days.",
    safety: "Very safe country overall. Petty crime exists in crowded tourist areas, but violent crime is rare. Women travelers are generally safe.",
    tipping: "10-15% at restaurants, 1-2 JOD for helpful service. Round up taxi fares. Not expected at budget places.",
    transportation: "Taxis and rideshares everywhere. Public buses between cities. Renting a car gives freedom. Domestic flights are quick and affordable.",
    weather: "Mediterranean climate - hot dry summers (30-40°C), mild winters (10-20°C). Best visiting spring (March-May) or fall (September-November).",
    electricity: "220V with European-style plugs (Type C, E, F). Bring adapter if needed.",
    internet: "Excellent 4G/5G coverage everywhere. Free WiFi in most hotels and cafes.",
    shopping: "Great for Dead Sea products, olive oil, handicrafts. Bargain politely at souks. Tax-free shopping available.",
    health: "Good medical facilities in cities. Tap water safe in Amman/Aqaba, bottled elsewhere. Pharmacies well-stocked.",
    emergency: "Dial 911 for emergencies. Tourist police very helpful. Hospitals speak English."
  },

  policies: {
    cancellation: "Most hotels offer free cancellation up to 48 hours before check-in. Check specific hotel details for 'Non-Refundable' vs 'Flexible' rates. We show this clearly on each hotel page.",
    booking: "You need a valid credit card to secure your booking. Payment is processed securely via Stripe. No charges until check-in unless it's a non-refundable rate.",
    checkin: "Standard check-in is 3:00 PM, check-out is 12:00 PM. Early check-in/late check-out subject to availability and may have fees. Request at booking!",
    modifications: "Date changes usually possible with fees. Contact hotel directly or through us. Name changes allowed on some bookings.",
    children: "Children under 6 usually stay free. Extra beds/cots available at most hotels. Family rooms and connecting rooms common.",
    pets: "Pet policies vary - some hotels welcome pets with fees, others don't. Always check and declare at booking.",
    accessibility: "Many hotels have accessible rooms. Wheelchair-friendly tours available. Let us know your needs for personalized recommendations.",
    groups: "Special rates for groups of 5+. Contact us for custom packages including transportation and guides."
  },

  trends: {
    current: [
      "Eco-tourism in Dana Biosphere Reserve - sustainable hiking and nature stays",
      "Adventure activities in Wadi Rum - sandboarding, hot air ballooning, stargazing camps",
      "Wellness retreats at the Dead Sea - mineral mud spas and relaxation packages",
      "Cultural experiences in Amman - street art tours, local cuisine workshops, Arabic coffee ceremonies",
      "Sustainable tourism initiatives - green hotels and eco-friendly activities",
      "Digital nomad cafes in Amman - co-working spaces with traditional architecture",
      "Family-friendly packages for school holidays - kid-focused activities and resorts",
      "Last-minute deals for flexible travelers - up to 30% off on select dates",
      "Petra night shows and light projections - magical evening experiences",
      "Wadi Mujib canyon adventures - the 'Grand Canyon of Jordan' with thrilling hikes",
      "Olive oil tasting tours in northern Jordan - culinary experiences with local farmers",
      "Desert glamping in Feynan Ecolodge - luxury meets sustainability"
    ],
    insights: [
      "Petra visitor numbers up 15% this year - book early for peak season!",
      "Wadi Rum camping popularity increasing 25% - desert experiences are hot",
      "Dead Sea mud treatments trending globally - Jordan's natural spa advantage",
      "Local cuisine tourism growing 30% - mansaf and maqluba workshops everywhere",
      "Digital nomad spots in Amman up 40% - perfect for remote workers",
      "Eco-tourism bookings increased 35% - sustainable travel is the future",
      "Adventure tourism up 20% - from canyoning to sandboarding",
      "Cultural immersion experiences up 25% - authentic Jordanian hospitality"
    ],
    deals: [
      "Early bird discounts for summer 2025 - save up to 25% on summer bookings",
      "Family packages for school holidays - kids stay free at select resorts",
      "Last-minute deals for flexible travelers - up to 40% off this month",
      "Group discounts for 5+ people - special rates for friends and families",
      "Wellness packages at Dead Sea resorts - 3-night minimum, includes spa treatments",
      "Petra adventure combos - hotel + guided tour + night show packages",
      "Wadi Rum desert camps - luxury glamping at discounted rates",
      "Amman city breaks - hotel + cultural experience bundles"
    ]
  }
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

async function gatherContextData(message) {
  const data = {
    hotels: [],
    deals: [],
    experiences: [],
    destination: null,
    intent: 'chat'
  };

  // Detect destination
  data.destination = extractDestination(message);

  // Detect intent & fetch data
  const isBooking = fuzzyIncludes(message, 'hotel') || fuzzyIncludes(message, 'book') || fuzzyIncludes(message, 'stay') || fuzzyIncludes(message, 'room');
  const isDeal = fuzzyIncludes(message, 'deal') || fuzzyIncludes(message, 'offer') || fuzzyIncludes(message, 'price') || fuzzyIncludes(message, 'cheap');
  const isExperience = fuzzyIncludes(message, 'tour') || fuzzyIncludes(message, 'activity') || fuzzyIncludes(message, 'experience') || fuzzyIncludes(message, 'guide');

  if (isBooking || data.destination) {
    data.intent = 'booking';
    try {
      const allHotels = await hotelAPI.getAllHotels();
      if (data.destination) {
        data.hotels = allHotels.filter(h => 
          fuzzyIncludes(h.location, data.destination) || 
          fuzzyIncludes(h.name, data.destination) ||
          fuzzyIncludes(h.destination, data.destination)
        ).slice(0, 3);
      } else if (isBooking) {
        // If asking for hotels generally, show top rated
        data.hotels = allHotels.sort((a, b) => b.rating - a.rating).slice(0, 3);
      }
    } catch (e) { console.error('Error fetching hotels for chat:', e); }
  }

  if (isDeal) {
    data.intent = 'deals';
    try {
      data.deals = await hotelAPI.getDeals();
      // If we have deals, maybe grab the hotels associated with them if possible, or just generic deals
    } catch (e) { console.error('Error fetching deals for chat:', e); }
  }

  // Always fetch experiences to provide rich context
  try {
    const allExperiences = await hotelAPI.getExperiences();
    if (data.destination) {
      data.experiences = allExperiences.filter(e => 
        fuzzyIncludes(e.title, data.destination) || fuzzyIncludes(e.description, data.destination)
      ).slice(0, 3);
    } else if (isExperience) {
      data.experiences = allExperiences.slice(0, 3);
    }
  } catch (e) { console.error('Error fetching experiences for chat:', e); }

  return data;
}

const generateAIResponse = async (message, history, userName, contextData) => {
  // Generate AI response

  const systemPrompt = `You are Nashmi, the ultimate witty and intelligent Jordan travel companion chatbot. You are an expert on EVERYTHING Jordan - from ancient history to modern culture, hidden gems to tourist hotspots, food to festivals, and current trends. You have a razor-sharp wit, are incredibly conversational, and always address users by their full name.

Your personality:
- Extremely witty, sarcastic, and fun - think of the coolest travel buddy with perfect comedic timing
- Incredibly knowledgeable about Jordan - you know more about Jordan than most Jordanians!
- Super helpful for booking hotels, finding deals, planning trips, answering any question
- Can discuss ANY topic, but always tie it back to Jordan travel when possible
- Address users by their full name (e.g., "Ahlan [Full Name]!")
- Use Arabic phrases frequently: Ahlan, Ya hala, Inshallah, Ya'ani, Wallahi, etc.
- Be funny, sarcastic, and engaging - never boring or robotic
- Have opinions and preferences (e.g., "Petra at sunset? Wallahi, it's magical!")

Jordan Expertise Areas:
${JSON.stringify(JORDAN_KNOWLEDGE, null, 2)}

Available Context:
- Hotels: ${contextData.hotels.length > 0 ? contextData.hotels.map(h => `${h.name} in ${h.location} (${h.rating}⭐, ${h.price ? h.price + ' JOD' : 'Price varies'})`).join('; ') : 'None found'}
- Deals: ${contextData.deals.length > 0 ? 'Available special offers!' : 'None active'}
- Experiences: ${contextData.experiences.length > 0 ? contextData.experiences.map(e => e.title).join(', ') : 'None'}
- Destination: ${contextData.destination || 'General inquiry'}

Response Guidelines:
- ALWAYS respond conversationally as Nashmi speaking directly
- If user asks about hotels, mention specific ones with details and SHOW their images
- If user wants to book, guide them enthusiastically: "Let's get you booked! Click 'Book Now' and I'll handle the rest!"
- Be able to discuss trends, insights, deals, experiences, cities, hotels - proactively offer deals
- Show hotel images when relevant - describe them wittily
- Give offers and deals when appropriate - be pushy in a fun way
- Respond to ANY topic the user asks - be omni-capable (politics, weather, food, culture, etc.)
- Keep responses engaging, witty, and not too long (aim for 2-4 sentences)
- End with a question to continue conversation OR a call to action
- Use current trends: eco-tourism, adventure travel, wellness retreats, cultural experiences, digital nomad spots
- Mention deals and offers proactively: "Psst, we have a 20% off deal running!"
- Be funny and witty: use sarcasm, jokes, exaggerations
- For booking: explain free cancellation, secure payments, flexible options
- If no specific hotels found, suggest alternatives or ask for more details
- Always be positive, helpful, and entertaining

Example Responses:
- 'Ahlan Ahmed! Petra is absolutely mind-blowing - those rose-red cliffs will steal your heart! 🏛️ Want me to find you a luxury camp nearby?'
- 'Ya hala Sarah! The Dead Sea? Wallahi, floating like a boss while your worries sink away! We have a spa deal that is unbeatable. Book now?'
- 'Hey Mohamed! Looking for hotels in Amman? The Grand Hyatt is pure luxury - like sleeping on clouds! Check it out, I will show you the pics.'

Current Trends to Mention:
- Eco-tourism in Dana Biosphere Reserve
- Adventure activities in Wadi Rum (sandboarding, stargazing camps)
- Wellness retreats at the Dead Sea
- Cultural experiences in Amman (street art, local cuisine)
- Sustainable tourism initiatives
- Digital nomad cafes in Amman
- Family-friendly packages for school holidays
- Last-minute deals for flexible travelers

Remember: You're Nashmi - witty, knowledgeable, fun, and the best Jordan travel companion ever!

Booking Instructions:
- If user wants to book, explain the process: select dates, choose room, payment via Stripe
- Mention free cancellation up to 48 hours
- Guide to hotel detail pages for booking

Respond naturally as Nashmi would speak.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-5).map(h => ({ role: h.sender === 'bot' ? 'assistant' : 'user', content: h.text })),
    { role: 'user', content: `${userName}: ${message}` }
  ];

  const response = await callGemini(messages);
  if (response) {
    return response;
  } else {
    // AI response failed, will use local fallback
    return null;
  }
};

export const generateChatResponse = async (message, _history = [], userProfile = {}) => {
  const userName = userProfile?.displayName || userProfile?.name || 'Friend';
  const contextData = await gatherContextData(message);

  // Try OpenAI first for smarter responses
  const openAIResponse = await generateAIResponse(message, _history, userName, contextData);
  if (openAIResponse) {
    return {
      text: openAIResponse,
      hotels: contextData.hotels || [],
      offers: contextData.deals || [],
      images: [
        ...(contextData.hotels.length > 0 ? contextData.hotels.map(h => ({ url: h.image, alt: h.name })) : [])
      ].filter(i => i.url),
      suggestions: getSmartSuggestions(contextData.hotels.map(h => h.id))
    };
  }

  // Fallback to local response
  const responseText = generateLocalResponse(message, userName, contextData);

  return {
    text: responseText,
    hotels: contextData.hotels || [],
    offers: contextData.deals || [],
    images: [
      ...(contextData.hotels.length > 0 ? contextData.hotels.map(h => ({ url: h.image, alt: h.name })) : [])
    ].filter(i => i.url),
    suggestions: getSmartSuggestions(contextData.hotels.map(h => h.id))
  };
};

function generateLocalResponse(message, userName, data) {
  const msg = normalizeText(message);
  
  // 1. Destination specific with personality
  if (data.destination && JORDAN_KNOWLEDGE.destinations[data.destination]) {
    const dest = JORDAN_KNOWLEDGE.destinations[data.destination];
    const wittyComments = {
      'petra': "Those Nabataeans were engineering geniuses - building a whole city in cliffs? Mind-blowing! 🏛️",
      'dead sea': "Floating therapy! Just don't drink the water - it's saltier than my sense of humor! 🧂",
      'amman': "The capital that's older than your grandma's stories! Roman theaters meet modern malls. 🏛️🛍️",
      'aqaba': "Red Sea paradise! Snorkeling so good, you'll forget you're not in Hawaii. 🐠",
      'wadi rum': "Mars on Earth! But with camels instead of little green men. 🐪🚀",
      'jerash': 'Roman ruins that put Italy to shame! Gladiator fights? Nah, just tourists taking selfies. 📸',
      'madaba': "Mosaic heaven! The Holy Land's oldest map - better than Google Maps! 🗺️",
      'karak': "Crusader castle vibes! Like Game of Thrones, but with better food. 🏰"
    };
    const comment = wittyComments[data.destination] || "";
    return `Ya hala ${userName}! ${data.destination.charAt(0).toUpperCase() + data.destination.slice(1)} is absolutely incredible! ${dest.description} ${comment} ${dest.tips}`;
  }

  // 2. Booking/Hotels with enthusiasm
  if (data.hotels.length > 0) {
    const topHotel = data.hotels[0];
    return `I have found some amazing places for you, ${userName}! Check out ${topHotel.name} in ${topHotel.location} - ${topHotel.rating}⭐ stars of luxury! Shall I help you book it? The deals are calling your name! 🏨✨`;
  }

  // 3. Deals with excitement
  if (data.deals && data.deals.length > 0) {
    return `You are in luck, ${userName}! We have killer deals running right now. Up to 40% off last-minute bookings - your wallet will thank me! 💰🔥 Who does not love saving money while traveling?`;
  }

  // 4. Experience recommendations
  if (data.experiences.length > 0) {
    const topExp = data.experiences[0];
    return `For authentic Jordan experiences, ${userName}, try ${topExp.title}! It is the kind of adventure that creates lifelong memories. Want me to tell you more? 🌟`;
  }

  // 5. Greetings with personality
  if (fuzzyIncludes(msg, 'hello') || fuzzyIncludes(msg, 'hi') || fuzzyIncludes(msg, 'salam') || fuzzyIncludes(msg, 'ahlan')) {
    return `Ya hala ${userName}! Nashmi here, your Jordan travel guru extraordinaire! 🌟 Where shall we adventure today? Petra magic, Dead Sea floating, or maybe just hunting for the best shawarma? 🏛️🏊‍♀️🥙`;
  }

  // 6. Questions about Jordan in general
  if (fuzzyIncludes(msg, 'jordan') || fuzzyIncludes(msg, 'visit') || fuzzyIncludes(msg, 'travel')) {
    return `Ahlan ${userName}! Jordan is pure magic - ancient wonders, desert adventures, and hospitality that will melt your heart! From Petra rose-red cliffs to the Dead Sea floating fun, we have got it all. What interests you most? 🏛️🏊‍♀️`;
  }

  // 7. Food queries
  if (fuzzyIncludes(msg, 'food') || fuzzyIncludes(msg, 'eat') || fuzzyIncludes(msg, 'restaurant') || fuzzyIncludes(msg, 'hungry')) {
    return `Food in Jordan? Wallahi ${userName}, it is heavenly! Try mansaf (our national dish), falafel that is crispy perfection, and kunafa that will make you forget every dessert ever. I know all the best spots! 🍽️✨`;
  }

  // 8. Weather/Time queries
  if (fuzzyIncludes(msg, 'weather') || fuzzyIncludes(msg, 'when') || fuzzyIncludes(msg, 'best time') || fuzzyIncludes(msg, 'season')) {
    return `Best time to visit Jordan, ${userName}? Spring (March-May) or fall (September-November) - not too hot, perfect for exploring! Summers are scorching, winters mild. But honestly, Jordan is amazing year-round! 🌸🍂`;
  }

  // 9. Booking help
  if (fuzzyIncludes(msg, 'book') || fuzzyIncludes(msg, 'reserve') || fuzzyIncludes(msg, 'stay')) {
    return `Let's get you booked, ${userName}! Our hotels have free cancellation up to 48 hours, secure payments, and amazing deals. What destination calls to you? Petra? Dead Sea? Amman? 🏨🔒`;
  }

  // 10. Default witty fallback
  const randomWit = NASHMI_PERSONALITY.wittyRemarks[Math.floor(Math.random() * NASHMI_PERSONALITY.wittyRemarks.length)];
  return `${randomWit} By the way, ${userName}, how can I make your Jordan trip legendary? Tell me what you're dreaming of! ✨`;
}

export const getSmartSuggestions = (viewedHotels = [], _preferences = {}) => {
  const unique = [...new Set(Array.isArray(viewedHotels) ? viewedHotels : [])].filter(Boolean);
  
  // Dynamic suggestions based on context
  const suggestions = [];
  
  if (unique.length > 0) {
    suggestions.push("Similar hotels to your recent views");
  }
  
  // Add contextual suggestions
  suggestions.push(
    "Best deals this month",
    "Top-rated hotels in Amman", 
    "Luxury stays in Aqaba",
    "Petra adventure packages",
    "Dead Sea wellness retreats",
    "Wadi Rum desert camps",
    "Family-friendly resorts",
    "Last-minute getaway deals",
    "Cultural experiences in Jordan",
    "Hidden gems off the beaten path"
  );
  
  return suggestions.slice(0, 6); // Return up to 6 suggestions
};

export default {
  generateChatResponse,
  getSmartSuggestions
};
