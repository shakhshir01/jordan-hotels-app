const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({});

const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
  "Vary": "Origin",
};

exports.handler = async function(event) {
  try {
    const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: "",
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { filename } = body;
    if (!filename) {
      return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ message: 'filename required' }) };
    }
    const bucket = process.env.S3_UPLOAD_BUCKET;
    const key = `uploads/${Date.now()}-${filename}`;
    if (bucket) {
      try {
        const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'application/octet-stream' });
        // 15 minutes
        const url = await getSignedUrl(s3, cmd, { expiresIn: 900 });
        return {
          statusCode: 200,
          headers: defaultHeaders,
          body: JSON.stringify({ url, key }),
        };
      } catch (err) {
        console.warn('S3 presign failed, falling back to stub:', err.message || err);
      }
    }

    // Fallback stub when bucket not set or presign fails
    const url = `https://s3.us-east-1.amazonaws.com/demo-bucket/${key}?signature=stub`;
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({ url, key }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ message: 'error' }) };
  }
}

