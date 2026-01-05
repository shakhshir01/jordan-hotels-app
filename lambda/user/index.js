import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE || "Bookings";
const USERS_TABLE = process.env.USERS_TABLE || "Users";

const ALLOWED_ORIGINS = new Set([
  "https://main.d1ewsonl19kjj7.amplifyapp.com",
  "http://localhost:5173",
  "http://localhost:5174",
]);

const getCorsHeaders = (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://main.d1ewsonl19kjj7.amplifyapp.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
    "Vary": "Origin",
  };
};

// Mock user profile for demo mode
const mockUserProfile = {
  userId: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+962779123456',
  location: 'Amman, Jordan',
  joinedDate: '2025-01-01',
  membershipTier: 'Gold'
};

// Mock bookings
const mockBookings = [
  {
    id: 'booking-001',
    hotelId: 'hotel-dead-sea',
    hotelName: 'Mövenpick Dead Sea',
    checkInDate: '2026-02-15',
    checkOutDate: '2026-02-18',
    numberOfGuests: 2,
    numberOfRooms: 1,
    totalPrice: 450,
    status: 'confirmed',
    bookingDate: '2026-01-03'
  },
  {
    id: 'booking-002',
    hotelId: 'hotel-wadi-rum',
    hotelName: 'Wadi Rum Bubble Camp',
    checkInDate: '2026-03-10',
    checkOutDate: '2026-03-12',
    numberOfGuests: 4,
    numberOfRooms: 2,
    totalPrice: 320,
    status: 'confirmed',
    bookingDate: '2025-12-20'
  }
];

export async function handler(event) {
  console.log("Event:", JSON.stringify(event, null, 2));

  const corsHeaders = getCorsHeaders(event);
  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: "",
    };
  }

  try {
    const path = event.rawPath || event.path || "";
    const userId = event.requestContext?.authorizer?.claims?.sub || "demo-user";

    // GET /user/profile
    if (path === '/user/profile' && method === 'GET') {
      return await getUserProfile(userId, event);
    }

    // PUT /user/profile
    if (path === '/user/profile' && method === 'PUT') {
      return await updateUserProfile(userId, event);
    }

    // GET /user/bookings
    if (path === '/user/bookings' && method === 'GET') {
      return await getUserBookings(userId, event);
    }

    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ message: "Not found" })
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
}

async function getUserProfile(userId, event) {
  const corsHeaders = getCorsHeaders(event);
  try {
    if (USERS_TABLE) {
      const result = await docClient.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId },
        })
      );

      if (result && result.Item) {
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
          body: JSON.stringify(result.Item),
        };
      }
    }

    // Fallback: derive from Cognito claims or mock
    const claims = event.requestContext?.authorizer?.claims || {};
    const email = claims.email || mockUserProfile.email;
    const name =
      claims.name ||
      [claims.given_name, claims.family_name].filter(Boolean).join(' ') ||
      mockUserProfile.name;

    const item = {
      userId,
      name,
      email,
      firstName: claims.given_name || name.split(' ')[0] || 'Guest',
      lastName: claims.family_name || name.split(' ').slice(1).join(' '),
      phone: claims.phone_number || mockUserProfile.phone,
      location: mockUserProfile.location,
      joinedDate: mockUserProfile.joinedDate,
      membershipTier: mockUserProfile.membershipTier,
    };

    if (USERS_TABLE) {
      try {
        await docClient.send(
          new PutCommand({
            TableName: USERS_TABLE,
            Item: item,
          })
        );
      } catch (putErr) {
        console.warn("Failed to seed user profile into Users table:", putErr.message || putErr);
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify(mockUserProfile),
    };
  }
}

async function updateUserProfile(userId, event) {
  const corsHeaders = getCorsHeaders(event);
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const firstName = body.firstName || body.given_name || body.name?.split(' ')[0] || 'Guest';
    const lastName = body.lastName || body.family_name || body.name?.split(' ').slice(1).join(' ') || '';
    const email = body.email || mockUserProfile.email;
    const phone = body.phone || mockUserProfile.phone;

    const item = {
      userId,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      location: body.location || mockUserProfile.location,
      joinedDate: body.joinedDate || mockUserProfile.joinedDate,
      membershipTier: body.membershipTier || mockUserProfile.membershipTier,
    };

    if (USERS_TABLE) {
      await docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: item,
        })
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({ message: "Failed to update profile" }),
    };
  }
}

async function getUserBookings(userId, event) {
  const corsHeaders = getCorsHeaders(event);
  try {
    // Query Bookings table for user's bookings
    const params = {
      TableName: BOOKINGS_TABLE,
      IndexName: 'UserIdIndex', // assuming you have this index
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({
        bookings: result.Items || [],
        count: result.Count || 0
      })
    };
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    
    // Return mock bookings on error (demo mode)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify({
        bookings: mockBookings,
        count: mockBookings.length
      })
    };
  }
}
