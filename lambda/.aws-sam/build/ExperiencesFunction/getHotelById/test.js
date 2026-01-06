(async () => {
  try {
    // Use dynamic import to support ESM project configs
    const mod = await import('./index.js');
    const handler = (mod && (mod.handler || (mod.default && mod.default.handler))) || (mod.default && mod.default);
    if (!handler) throw new Error('handler not found in module');
    const event = { pathParameters: { id: 'test-123' } };
    const result = await handler(event);
    console.log('Lambda local invocation result:\n', JSON.stringify(result, null, 2));
    if (result && result.statusCode === 200) process.exit(0);
    else process.exit(2);
  } catch (err) {
    console.error('Invocation error', err);
    process.exit(1);
  }
})();
