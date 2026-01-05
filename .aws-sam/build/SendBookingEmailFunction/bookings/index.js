export async function handler(event) {
  try {
    const method = (event.httpMethod || 'GET').toUpperCase();

    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization,Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
        },
        body: '',
      };
    }

    const bookingsTable = process.env.BOOKINGS_TABLE || process.env.DYNAMODB_TABLE_BOOKINGS;
    if (method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const booking = { id: `b_${Date.now()}`, ...body };
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
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Authorization,Content-Type',
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization,Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Authorization,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
          },
          body: JSON.stringify({ message: 'Missing booking id' }),
        };
      }

      if (bookingsTable) {
        try {
          const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
          const { DynamoDBDocumentClient, UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
          const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
          const result = await client.send(new UpdateCommand({
            TableName: bookingsTable,
            Key: { id: bookingId },
            UpdateExpression: 'SET #s = :cancelled',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':cancelled': 'cancelled' },
            ReturnValues: 'ALL_NEW',
          }));
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Authorization,Content-Type',
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
            },
            body: JSON.stringify({ success: true, booking: result.Attributes || { id: bookingId, status: 'cancelled' } }),
          };
        } catch (err) {
          console.warn('DynamoDB update (cancel booking) failed, falling back to stub:', err.message || err);
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization,Content-Type',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
        },
        body: JSON.stringify({ success: true, booking: { id: bookingId, status: 'cancelled' } }),
      };
    }

    // GET - return sample bookings list or read from DynamoDB
    if (bookingsTable) {
      try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
        const res = await client.send(new ScanCommand({ TableName: bookingsTable, Limit: 100 }));
        const bookings = (res && res.Items) || [];
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Authorization,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
          },
          body: JSON.stringify({ bookings }),
        };
      } catch (err) {
        console.warn('DynamoDB scan failed, falling back to stub:', err.message || err);
      }
    }

    const bookings = [{ id: 'b1', hotelId: 'h1', userId: 'u1', nights: 3 }];
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
      },
      body: JSON.stringify({ bookings }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'error' }) };
  }
}
