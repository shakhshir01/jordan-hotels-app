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

export async function handler(event) {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") return { statusCode: 200, headers: defaultHeaders, body: "" };

  try {
    const tableName = process.env.HOTELS_TABLE || process.env.DYNAMODB_TABLE_HOTELS;
    if (!tableName) {
      return json(200, {
        hotels: [
          { id: "h1", name: "Amman Palace", city: "Amman", rating: 4.5 },
          { id: "h2", name: "Petra Inn", city: "Wadi Musa", rating: 4.7 },
        ],
      });
    }

    const qs = event?.queryStringParameters || {};
    const limit = clampInt(qs.limit, 1, 200, 100);
    const cursor = decodeCursor(qs.cursor);

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient, ScanCommand } = await import("@aws-sdk/lib-dynamodb");
    const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    const input = {
      TableName: tableName,
      Limit: limit,
      ...(cursor ? { ExclusiveStartKey: cursor } : {}),
    };

    const res = await client.send(new ScanCommand(input));
    const hotels = Array.isArray(res?.Items) ? res.Items : [];
    const nextCursor = encodeCursor(res?.LastEvaluatedKey);

    return json(200, {
      hotels,
      nextCursor: nextCursor || null,
    });
  } catch (err) {
    console.error("getHotels error", err);
    return json(500, { message: "Internal server error" });
  }
}
