const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
  "Vary": "Origin",
};

const json = (statusCode, body) => ({
  statusCode,
  headers: defaultHeaders,
  body: body == null ? "" : JSON.stringify(body),
});

async function handler(event) {
  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") return { statusCode: 200, headers: defaultHeaders, body: "" };

  const path = event?.path || event?.rawPath || "";
  const pathExperienceId = event?.pathParameters?.id || null;

  // Handle image registration for experiences
  if (method === "POST" && path.includes("/images") && pathExperienceId) {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const { key } = body;
      
      if (!key) {
        return json(400, { message: "Image key is required" });
      }

      const tableName = process.env.EXPERIENCES_TABLE;
      if (!tableName) {
        return json(500, { message: "Experiences table not configured" });
      }

      const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
      const { DynamoDBDocumentClient, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/lib-dynamodb");
      const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

      // Get current experience
      const getResult = await client.send(new GetItemCommand({
        TableName: tableName,
        Key: { id: pathExperienceId }
      }));

      if (!getResult.Item) {
        return json(404, { message: "Experience not found" });
      }

      const experience = getResult.Item;
      const currentImages = experience.images || [];
      const updatedImages = [...currentImages, key];

      // Update experience with new image
      await client.send(new UpdateItemCommand({
        TableName: tableName,
        Key: { id: pathExperienceId },
        UpdateExpression: "SET images = :images, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":images": updatedImages,
          ":updatedAt": new Date().toISOString()
        }
      }));

      return json(200, { 
        message: "Image registered successfully",
        experienceId: pathExperienceId,
        imageKey: key,
        totalImages: updatedImages.length
      });
    } catch (err) {
      console.error("Register experience image error", err);
      return json(500, { message: "Failed to register image" });
    }
  }

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

