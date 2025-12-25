export async function handler(event) {
  try {
    const id = event.pathParameters && event.pathParameters.id;
    if (!id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Missing id path parameter' }),
      };
    }
    // If a DynamoDB table name is provided, try to fetch from DynamoDB.
    const tableName = process.env.DYNAMODB_TABLE_HOTELS;
    if (tableName) {
      try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, GetCommand } = await import('@aws-sdk/lib-dynamodb');
        const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
        const res = await client.send(new GetCommand({ TableName: tableName, Key: { id } }));
        if (res && res.Item) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Authorization,Content-Type',
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
            },
            body: JSON.stringify(res.Item),
          };
        }
      } catch (err) {
        console.warn('DynamoDB fetch failed, falling back to stub:', err.message || err);
      }
    }

    // Fallback stub when no table or DynamoDB call fails
    const hotel = {
      id,
      name: 'Demo Hotel',
      city: 'Amman',
      rating: 4.3,
      rooms: 42,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
      },
      body: JSON.stringify(hotel),
    };
  } catch (err) {
    console.error('handler error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
