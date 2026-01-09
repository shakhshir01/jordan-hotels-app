import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const destinations = [
  {
    id: "d-amman",
    name: "Amman",
    description: "Capital city with rich culture and history",
    hotels: ["h-st-regis-amman"],
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&h=600&fit=crop",
    attractions: ["Roman Theater", "Citadel", "Souk"],
    bestTimeToVisit: "March to May",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d-petra",
    name: "Petra",
    description: "Ancient rock-cut city, one of Seven Wonders",
    hotels: [],
    image: "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?q=80&w=800&h=600&fit=crop",
    attractions: ["Treasury", "Monastery", "Royal Tombs"],
    bestTimeToVisit: "March to May",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d-wadi-rum",
    name: "Wadi Rum",
    description: "Dramatic desert landscapes and Bedouin camps",
    hotels: ["h-wadi-rum-bubble"],
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&h=600&fit=crop",
    attractions: ["Sand Dunes", "Rock Bridges", "Petroglyphs"],
    bestTimeToVisit: "October to April",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d-dead-sea",
    name: "Dead Sea",
    description: "Lowest point on Earth with healing waters",
    hotels: ["h-movenpick-deadsea"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&h=600&fit=crop",
    attractions: ["Mineral Springs", "Mud Baths", "Floating"],
    bestTimeToVisit: "October to April",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d-aqaba",
    name: "Aqaba",
    description: "Red Sea coastal city with diving and beaches",
    hotels: [],
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&h=600&fit=crop",
    attractions: ["Coral Reefs", "Aqaba Castle", "Marine Life"],
    bestTimeToVisit: "May to September",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d-ajloun",
    name: "Ajloun",
    description: "Historic castle and forest reserve",
    hotels: [],
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800&h=600&fit=crop",
    attractions: ["Ajloun Castle", "Pine Forests", "Olive Groves"],
    bestTimeToVisit: "March to June",
    createdAt: new Date().toISOString(),
  },
];

async function seedDestinations() {
  const tableName = process.env.DESTINATIONS_TABLE || "visitjo-destinations-prod";

  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  console.log(`Seeding ${destinations.length} destinations to ${tableName}...`);

  for (const destination of destinations) {
    try {
      await client.send(new PutCommand({
        TableName: tableName,
        Item: destination,
      }));
      console.log(`✓ Seeded ${destination.name}`);
    } catch (error) {
      console.error(`✗ Failed to seed ${destination.name}:`, error.message);
    }
  }

  console.log("Seeding complete!");
}

seedDestinations().catch(console.error);
