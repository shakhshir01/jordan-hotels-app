(async () => {
  try {
    const mod = await import('./index.js');
    const handler = mod.handler || mod.default;
    // test GET
    const getResult = await handler({ httpMethod: 'GET' });
    console.log('bookings GET result:', JSON.stringify(getResult, null, 2));
    if (!getResult || getResult.statusCode !== 200) process.exit(2);
    // test POST
    const postResult = await handler({ httpMethod: 'POST', body: JSON.stringify({ hotelId: 'h1', userId: 'u1', nights: 2 }) });
    console.log('bookings POST result:', JSON.stringify(postResult, null, 2));
    process.exit(postResult && postResult.statusCode === 201 ? 0 : 2);
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
