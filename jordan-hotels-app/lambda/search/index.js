import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(ddb);

const ALLOWED_ORIGINS = new Set([
  "https://main.d1ewsonl19kjj7.amplifyapp.com",
  "http://localhost:5173",
  "http://localhost:5174",
]);

const getCorsHeaders = (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://main.d1ewsonl19kjj7.amplifyapp.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
    "Vary": "Origin",
  };
};

const parseEventQuery = (event) => {
  const qp = event?.queryStringParameters || {};
  const q = (qp.q || "").trim();
  const scope = String(qp.scope || "").trim().toLowerCase();
  const cursor = String(qp.cursor || "").trim();
  const limitRaw = Number(qp.limit);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, Math.floor(limitRaw))) : 30;
  return { q, scope, cursor, limit };
};

const encodeCursor = (key) => {
  if (!key || typeof key !== 'object') return '';
  try {
    return Buffer.from(JSON.stringify(key), 'utf8').toString('base64');
  } catch {
    return '';
  }
};

const decodeCursor = (cursor) => {
  const c = String(cursor || '').trim();
  if (!c) return null;
  try {
    const json = Buffer.from(c, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeQueryToTokens = (q) => {
  const raw = String(q || '').trim();
  if (!raw) return [];

  // Normalize whitespace
  let s = raw.replace(/\s+/g, ' ').trim();

  // Map Arabic multi-word phrases first
  const phraseMap = [
    { from: /\bالبحر\s+الميت\b/g, to: 'dead sea' },
    { from: /\bوادي\s+رم\b/g, to: 'wadi rum' },
  ];
  for (const p of phraseMap) s = s.replace(p.from, p.to);

  // Then map common single-word Arabic destinations
  const wordMap = new Map([
    ['عمان', 'amman'],
    ['عمّان', 'amman'],
    ['البترا', 'petra'],
    ['بترا', 'petra'],
    ['البتراء', 'petra'],
    ['العقبة', 'aqaba'],
    ['عقبة', 'aqaba'],
    ['رم', 'rum'],
  ]);

  const parts = s.split(' ').filter(Boolean);
  const tokens = [];
  for (const part of parts) {
    const mapped = wordMap.get(part) || part;
    tokens.push(mapped);
  }

  // Also keep the full normalized string for phrase matching
  tokens.push(s);

  // Lowercase + dedupe
  const out = [];
  const seen = new Set();
  for (const t of tokens) {
    const tl = String(t || '').toLowerCase().trim();
    if (!tl) continue;
    if (seen.has(tl)) continue;
    seen.add(tl);
    out.push(tl);
  }

  return out;
};

export async function handler(event) {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  const corsHeaders = getCorsHeaders(event);

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: "",
    };
  }

  try {
    const { q, scope, cursor, limit } = parseEventQuery(event);
    const qTokens = normalizeQueryToTokens(q);
    const hotelsTable = process.env.HOTELS_TABLE;
    const destinationsTable = process.env.DESTINATIONS_TABLE;
    const dealsTable = process.env.DEALS_TABLE;
    const experiencesTable = process.env.EXPERIENCES_TABLE;

    const matchesAnyToken = (it, fields) => {
      if (!q) return true;
      const haystacks = fields.map((f) => String(it?.[f] || '').toLowerCase());
      return qTokens.some((token) => haystacks.some((h) => h.includes(token)));
    };

    // Hotels-only paged search for smooth infinite scrolling.
    if (scope === 'hotels') {
      if (!hotelsTable) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
          body: JSON.stringify({ hotels: [], nextCursor: null }),
        };
      }

      const scanLimit = 200;
      const maxScans = 12;
      const out = [];
      let lastKey = decodeCursor(cursor);
      let scans = 0;

      while (out.length < limit && scans < maxScans) {
        const res = await client.send(
          new ScanCommand({
            TableName: hotelsTable,
            Limit: scanLimit,
            ExclusiveStartKey: lastKey || undefined,
          })
        );

        const items = (res && res.Items) || [];
        for (const it of items) {
          if (matchesAnyToken(it, ['name', 'location', 'destination'])) {
            out.push(it);
            if (out.length >= limit) break;
          }
        }

        lastKey = res?.LastEvaluatedKey || null;
        scans += 1;
        if (!lastKey) break;
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
        body: JSON.stringify({ hotels: out, nextCursor: lastKey ? encodeCursor(lastKey) : null }),
      };
    }

    // Helper: scan + basic filter by contains on 'name' or 'title'
    // NOTE: This is intentionally a *sampled* scan to keep the multi-search fast.
    const scanAndFilter = async (TableName, fields = ["name", "title"], maxItems = 200) => {
      if (!TableName) return [];
      const res = await client.send(new ScanCommand({ TableName, Limit: maxItems }));
      const items = (res && res.Items) || [];
      if (!q) return items;

      return items.filter((it) => {
        return matchesAnyToken(it, fields);
      });
    };

    const [hotels, destinations, deals, experiences] = await Promise.all([
      scanAndFilter(hotelsTable, ["name", "location"], 200),
      scanAndFilter(destinationsTable, ["name", "description"], 200),
      scanAndFilter(dealsTable, ["title", "meta"], 200),
      scanAndFilter(experiencesTable, ["title", "meta"], 200),
    ]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ hotels, destinations, deals, experiences }),
    };
  } catch (err) {
    console.error("search error", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ message: "Internal error" }),
    };
  }
}
