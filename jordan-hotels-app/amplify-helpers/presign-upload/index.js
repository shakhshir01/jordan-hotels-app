const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({});

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const filename = body.filename;
    const contentType = body.contentType || 'image/jpeg';
    const bucket = process.env.BUCKET_NAME;

    let sub = event.requestContext?.authorizer?.claims?.sub || null;
    if (!sub) sub = event.requestContext?.authorizer?.principalId || null;

    if (!sub) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    const safe = (filename || 'upload').replace(/[^a-zA-Z0-9.\-_]/g, '');
    const key = `profiles/${sub}/${Date.now()}_${safe}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'private',
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 900 });

    return {
      statusCode: 200,
      body: JSON.stringify({ url, key }),
    };
  } catch (err) {
    console.error('presign error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || 'Internal error' }),
    };
  }
};
