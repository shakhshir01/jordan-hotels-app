import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({});

async function getStripeSecret(secretArn) {
  if (!secretArn) return null;
  try {
    const res = await sm.send(new GetSecretValueCommand({ SecretId: secretArn }));
    const secret = res.SecretString ? JSON.parse(res.SecretString) : null;
    return secret?.STRIPE_SECRET || secret?.stripe || res.SecretString;
  } catch (err) {
    console.warn("Failed to read stripe secret", err);
    return null;
  }
}

export async function handler(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { hotelId, amount, booking } = body;
    const secretArn = process.env.STRIPE_SECRET_ARN;

    // Safety valve: only allow real Stripe sessions when explicitly enabled.
    // This prevents accidental live charges when the app is running in demo mode.
    const paymentsEnabled = String(process.env.PAYMENTS_ENABLED || '').toLowerCase() === 'true';

    const stripeKey = await getStripeSecret(secretArn);

    if (!stripeKey) {
      // Return a stub session when Stripe not configured
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ sessionId: `stub_${Date.now()}`, redirect: false }),
      };
    }

    const isLiveKey = typeof stripeKey === 'string' && stripeKey.startsWith('sk_live_');
    if (!paymentsEnabled || isLiveKey && String(process.env.ALLOW_LIVE_PAYMENTS || '').toLowerCase() !== 'true') {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          message: 'Payments are disabled for this environment. Use Stripe test keys or enable PAYMENTS_ENABLED.',
        }),
      };
    }

    // Dynamically import stripe to avoid bundling when not configured
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jod",
            product_data: { name: `Booking: ${hotelId}` },
            unit_amount: Math.round((amount || 100) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (err) {
    console.error("checkout error", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Checkout failed" }),
    };
  }
}
