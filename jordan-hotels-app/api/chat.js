const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query, history } = req.body || {};
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

    if (typeof query === 'string' && query.length > 2000) {
      return res.status(400).json({ error: 'Query too long (max 2000 characters)' });
    }

    const systemPrompt = `You are the VisitJo assistant. ALWAYS respond with a single VALID JSON object and NOTHING ELSE (no markdown, no commentary). The object must have exactly these keys:\n- text: a short natural-language reply (string).\n- hotels: array of VisitJo hotel id strings (e.g. "hotel-123"). If you cannot identify any matching ids, return an empty array.\n- suggestions: array of objects with {"text":"...","link":"/path"}.\nIf the user asks for recommendations, include hotel ids where possible. If you need clarification, put the question in the "text" field and return an empty "hotels" array. Example: {"text":"Here are options","hotels":["hotel-123"],"suggestions":[{"text":"View hotel 123","link":"/hotels/hotel-123"}]}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ];

    if (Array.isArray(history)) {
      history.slice(-5).forEach((h) => {
        messages.push({ role: h.role || 'user', content: h.content || '' });
      });
    }

    const resp = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, max_tokens: 500, temperature: 0.2 }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(502).json({ error: 'Upstream AI error', details: txt });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('AI raw content:', content);

    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch (e) {
          // fall through
        }
      }
    }

    if (!parsed) {
      parsed = { text: content.slice(0, 1000), hotels: [], suggestions: [] };
    }
    console.log('AI parsed JSON:', parsed);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
