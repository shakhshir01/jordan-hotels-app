/**
 * Nashmi - The Witty Jordan Travel Companion 🤖✨
 *
 * Nashmi is your intelligent, charismatic guide to Jordan's wonders.
 * She's knowledgeable about every corner of the Kingdom, from Petra's
 * ancient mysteries to Aqaba's coral reefs, and she's got a sharp wit
 * that makes planning your trip as enjoyable as the journey itself.
 */

import i18n from '../i18n/i18n.js';
import { hotelAPI } from './api';

// Nashmi's personality constants
const NASHMI_PERSONALITY = {
  name: "Nashmi",
  greeting: "Ahlan wa Sahlan! I'm Nashmi, your witty Jordan travel companion! 🌟 Ready to turn your Jordan dreams into unforgettable adventures?",
  fallback: "Hmm, I'm not quite sure I caught that. But don't worry, I'm excellent at reading between the lines! Tell me more about what you're looking for.",
  wittyRemarks: [
    "Ah, the Dead Sea - where you can float like a boss and forget your worries! 🏊‍♀️",
    "Petra at sunrise? Pure magic. Just don't forget your walking shoes - those Nabataeans knew how to build stairs! 🏛️",
    "Wadi Rum's desert vibes? It's like Mars, but with better falafel. 🚀🌵",
    "Amman's got that perfect blend of ancient history and modern buzz. Think Rome meets Dubai! 🏛️✨"
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
    food: ["Mansaf (national dish)", "Falafel", "Hummus", "Maqluba", "Kunafa", "Baklava"],
    customs: ["Hospitality is sacred", "Tea/coffee ceremonies", "Friday prayers", "Family-oriented society"],
    festivals: ["Jerash Festival (July)", "Aqaba Jazz Festival", "Dead Sea Ultra Marathon"],
    tips: ["Dress modestly at religious sites", "Remove shoes when entering mosques", "Learn basic Arabic phrases"]
  },

  practical: {
    currency: "Jordanian Dinar (JOD) - very strong currency!",
    language: "Arabic (official), English widely spoken in tourist areas",
    visa: "Visa on arrival for most nationalities",
    safety: "Very safe country, but stay aware in crowded areas",
    tipping: "10-15% at restaurants, small amounts for helpful service"
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

const getOpenAIKey = () => {
  if (typeof window !== 'undefined' && window.__VISITJO_RUNTIME_CONFIG__ && window.__VISITJO_RUNTIME_CONFIG__.OPENAI_API_KEY) {
    return window.__VISITJO_RUNTIME_CONFIG__.OPENAI_API_KEY;
  }
  return import.meta.env.VITE_OPENAI_API_KEY;
};

async function callOpenAI(messages, apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("AI Chat Error:", error);
    return null;
  }
}

async function gatherContextData(message) {
  const data = {
    hotels: [],
    deals: [],
    destination: null,
    intent: 'chat'
  };

  // Detect destination
  data.destination = extractDestination(message);

  // Detect intent & fetch data
  const isBooking = fuzzyIncludes(message, 'hotel') || fuzzyIncludes(message, 'book') || fuzzyIncludes(message, 'stay') || fuzzyIncludes(message, 'room');
  const isDeal = fuzzyIncludes(message, 'deal') || fuzzyIncludes(message, 'offer') || fuzzyIncludes(message, 'price') || fuzzyIncludes(message, 'cheap');

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
    } catch (e) { console.error("Error fetching hotels for chat:", e); }
  }

  if (isDeal) {
    data.intent = 'deals';
    try {
      data.deals = await hotelAPI.getDeals();
      // If we have deals, maybe grab the hotels associated with them if possible, or just generic deals
    } catch (e) { console.error("Error fetching deals for chat:", e); }
  }

  return data;
}

