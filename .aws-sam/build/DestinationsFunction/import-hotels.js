const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }));
const hotelsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'hotels-data.json'), 'utf-8'));

async function importHotels() {
  console.log(`Importing ${hotelsData.length} hotels to DynamoDB...`);
  
  for (const hotel of hotelsData) {
    try {
      await client.send(new PutCommand({
        TableName: 'hotels',
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
