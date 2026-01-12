
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

export {
    NASHMI_PERSONALITY,
    JORDAN_KNOWLEDGE,
    levenshtein,
    stripDiacritics,
    normalizeText,
    fuzzyIncludes,
    extractDestination
}
