import React, { useEffect, useMemo, useState } from 'react';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export default function LazyStripeCardElement() {
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
      } catch {
        // If stripe fails to load, we silently fall back to the basic inputs.
        if (!mounted) return;
        setStripePromise(null);
        setStripeReact(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled, stripeKey]);

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

  if (!enabled) {
    return null;
  }

  if (!stripeReact || !stripePromise) {
    return (
      <div className="w-full border rounded-lg px-4 py-3 text-sm text-slate-600 bg-white">
        Loading secure card input…
      </div>
    );
  }

  const { Elements, CardElement } = stripeReact;

  return (
    <Elements stripe={stripePromise}>
      <div className="border rounded-lg p-4 bg-white">
        <CardElement options={cardElementOptions} />
      </div>
    </Elements>
  );
}
