export async function handler(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { filename } = body;
    if (!filename) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'filename required' }) };
    }
    const bucket = process.env.S3_UPLOAD_BUCKET;
    const key = `uploads/${Date.now()}-${filename}`;
    if (bucket) {
      try {
        const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
        const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
        const s3 = new S3Client({});
        const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'application/octet-stream' });
        // 15 minutes
        const url = await getSignedUrl(s3, cmd, { expiresIn: 900 });
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Authorization,Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
          },
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization,Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE',
      },
      body: JSON.stringify({ url, key }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'error' }) };
  }
}
