import { handler } from './index.js';

async function run() {
  console.log('Invoking bookings handler (POST stub)');
  const event = {
    httpMethod: 'POST',
    headers: { Origin: 'https://vist-jo.com' },
    body: JSON.stringify({ hotelId: 'h_test', userId: 'u_test' }),
    path: '/bookings'
  };

  try {
    const res = await handler(event);
    console.log('Response:', res);
  } catch (err) {
    console.error('Invocation error:', err);
  }

  console.log('\nInvoking bookings handler (OPTIONS)');
  const opts = { httpMethod: 'OPTIONS', headers: { Origin: 'https://www.visit-jo.com' }, path: '/bookings' };
  try {
    const res2 = await handler(opts);
    console.log('Response:', res2);
  } catch (err) {
    console.error('Invocation error:', err);
  }
}

run();
