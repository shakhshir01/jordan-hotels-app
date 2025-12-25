export async function handler(event) {
  try {
    const method = (event.httpMethod || 'GET').toUpperCase();
    const bookingsTable = process.env.DYNAMODB_TABLE_BOOKINGS;
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
