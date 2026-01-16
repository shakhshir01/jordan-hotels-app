const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;

async function generateAvatarUrl(avatarKey) {
  if (!avatarKey || !BUCKET_NAME) return null;
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: avatarKey,
    });
    return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
  } catch (err) {
    console.error('Error generating avatar URL:', err);
    return null;
  }
}

exports.handler = async (event) => {
  try {
    const sub = event.requestContext?.authorizer?.claims?.sub || event.requestContext?.authorizer?.principalId;
    if (!sub) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

    if (event.httpMethod === 'GET') {
      const res = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { userId: sub } }));
      const profile = res.Item || { userId: sub };
      
      // Generate signed URL for avatar if avatarKey exists
      if (profile.avatarKey) {
        profile.avatarUrl = await generateAvatarUrl(profile.avatarKey);
      }
      
      return { statusCode: 200, body: JSON.stringify(profile) };
    }

    if (event.httpMethod === 'PUT') {
      const body = event.body ? JSON.parse(event.body) : {};
      const existing = (await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { userId: sub } }))).Item || {};
      const updated = { ...existing, ...body, userId: sub, updatedAt: new Date().toISOString() };
      await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));
      
      // Generate signed URL for avatar if avatarKey exists
      if (updated.avatarKey) {
        updated.avatarUrl = await generateAvatarUrl(updated.avatarKey);
      }
      
      return { statusCode: 200, body: JSON.stringify(updated) };
    }

    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  } catch (err) {
    console.error('profile handler error', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message || 'Internal error' }) };
  }
};
