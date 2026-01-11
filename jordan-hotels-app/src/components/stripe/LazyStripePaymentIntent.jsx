import React, { useEffect, useMemo, useState } from 'react';

const STRIPE_PUBLIC_KEY =
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

function formatAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2);
}

function StripePaymentIntentForm({
  stripeReact,
  amount,
  currency,
  billingDetails,
  disabled,
  onCreatePaymentIntent,
  onSuccess,
  onError,
  onProcessingChange,
}) {
  const { CardElement, useElements, useStripe } = stripeReact;
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);

  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: '16px',
          color: '#1e293b',
          '::placeholder': { color: '#94a3b8' },
        },
        invalid: { color: '#ef4444' },
      },
    }),
    []
  );

  const canSubmit = Boolean(stripe && elements) && !disabled && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    onProcessingChange?.(true);

    try {
      const intent = await onCreatePaymentIntent?.({
        amount,
        currency,
      });

      const clientSecret = intent?.clientSecret;
      if (!clientSecret) {
        throw new Error('Payment initialization failed (missing client secret)');
      }

      let paymentIntent;

      // Handle mock payment intents for development/testing
      if (clientSecret.startsWith('pi_mock_')) {
        // Simulate successful payment for mock intents
        paymentIntent = {
          id: clientSecret.replace('_secret_mock', ''),
          status: 'succeeded',
          amount: amount,
          currency: currency,
        };
      } else {
        // Real Stripe payment processing
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: billingDetails?.name || '',
              email: billingDetails?.email || '',
              phone: billingDetails?.phone || '',
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message || 'Card payment failed');
        }

        paymentIntent = result.paymentIntent;
        if (!paymentIntent) {
          throw new Error('Payment failed (no payment intent returned)');
        }
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }

      await onSuccess?.(paymentIntent);
    } catch (err) {
      onError?.(err);
    } finally {
      setSubmitting(false);
      onProcessingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4 bg-white">
        <CardElement options={cardElementOptions} />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold disabled:bg-gray-400"
      >
        {submitting ? 'Processing…' : `Pay ${formatAmount(amount)} ${String(currency || '').toUpperCase()}`}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}

export default function LazyStripePaymentIntent({
  amount,
  currency = 'jod',
  billingDetails,
  disabled = false,
  onCreatePaymentIntent,
  onSuccess,
  onError,
  onProcessingChange,
}) {
  const stripeKey = STRIPE_PUBLIC_KEY;
  const enabled = Boolean(stripeKey);

  const [stripeReact, setStripeReact] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!enabled) return;

    (async () => {
      try {
        const [{ loadStripe }, stripeReactModule] = await Promise.all([
          import('@stripe/stripe-js'),
          import('@stripe/react-stripe-js'),
        ]);

        const promise = loadStripe(stripeKey);
        if (!mounted) return;
        setStripePromise(promise);
        setStripeReact(stripeReactModule);
      } catch (err) {
        if (!mounted) return;
        setStripePromise(null);
        setStripeReact(null);
        onError?.(err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled, stripeKey, onError]);

  if (!enabled) return null;

  if (!stripeReact || !stripePromise) {
    return (
      <div className="w-full border rounded-lg px-4 py-3 text-sm text-slate-600 bg-white">
        Loading secure card input…
      </div>
    );
  }

  const { Elements } = stripeReact;

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentIntentForm
        stripeReact={stripeReact}
        amount={amount}
        currency={currency}
        billingDetails={billingDetails}
        disabled={disabled}
        onCreatePaymentIntent={onCreatePaymentIntent}
        onSuccess={onSuccess}
        onError={onError}
        onProcessingChange={onProcessingChange}
      />
    </Elements>
  );
}
