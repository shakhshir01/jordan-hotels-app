const defaultHeaders = {
  "Content-Type": "application/json",
  // Let API Gateway set Access-Control-Allow-* headers to avoid duplicates
  "Vary": "Origin",
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

  const path = event?.path || event?.rawPath || "";
  const pathHotelId = event?.pathParameters?.id || null;

  // Handle image registration for hotels
  if (method === "POST" && path.includes("/images") && pathHotelId) {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const { key } = body;
      
      if (!key) {
        return json(400, { message: "Image key is required" });
      }

      const tableName = process.env.HOTELS_TABLE || process.env.DYNAMODB_TABLE_HOTELS;
      if (!tableName) {
        return json(500, { message: "Hotels table not configured" });
      }

      const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
      const { DynamoDBDocumentClient, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/lib-dynamodb");
      const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

      // Get current hotel
      const getResult = await client.send(new GetItemCommand({
        TableName: tableName,
        Key: { id: pathHotelId }
      }));

      if (!getResult.Item) {
        return json(404, { message: "Hotel not found" });
      }

      const hotel = getResult.Item;
      const currentImages = hotel.images || [];
      const updatedImages = [...currentImages, key];

      // Update hotel with new image
      await client.send(new UpdateItemCommand({
        TableName: tableName,
        Key: { id: pathHotelId },
        UpdateExpression: "SET images = :images, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":images": updatedImages,
          ":updatedAt": new Date().toISOString()
        }
      }));

      return json(200, { 
        message: "Image registered successfully",
        hotelId: pathHotelId,
        imageKey: key,
        totalImages: updatedImages.length
      });
    } catch (err) {
      console.error("Register hotel image error", err);
      return json(500, { message: "Failed to register image" });
    }
  }

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