export const generateChatResponse = async (message, history = [], userProfile = {}) => {
  const userName = userProfile?.displayName || userProfile?.name || 'Friend';
  const apiKey = getOpenAIKey();
  const contextData = await gatherContextData(message);
  
  let responseText = '';
  
  if (apiKey) {
    // AI Path
    const systemPrompt = `You are Nashmi, a witty, charming, and hyper-knowledgeable Jordanian travel guide.

## Your Persona
- Your name is Nashmi.
- You are funny, warm, and charismatic.
- You use Jordanian slang like "Yalla", "Habibi/Habibti", and "Ahlan wa Sahlan".
- Your goal is to make planning a trip to Jordan as fun as the trip itself.

## User Information
- User's Name: ${userName}

## Your Knowledge
- You have a deep knowledge base about Jordan. Use it to answer questions about cities, culture, food, etc.
- KNOWLEDGE_BASE: \`\`\`json
${JSON.stringify(JORDAN_KNOWLEDGE)}
\`\`\`

## Real-time Data
- My system has detected the following information based on the user's message.
- CONTEXT_DATA: \`\`\`json
${JSON.stringify({
  detected_intent: contextData.intent,
  detected_destination: contextData.destination,
  hotels: contextData.hotels.map(h => ({ name: h.name, location: h.location, price: h.price, rating: h.rating })),
  deals: contextData.deals.map(d => ({ title: d.title, description: d.description }))
})}
\`\`\`

## Your Instructions
1.  **Greet the user:** Always greet ${userName} by name in your first message. Use their name naturally in subsequent conversation.
2.  **Use your persona:** Be witty and charming. Make jokes.
3.  **Answer questions:** Use the KNOWLEDGE_BASE to answer questions about Jordan.
4.  **Handle requests for hotels/deals:**
    - If \`CONTEXT_DATA.hotels\` is NOT empty, it means I found relevant hotels. Mention them enthusiastically. Tell the user you have found some options for them.
    - If \`CONTEXT_DATA.hotels\` IS empty but the user is asking for hotels, tell them you couldn't find anything for that specific request but you can search for hotels in major cities. Suggest some cities (e.g., "I couldn't find hotels in that specific area. Would you like to see options in Amman or Aqaba?").
    - Do the same for deals.
5.  **Be concise:** Keep your answers engaging and to the point (usually 2-3 sentences).
6.  **Handle unknowns:** If you don't know the answer to something, use a witty remark. Never say "I don't know". Example: "That's a tricky one! Are you sure you're not a secret agent? While I ponder that, have you seen the treasury at Petra? It's breathtaking."
7.  **Be conversational:** Ask follow-up questions to keep the conversation going.
`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
      { role: "user", content: message }
    ];
    
    const aiText = await callOpenAI(messages, apiKey);
    if (aiText) {
      responseText = aiText;
    }
  }
  
  if (!responseText) {
    // Fallback Path (Local Logic)
    responseText = generateLocalResponse(message, userName, contextData);
  }

  // Construct final response object
  return {
    text: responseText,
    hotels: contextData.hotels || [],
    offers: contextData.deals || [],
    // Only show images if we found specific hotels, otherwise keep chat clean
    images: contextData.hotels.length > 0 ? contextData.hotels.map(h => ({ url: h.image, alt: h.name })).filter(i => i.url) : [],
    suggestions: getSmartSuggestions(contextData.hotels.map(h => h.id))
  };
};

function generateLocalResponse(message, userName, data) {
  const msg = normalizeText(message);
  
  // 1. Destination specific
  if (data.destination && JORDAN_KNOWLEDGE.destinations[data.destination]) {
    const dest = JORDAN_KNOWLEDGE.destinations[data.destination];
    return `Ahlan ${userName}! ${data.destination.charAt(0).toUpperCase() + data.destination.slice(1)} is amazing! ${dest.description} ${dest.tips}`;
  }

  // 2. Booking/Hotels
  if (data.hotels.length > 0) {
    return `I've found some fantastic places for you, ${userName}! Check out these gems in ${data.destination || 'Jordan'}. Shall I book one for you?`;
  }

  // 3. Deals
  if (data.deals && data.deals.length > 0) {
    return `You're in luck, ${userName}! We have some special offers right now. Who doesn't love a good bargain?`;
  }

  // 4. Greetings
  if (fuzzyIncludes(msg, 'hello') || fuzzyIncludes(msg, 'hi') || fuzzyIncludes(msg, 'salam')) {
    return `Ya hala, ${userName}! Nashmi here. Where are we going today? Petra? The Dead Sea? Or maybe just hunting for the best falafel?`;
  }

  // 5. Default Witty
  const randomWit = NASHMI_PERSONALITY.wittyRemarks[Math.floor(Math.random() * NASHMI_PERSONALITY.wittyRemarks.length)];
  return `${randomWit} By the way, ${userName}, how can I help you plan your trip?`;
}

export const getSmartSuggestions = (viewedHotels = [], _preferences = {}) => {
  const unique = [...new Set(Array.isArray(viewedHotels) ? viewedHotels : [])].filter(Boolean);
  const suggestions = ["Best hotels in Amman", "Deals in Aqaba", "Visit Petra", "Dead Sea Spas"];
  
  // Add dynamic suggestions based on viewed hotels if available
  if (unique.length > 0) {
    suggestions.unshift("Similar to your last view");
  }
  
  return suggestions.slice(0, 4);
};

export default {
  generateChatResponse,
  getSmartSuggestions
};
