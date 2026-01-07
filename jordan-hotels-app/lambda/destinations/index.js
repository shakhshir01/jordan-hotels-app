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

  const tableName = process.env.DESTINATIONS_TABLE;
  const id = event?.pathParameters?.id ? String(event.pathParameters.id) : "";

  try {
    if (!tableName) return json(200, { destinations: [] });

    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const {
      DynamoDBDocumentClient,
      ScanCommand,
      GetCommand,
    } = await import("@aws-sdk/lib-dynamodb");

    const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    if (id) {
      const res = await client.send(new GetCommand({ TableName: tableName, Key: { id } }));
      const destination = res?.Item || null;
      return json(200, destination);
    }

    const res = await client.send(new ScanCommand({ TableName: tableName, Limit: 200 }));
    const destinations = Array.isArray(res?.Items) ? res.Items : [];
    return json(200, destinations);
  } catch (err) {
    console.error("destinations error", err);
    return json(500, { message: "Internal server error" });
  }
}
