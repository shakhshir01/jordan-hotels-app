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

    const systemPrompt = `You are an assistant for VisitJo, a hotel booking site. Respond in JSON only with the following keys: \n- text: a short natural-language reply to the user.\n- hotels: an array of hotel ids (strings) that match recommendations (can be empty).\n- suggestions: an array of objects with {text, link} for suggested next actions.\nReturn valid JSON and nothing else.`;

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

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
