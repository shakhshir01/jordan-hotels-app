(async () => {
  try {
    const mod = await import('./index.js');
    const handler = mod.handler || mod.default;
    const event = { body: JSON.stringify({ filename: 'photo.jpg' }) };
    const result = await handler(event);
    console.log('getSignedUrl result:', JSON.stringify(result, null, 2));
    process.exit(result && result.statusCode === 200 ? 0 : 2);
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
