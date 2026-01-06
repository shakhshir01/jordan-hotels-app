export async function handler(event) {
  try {
    const tableName = process.env.HOTELS_TABLE || process.env.DYNAMODB_TABLE_HOTELS;
    if (tableName) {
      try {
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
        const res = await client.send(new ScanCommand({ TableName: tableName, Limit: 100 }));
        const hotels = (res && res.Items) || [];
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Authorization,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
          },
          body: JSON.stringify({ hotels }),
        };
      } catch (err) {
        console.warn('DynamoDB scan failed, falling back to stub:', err.message || err);
      }
    }

    // Fallback stub
    const hotels = [
      { id: 'h1', name: 'Amman Palace', city: 'Amman', rating: 4.5 },
      { id: 'h2', name: 'Petra Inn', city: 'Wadi Musa', rating: 4.7 },
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
      },
      body: JSON.stringify({ hotels }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'error' }) };
  }
}
