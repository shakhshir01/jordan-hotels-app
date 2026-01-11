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

const clampInt = (value, min, max, fallback) => {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    const jsonStr = Buffer.from(String(cursor), "base64").toString("utf8");
    const key = JSON.parse(jsonStr);
    return key && typeof key === "object" ? key : null;
  } catch {
    return null;
  }
};

const encodeCursor = (lastKey) => {
  if (!lastKey) return "";
  try {
    return Buffer.from(JSON.stringify(lastKey), "utf8").toString("base64");
  } catch {
    return "";
  }
};

module.exports.handler = async function (event) {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") return { statusCode: 200, headers: defaultHeaders, body: "" };

  try {
    // Fetch hotels from DynamoDB as before
    const tableName = process.env.HOTELS_TABLE || process.env.DYNAMODB_TABLE_HOTELS;
    const qs = event?.queryStringParameters || {};
    const limit = clampInt(qs.limit, 1, 200, 100);
    const cursor = decodeCursor(qs.cursor);

    let hotels = [];
    if (tableName) {
      const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
      const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
      const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
      const input = {
        TableName: tableName,
        Limit: limit,
        ...(cursor ? { ExclusiveStartKey: cursor } : {}),
      };
      const res = await client.send(new ScanCommand(input));
      hotels = Array.isArray(res?.Items) ? res.Items : [];
    }

    // Fetch public hotel data from Xotelo
    let publicHotels = [];
    try {
      const { fetchXoteloHotels } = require("./xotelo.js");
      publicHotels = await fetchXoteloHotels({ locationKey: "g293985", limit: 200 });
    } catch (err) {
      console.warn("Failed to fetch public hotels from Xotelo:", err.message || err);
    }

    // Merge DynamoDB and public hotels (by id)
    const byId = new Map();
    for (const h of [...publicHotels, ...hotels]) {
      if (h && h.id) byId.set(h.id, h);
    }
    const mergedHotels = Array.from(byId.values());

    return json(200, {
      hotels: mergedHotels,
      nextCursor: null,
    });
  } catch (err) {
    console.error("getHotels error", err);
    return json(500, { message: "Internal server error" });
  }
}
