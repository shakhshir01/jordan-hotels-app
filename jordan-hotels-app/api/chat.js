import { GoogleGenerativeAI } from '@google/generative-ai';
import { JORDAN_KNOWLEDGE, NASHMI_PERSONALITY, fuzzyIncludes, extractDestination } from './chatbot_logic.js';

// TODO: Replace this with actual API calls to other lambdas/services
const fetchHotels = async () => {
  return [];
};

const fetchDeals = async () => {
  return [];
};

async function gatherContextData(message) {
  const data = {
    hotels: [],
    deals: [],
    destination: null,
    intent: 'chat'
  };

  data.destination = extractDestination(message);

  const isBooking = fuzzyIncludes(message, 'hotel') || fuzzyIncludes(message, 'book') || fuzzyIncludes(message, 'stay') || fuzzyIncludes(message, 'room');
  const isDeal = fuzzyIncludes(message, 'deal') || fuzzyIncludes(message, 'offer') || fuzzyIncludes(message, 'price') || fuzzyIncludes(message, 'cheap');

  if (isBooking || data.destination) {
    data.intent = 'booking';
    try {
      const allHotels = await fetchHotels();
      if (data.destination) {
        data.hotels = allHotels.filter(h =>
          fuzzyIncludes(h.location, data.destination) ||
          fuzzyIncludes(h.name, data.destination) ||
          fuzzyIncludes(h.destination, data.destination)
        ).slice(0, 3);
      } else if (isBooking) {
        data.hotels = allHotels.sort((a, b) => b.rating - a.rating).slice(0, 3);
      }
    } catch (e) { console.error("Error fetching hotels for chat:", e); }
  }

  if (isDeal) {
    data.intent = 'deals';
    try {
      data.deals = await fetchDeals();
    } catch (e) { console.error("Error fetching deals for chat:", e); }
  }

  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query, history, userProfile } = req.body || {};
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

    if (typeof query === 'string' && query.length > 2000) {
      return res.status(400).json({ error: 'Query too long (max 2000 characters)' });
    }

    const userName = userProfile?.displayName || userProfile?.name || 'Friend';
    const contextData = await gatherContextData(query);

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
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chatHistory = history.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
    }));

    const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
        },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser query: ${query}`);
    const responseData = await result.response;
    const content = responseData.text();
    
    const response = {
      text: content,
      hotels: contextData.hotels || [],
      offers: contextData.deals || [],
      images: contextData.hotels.length > 0 ? contextData.hotels.map(h => ({ url: h.image, alt: h.name })).filter(i => i.url) : [],
      suggestions: []
    };

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(response);

  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
