import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({});

async function getStripeSecret(secretArn) {
  if (!secretArn) return null;
  try {
    const res = await sm.send(new GetSecretValueCommand({ SecretId: secretArn }));
    const raw = res.SecretString || "";
    if (!raw) return null;

    // Support both:
    // - plaintext secret: "sk_live_..."
    // - JSON secret: { "STRIPE_SECRET": "sk_live_..." }
    try {
      const parsed = JSON.parse(raw);
      return parsed?.STRIPE_SECRET || parsed?.stripe || null;
    } catch {
      return raw;
    }
  } catch (err) {
    console.warn("Failed to read stripe secret", err);
    return null;
  }
}

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
}

function parseJwtClaims(event) {
  const auth = event?.headers?.authorization || event?.headers?.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function minorUnitMultiplier(currency) {
  const c = String(currency || "").toLowerCase();
  // Stripe uses the currency's smallest unit.
  // JOD has 3 decimal places (fils).
  if (c === "jod") return 1000;
  return 100;
}

export async function handler(event) {
  const corsHeaders = getCorsHeaders();
  const method = (event.httpMethod || event?.requestContext?.http?.method || "POST").toUpperCase();

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const currency = String(body.currency || "jod").toLowerCase();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
        body: JSON.stringify({ message: "Invalid amount" }),
      };
    }

    const multiplier = minorUnitMultiplier(currency);
    const minorAmount = Math.round(amount * multiplier);

    if (!Number.isFinite(minorAmount) || minorAmount <= 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
        body: JSON.stringify({ message: "Invalid amount" }),
      };
    }

    const stripeSecretArn = process.env.STRIPE_SECRET_ARN;
    const stripeKey = await getStripeSecret(stripeSecretArn);

    if (!stripeKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
        body: JSON.stringify({ message: "Stripe is not configured" }),
      };
    }

    const claims = parseJwtClaims(event) || {};
    const userId = claims.sub || undefined;
    const userEmail = claims.email || undefined;

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });

    const metadata = {
      ...(body.metadata && typeof body.metadata === "object" ? body.metadata : {}),
      ...(userId ? { userId } : {}),
    };

    const intent = await stripe.paymentIntents.create({
      amount: minorAmount,
      currency,
      receipt_email: userEmail,
      metadata,
      // Helps reduce additional steps for some cards (Stripe may still require SCA when needed).
      automatic_payment_methods: { enabled: true },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({
        paymentIntentId: intent.id,
        clientSecret: intent.client_secret,
      }),
    };
  } catch (err) {
    console.error("create intent error", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ message: "Failed to create payment intent" }),
    };
  }
}
