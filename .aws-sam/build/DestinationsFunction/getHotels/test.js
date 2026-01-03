(async () => {
  try {
    const mod = await import('./index.js');
    const handler = mod.handler || mod.default;
    const result = await handler({});
    console.log('getHotels result:', JSON.stringify(result, null, 2));
    process.exitCode = result && result.statusCode === 200 ? 0 : 2;
  } catch (err) {
    console.error('error', err);
    process.exitCode = 1;
  }
})();
