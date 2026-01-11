const defaultHeaders = {
  "Content-Type": "application/json",
};

const json = (statusCode, body) => ({
  statusCode,
  headers: defaultHeaders,
  body: body == null ? "" : JSON.stringify(body),
});

async function handler(event) {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") return { statusCode: 200, headers: defaultHeaders, body: "" };

  const tableName = process.env.EXPERIENCES_TABLE;
  const id = event?.pathParameters?.id ? String(event.pathParameters.id) : "";

  try {
    if (!tableName) return json(200, { experiences: [] });

    const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
    const {
      DynamoDBDocumentClient,
      ScanCommand,
      GetCommand,
    } = require("@aws-sdk/lib-dynamodb");

    const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    if (id) {
      const res = await client.send(new GetCommand({ TableName: tableName, Key: { id } }));
      const experience = res?.Item || null;
      return json(200, experience);
    }

    const res = await client.send(new ScanCommand({ TableName: tableName, Limit: 200 }));
    const experiences = Array.isArray(res?.Items) ? res.Items : [];
    return json(200, experiences);
  } catch (err) {
    console.error("experiences error", err);
    return json(500, { message: "Internal server error" });
  }
}

module.exports.handler = handler;
