import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import path from "path";
import { fileURLToPath } from "url";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const stackName = process.env.STACK_NAME || "VisitJo";

const TABLES = {
  HOTELS: process.env.HOTELS_TABLE || `${stackName}-Hotels`,
  DESTINATIONS: process.env.DESTINATIONS_TABLE || `${stackName}-Destinations`,
  DEALS: process.env.DEALS_TABLE || `${stackName}-Deals`,
  EXPERIENCES: process.env.EXPERIENCES_TABLE || `${stackName}-Experiences`,
  BOOKINGS: process.env.BOOKINGS_TABLE || `${stackName}-Bookings`,
};

const now = () => new Date().toISOString();

const sampleHotels = [
  {
    id: "h-movenpick-deadsea",
    name: "Mövenpick Resort Dead Sea",
    location: "Dead Sea",
    price: 180,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
    description: "Luxury resort on the Dead Sea with spa and pools.",
    createdAt: now(),
  },
  {
    id: "h-wadi-rum-bubble",
    name: "Wadi Rum Bubble Luxotel",
    location: "Wadi Rum",
    price: 240,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200",
    description: "Unique bubble tents in the desert under stars.",
    createdAt: now(),
  },
  {
    id: "h-st-regis-amman",
    name: "The St. Regis Amman",
    location: "Amman",
    price: 210,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200",
    description: "Five-star service in the heart of Amman.",
    createdAt: now(),
  },
];

const sampleDestinations = [
  { id: "d-amman", name: "Amman", description: "Capital city with rich culture", hotels: ["h-st-regis-amman"], createdAt: now() },
  { id: "d-petra", name: "Petra", description: "Ancient rock-cut city", hotels: [], createdAt: now() },
  { id: "d-wadi-rum", name: "Wadi Rum", description: "Dramatic desert landscapes", hotels: ["h-wadi-rum-bubble"], createdAt: now() },
];

const sampleDeals = [
  { id: "deal-weekend-escape", title: "Weekend escape", meta: "City stays • Limited time", price: "From 99 JOD", createdAt: now() },
  { id: "deal-desert-combo", title: "Desert + Petra combo", meta: "Curated itinerary • Best value", price: "From 299 JOD", createdAt: now() },
];

const sampleExperiences = [
  { id: "e-petra-night", title: "Petra by Night", meta: "Evening • Culture", price: 45, createdAt: now() },
  { id: "e-wadi-rum-4x4", title: "Wadi Rum 4x4 Tour", meta: "Desert • Sunset", price: 85, createdAt: now() },
];

async function putItem(table, item) {
  try {
    await client.send(new PutCommand({ TableName: table, Item: item }));
    console.log(`Wrote ${item.id} -> ${table}`);
  } catch (err) {
    console.error(`Failed to write ${item.id} -> ${table}:`, err.message || err);
    throw err;
  }
}

async function seed() {
  console.log("Seeding DynamoDB tables:", TABLES);
  for (const h of sampleHotels) await putItem(TABLES.HOTELS, h);
  for (const d of sampleDestinations) await putItem(TABLES.DESTINATIONS, d);
  for (const dl of sampleDeals) await putItem(TABLES.DEALS, dl);
  for (const ex of sampleExperiences) await putItem(TABLES.EXPERIENCES, ex);

  // Create a sample booking
  const booking = { id: `b_${Date.now()}`, hotelId: sampleHotels[0].id, userId: "u_demo", nights: 2, total: sampleHotels[0].price * 2, createdAt: now() };
  await putItem(TABLES.BOOKINGS, booking);

  console.log("Seeding complete.");
}

const isMain = (() => {
  const thisFile = fileURLToPath(import.meta.url);
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return invoked && path.resolve(thisFile) === invoked;
})();

if (isMain) {
  seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}

