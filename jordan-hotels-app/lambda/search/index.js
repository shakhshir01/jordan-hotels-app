const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

const json = (statusCode, body) => ({
  statusCode,
  headers: defaultHeaders,
  body: body == null ? "" : JSON.stringify(body),
});

export async function handler(event) {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") return { statusCode: 200, headers: defaultHeaders, body: "" };

  try {
    const qs = event?.queryStringParameters || {};
    const q = (qs.q || "").trim().toLowerCase();

    if (!q) {
      return json(400, { message: "Query parameter '\''q'\'' is required" });
    }

    // Simple search implementation - return empty results for now
    const results = {
      hotels: [],
      destinations: [],
      experiences: []
    };

    return json(200, results);
  } catch (err) {
    console.error("search error", err);
    return json(500, { message: "Internal error" });
  }
}
