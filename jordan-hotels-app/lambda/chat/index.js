const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { query, history } = body;

    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing query in request body' }),
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OPENAI_API_KEY not configured in Lambda environment' }),
      };
    }

    // Basic input validation to avoid huge prompts and control cost.
    if (typeof query === 'string' && query.length > 2000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query too long (max 2000 characters)' }),
      };
    }

    const systemPrompt = `You are an assistant for VisitJo, a hotel booking site. Respond in JSON only with the following keys: \n- text: a short natural-language reply to the user.\n- hotels: an array of hotel ids (strings) that match recommendations (can be empty).\n- suggestions: an array of objects with {text, link} for suggested next actions.\nReturn valid JSON and nothing else.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ];

    if (Array.isArray(history)) {
      // Optionally include recent history for context
      history.slice(-5).forEach((h) => {
        messages.push({ role: h.role || 'user', content: h.content || '' });
      });
    }

    const resp = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.2,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Upstream AI error', details: txt }),
      };
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      // try to extract JSON substring
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
      // Provide a conservative fallback JSON shape
      parsed = {
        text: content.slice(0, 1000),
        hotels: [],
        suggestions: [],
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: String(error) }),
    };
  }
};
