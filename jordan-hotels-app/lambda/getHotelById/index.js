export async function handler(event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    console.log('Event received:', JSON.stringify(event, null, 2));
    const id = event.pathParameters && event.pathParameters.id;
    if (!id) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({ message: 'Missing id path parameter' }),
      };
    }
    // If a DynamoDB table name is provided, try to fetch from DynamoDB.
    const tableName = process.env.HOTELS_TABLE || process.env.DYNAMODB_TABLE_HOTELS;
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
              ...corsHeaders
            },
            body: JSON.stringify(res.Item),
          };
        }

        // If not found in DynamoDB, try to fetch from Xotelo
        try {
          const { fetchXoteloHotels } = await import("../providers/xotelo.js");
          const xoteloHotels = await fetchXoteloHotels({ locationKey: "g293985", limit: 1000 });
          const xoteloHotel = xoteloHotels.find(h => h.id === id);
          if (xoteloHotel) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify(xoteloHotel),
          };
          }
        } catch (xoteloErr) {
          console.warn('Xotelo fallback failed:', xoteloErr.message || xoteloErr);
        }

        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'Hotel not found', id }),
        };
      } catch (err) {
        console.warn('DynamoDB fetch failed, falling back to stub:', err.message || err);
      }
    }

    // If the Hotels table isn't configured, do NOT return a misleading hardcoded hotel.
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ message: 'Hotels table not configured', id }),
    };
  } catch (err) {
    console.error('handler error', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
