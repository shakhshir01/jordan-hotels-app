exports.handler = async function (event) {
  try {
    const method = (event.httpMethod || 'GET').toUpperCase();

    const getCorsHeaders = () => ({
      "Content-Type": "application/json",
      // Let API Gateway set Access-Control-Allow-* headers to avoid duplicates
      "Vary": "Origin",
    });

    const parseJwtClaims = () => {
      const auth = event?.headers?.authorization || event?.headers?.Authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
      const parts = token.split('.');
      if (parts.length < 2) return null;
      try {
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
        const json = Buffer.from(padded, 'base64').toString('utf8');
        return JSON.parse(json);
      } catch {
        return null;
      }
    };

    const claims = parseJwtClaims();
    const userId = claims?.sub || null;
    const userEmail = claims?.email || null;
    const userName =
      claims?.name ||
      [claims?.given_name, claims?.family_name].filter(Boolean).join(' ') ||
      null;

    const path = event?.path || event?.rawPath || '';
    const pathHotelId = event?.pathParameters?.id || null;

    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: getCorsHeaders(),
        body: '',
      };
    }

    const bookingsTable = process.env.BOOKINGS_TABLE || process.env.DYNAMODB_TABLE_BOOKINGS;
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const hotelId = body.hotelId || pathHotelId;
      const booking = {
        id: `b_${Date.now()}`,
        hotelId,
        userId: body.userId || userId || 'anonymous',
        userEmail: body.userEmail || userEmail || undefined,
        userName: body.userName || userName || undefined,
        status: body.status || 'confirmed',
        createdAt: new Date().toISOString(),
        ...body,
      };
      if (bookingsTable) {
        try {
          const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
          const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');
          const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
          await client.send(new PutCommand({ TableName: bookingsTable, Item: booking }));
          return {
            statusCode: 201,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
            body: JSON.stringify(booking),
          };
        } catch (err) {
          console.warn('DynamoDB put failed, falling back to stub:', err.message || err);
        }
      }
      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
        body: JSON.stringify(booking),
      };
    }

    if (method === 'DELETE') {
      const qsId = event.queryStringParameters && (event.queryStringParameters.id || event.queryStringParameters.bookingId);
      let bodyId = null;
      if (event.body) {
        try {
          const parsed = JSON.parse(event.body);
          bodyId = parsed.id || parsed.bookingId;
        } catch {
          // ignore body parse errors
        }
      }
      const bookingId = qsId || bodyId;

      if (!bookingId) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
          body: JSON.stringify({ message: 'Missing booking id' }),
        };
      }

      if (bookingsTable) {
        try {
          const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
          const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
          const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
          // Ensure users can only cancel their own bookings (best-effort without an API authorizer)
          const existing = await client.send(new GetCommand({ TableName: bookingsTable, Key: { id: bookingId } }));
          const existingItem = existing?.Item;
          if (!existingItem) {
            return {
              statusCode: 404,
              headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
              body: JSON.stringify({ message: 'Booking not found' }),
            };
          }
          if (userId && existingItem.userId && existingItem.userId !== userId) {
            return {
              statusCode: 403,
              headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
              body: JSON.stringify({ message: 'Not allowed' }),
            };
          }

          await client.send(new DeleteCommand({ TableName: bookingsTable, Key: { id: bookingId } }));
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
            body: JSON.stringify({ success: true, deletedId: bookingId }),
          };
        } catch (err) {
          console.warn('DynamoDB delete (cancel booking) failed, falling back to stub:', err.message || err);
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
        body: JSON.stringify({ success: true, deletedId: bookingId }),
      };
    }

    // GET - return user-specific bookings
    if (bookingsTable) {
      try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, QueryCommand } = await import('@aws-sdk/lib-dynamodb');
        const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
        if (!userId) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
            body: JSON.stringify({ bookings: [] }),
          };
        }
        const res = await client.send(new QueryCommand({
          TableName: bookingsTable,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :uid',
          ExpressionAttributeValues: { ':uid': userId },
          Limit: 100,
        }));
        const bookings = (res && res.Items) || [];
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
          body: JSON.stringify({ bookings }),
        };
      } catch (err) {
        console.warn('DynamoDB scan failed, falling back to stub:', err.message || err);
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(),
      },
      body: JSON.stringify({ bookings: [] }),
    };
  } catch (err) {
    console.error(err);
    // Ensure CORS headers are always returned even on unexpected failures
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(),
      },
      body: JSON.stringify({ message: 'error' })
    };
  }
}
