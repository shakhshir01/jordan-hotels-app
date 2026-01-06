import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" })
);
const hotelsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "hotels-data.json"), "utf-8")
);

async function importHotels() {
  console.log(`Importing ${hotelsData.length} hotels to DynamoDB...`);
  const tableName = process.env.HOTELS_TABLE || process.env.DYNAMODB_TABLE_HOTELS || 'hotels';
  console.log(`Using table: ${tableName}`);
  
  for (const hotel of hotelsData) {
    try {
      await client.send(new PutCommand({
        TableName: tableName,
        Item: hotel
      }));
      console.log(`✓ Imported: ${hotel.name}`);
    } catch (error) {
      console.error(`✗ Failed to import ${hotel.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Import complete!');
}

importHotels().catch(console.error);
