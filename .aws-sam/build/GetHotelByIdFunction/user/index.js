const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE || 'Bookings';

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

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const path = event.rawPath || event.path || '';
    const userId = event.requestContext?.authorizer?.claims?.sub || 'demo-user';

    // GET /user/profile
    if (path === '/user/profile' && event.requestContext.http.method === 'GET') {
      return await getUserProfile(userId);
    }

    // GET /user/bookings
    if (path === '/user/bookings' && event.requestContext.http.method === 'GET') {
      return await getUserBookings(userId);
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Not found' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};

async function getUserProfile(userId) {
  try {
    // For demo, return mock profile
    // In production, you would query Cognito or a users table
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(mockUserProfile)
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return mock data on error (demo mode)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(mockUserProfile)
    };
  }
}

async function getUserBookings(userId) {
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
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        bookings: result.Items || [],
        count: result.Count || 0
      })
    };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    
    // Return mock bookings on error (demo mode)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        bookings: mockBookings,
        count: mockBookings.length
      })
    };
  }
}
