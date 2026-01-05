import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(ddb);

const parseEventQuery = (event) => {
  const q = event?.queryStringParameters?.q || "";
  return q.trim();
};

export async function handler(event) {
  try {
    const q = parseEventQuery(event);
    const hotelsTable = process.env.HOTELS_TABLE;
    const destinationsTable = process.env.DESTINATIONS_TABLE;
    const dealsTable = process.env.DEALS_TABLE;
    const experiencesTable = process.env.EXPERIENCES_TABLE;

    // Helper: scan + basic filter by contains on 'name' or 'title'
    const scanAndFilter = async (TableName, fields = ["name", "title"]) => {
      if (!TableName) return [];
      const res = await client.send(new ScanCommand({ TableName }));
      const items = (res && res.Items) || [];
      if (!q) return items;
      const ql = q.toLowerCase();
      return items.filter((it) => {
        return fields.some((f) => (String(it[f] || "").toLowerCase().includes(ql)));
      });
    };

    const [hotels, destinations, deals, experiences] = await Promise.all([
      scanAndFilter(hotelsTable, ["name", "location"]),
      scanAndFilter(destinationsTable, ["name", "description"]),
      scanAndFilter(dealsTable, ["title", "meta"]),
      scanAndFilter(experiencesTable, ["title", "meta"]),
    ]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ hotels, destinations, deals, experiences }),
    };
  } catch (err) {
    console.error("search error", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal error" }),
    };
  }
}
