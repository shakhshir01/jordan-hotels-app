const defaultHeaders = {
  "Content-Type": "application/json",
  "Vary": "Origin",
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
    const limit = Math.min(parseInt(qs.limit) || 30, 100); // Max 100 results
    const cursor = qs.cursor ? parseInt(qs.cursor) : 0;

    if (!q) {
      return json(400, { message: "Query parameter 'q' is required" });
    }

    const hotelsTable = process.env.HOTELS_TABLE;
    if (!hotelsTable) {
      return json(500, { message: "Hotels table not configured" });
    }

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
      DynamoDBDocumentClient,
      ScanCommand,
    } = await import("@aws-sdk/lib-dynamodb");

    const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    // Scan all hotels (for small datasets, this is acceptable)
    // For larger datasets, consider using GSI or Elasticsearch
    const scanResult = await client.send(new ScanCommand({
      TableName: hotelsTable,
      Limit: 1000 // Reasonable limit for hotel data
    }));

    const allHotels = Array.isArray(scanResult?.Items) ? scanResult.Items : [];

    // Search hotels by name, location, destination, or city
    const matchingHotels = allHotels.filter(hotel => {
      const searchFields = [
        hotel.name,
        hotel.location,
        hotel.destination,
        hotel.city
      ].filter(Boolean).map(field => String(field).toLowerCase());

      return searchFields.some(field => field.includes(q));
    });

    // Apply pagination
    const startIndex = cursor;
    const endIndex = startIndex + limit;
    const paginatedHotels = matchingHotels.slice(startIndex, endIndex);
    const nextCursor = endIndex < matchingHotels.length ? String(endIndex) : null;

    const results = {
      hotels: paginatedHotels,
      nextCursor,
      total: matchingHotels.length,
      query: q
    };

    return json(200, results);
  } catch (err) {
    console.error("search error", err);
    return json(500, { message: "Internal error" });
  }
}
