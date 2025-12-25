export async function handler(event) {
  try {
    // Expect POST with body containing { hotelId, userId, amount }
    const body = event.body ? JSON.parse(event.body) : {};
    const { hotelId, userId, amount = 0, currency = 'usd', successUrl, cancelUrl } = body;

    // First try environment variable for Stripe secret
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const secretArn = process.env.STRIPE_SECRET_ARN;

    // Helper: return stubbed session
    const stubSession = () => ({ sessionId: `cs_test_${Date.now()}` });

    // If STRIPE_SECRET_KEY is present, try to create a real session
    if (stripeKey || secretArn) {
      try {
        let key = stripeKey;
        if (!key && secretArn) {
          // fetch from Secrets Manager
          const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
          const sm = new SecretsManagerClient({});
          const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretArn }));
          if (resp && resp.SecretString) {
            try {
              const parsed = JSON.parse(resp.SecretString);
              key = parsed.STRIPE_SECRET_KEY || parsed.stripeKey || parsed.key || parsed.secret;
            } catch (e) {
              key = resp.SecretString;
            }
          }
        }

        if (key) {
          try {
            const Stripe = (await import('stripe')).default || (await import('stripe'));
            const stripe = Stripe(key);
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: [
                {
                  price_data: {
                    currency: currency,
                    product_data: { name: `Booking ${hotelId || ''}` },
                    unit_amount: Math.round((amount || 0) * 100),
                  },
                  quantity: 1,
                },
              ],
              mode: 'payment',
              success_url: successUrl || process.env.STRIPE_SUCCESS_URL || 'https://example.com/success',
              cancel_url: cancelUrl || process.env.STRIPE_CANCEL_URL || 'https://example.com/cancel',
            });
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE' },
              body: JSON.stringify({ sessionId: session.id }),
            };
          } catch (err) {
            console.warn('Stripe SDK/create session failed, falling back to stub:', err.message || err);
          }
        }
      } catch (err) {
        console.warn('Secrets Manager fetch failed or missing key, falling back to stub:', err.message || err);
      }
    }

    const { sessionId } = stubSession();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PUT,DELETE' },
      body: JSON.stringify({ sessionId }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'error' }) };
  }
}
