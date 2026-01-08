import React, { useEffect, useMemo, useRef, useState } from 'react';

let paypalSdkPromise;

function resetPayPalSdk() {
  paypalSdkPromise = null;
  try {
    const script = document.querySelector('script[data-paypal-sdk="true"]');
    if (script) script.remove();
  } catch {
    // ignore
  }
  try {
    // Best-effort cleanup; PayPal SDK doesn't provide a full unload.
    if (typeof window !== 'undefined') delete window.paypal;
  } catch {
    // ignore
  }
}

function normalizeCurrency(currency) {
  const c = String(currency || '').trim().toUpperCase();
  return c || 'USD';
}

function looksLikeClientId(clientId) {
  const id = String(clientId || '').trim();
  if (!id) return false;
  if (id === 'sb') return true;
  // Real PayPal client IDs are typically long; very short values often mean a truncated/pasted-wrong value.
  return id.length >= 30;
}

function maskClientId(clientId) {
  const id = String(clientId || '');
  if (!id) return '';
  if (id === 'sb') return 'sb';
  if (id.length <= 10) return `${id.slice(0, 3)}…`;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function buildPayPalSdkUrl({ clientId, currency }) {
  const params = new URLSearchParams({
    'client-id': String(clientId),
    currency: normalizeCurrency(currency),
    intent: 'capture',
    components: 'buttons',
  });
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

function loadPayPalSdk({ clientId, currency }) {
  if (!clientId) return Promise.reject(new Error('Missing PayPal client id'));
  if (!looksLikeClientId(clientId)) {
    return Promise.reject(
      new Error(
        'PayPal client id looks invalid. For quick local testing set VITE_PAYPAL_CLIENT_ID=sb, or paste the full Client ID from developer.paypal.com.'
      )
    );
  }

  if (paypalSdkPromise) return paypalSdkPromise;

  paypalSdkPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('PayPal SDK can only load in the browser'));
      return;
    }

    if (window.paypal?.Buttons) {
      resolve(window.paypal);
      return;
    }

    const existing = document.querySelector('script[data-paypal-sdk="true"]');
    if (existing) {
      const status = existing.getAttribute('data-paypal-sdk-status');
      if (status === 'loaded' && window.paypal?.Buttons) {
        resolve(window.paypal);
        return;
      }

      if (status === 'error') {
        existing.remove();
      } else {
        existing.addEventListener('load', () => resolve(window.paypal));
        existing.addEventListener('error', () => {
          paypalSdkPromise = null;
          reject(new Error('Failed to load PayPal SDK'));
        });
        return;
      }
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.paypalSdk = 'true';

    const src = buildPayPalSdkUrl({ clientId, currency });
    script.src = src;

    script.onload = () => {
      script.setAttribute('data-paypal-sdk-status', 'loaded');
      resolve(window.paypal);
    };
    script.onerror = () => {
      script.setAttribute('data-paypal-sdk-status', 'error');
      paypalSdkPromise = null;
      reject(
        new Error(
          `Failed to load PayPal SDK. Check VITE_PAYPAL_CLIENT_ID (current: ${maskClientId(clientId)}).`
        )
      );
    };

    document.head.appendChild(script);
  });

  return paypalSdkPromise;
}

export default function LazyPayPalButtons({
  amount,
  currency = 'USD',
  onApproved,
  onError,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const buttonsRef = useRef(null);
  const lastInitKeyRef = useRef('');
  const onApprovedRef = useRef(onApproved);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [message, setMessage] = useState('');
  const [retryNonce, setRetryNonce] = useState(0);

  const clientId =
    import.meta.env.VITE_PAYPAL_CLIENT_ID ||
    import.meta.env.VITE_PAYPAL_CLIENTID ||
    '';

  const normalizedCurrency = useMemo(() => normalizeCurrency(currency), [currency]);

  useEffect(() => {
    onApprovedRef.current = onApproved;
    onErrorRef.current = onError;
  }, [onApproved, onError]);

  const amountValue = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  useEffect(() => {
    if (!clientId) return;
    if (disabled) return;
    if (!containerRef.current) return;

    let cancelled = false;

    async function init() {
      setStatus('loading');
      setMessage('');

      const initKey = `${clientId}::${normalizedCurrency}::${amountValue.toFixed(2)}::${retryNonce}`;
      if (lastInitKeyRef.current === initKey && buttonsRef.current) {
        // Already initialized for these inputs.
        setStatus('ready');
        return;
      }

      try {
        const paypal = await loadPayPalSdk({ clientId, currency: normalizedCurrency });
        if (cancelled) return;
        if (!paypal?.Buttons) {
          resetPayPalSdk();
          throw new Error('PayPal Buttons are not available (possibly blocked).');
        }

        containerRef.current.innerHTML = '';

        const buttons = paypal.Buttons({
          createOrder: (_data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amountValue.toFixed(2),
                    currency_code: normalizedCurrency,
                  },
                },
              ],
            });
          },
          onApprove: async (_data, actions) => {
            try {
              const details = await actions.order.capture();
              if (typeof onApprovedRef.current === 'function') onApprovedRef.current(details);
            } catch (e) {
              setStatus('error');
              setMessage(e?.message || 'PayPal approval failed');
              if (typeof onErrorRef.current === 'function') onErrorRef.current(e);
            }
          },
          onError: (e) => {
            setStatus('error');
            setMessage(e?.message || 'PayPal failed to load');
            if (typeof onErrorRef.current === 'function') onErrorRef.current(e);
          },
          style: {
            layout: 'vertical',
            shape: 'rect',
            label: 'paypal',
          },
        });

        if (typeof buttons.isEligible === 'function' && !buttons.isEligible()) {
          setStatus('error');
          setMessage('PayPal Buttons are not eligible in this browser/session. Try disabling tracking/ad blockers or using a regular (non-incognito) window.');
          return;
        }

        buttonsRef.current = buttons;

        await buttons.render(containerRef.current);
        if (cancelled) return;

        lastInitKeyRef.current = initKey;
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setMessage(e?.message || 'PayPal is unavailable');
        if (typeof onErrorRef.current === 'function') onErrorRef.current(e);
      }
    }

    init();

    return () => {
      cancelled = true;
      try {
        buttonsRef.current?.close?.();
      } catch {
        // ignore
      }
      buttonsRef.current = null;
    };
  }, [clientId, normalizedCurrency, amountValue, disabled, retryNonce]);

  if (!clientId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
        <div className="text-sm font-semibold">PayPal isn’t configured</div>
        <div className="text-xs mt-1">
          Set <span className="font-mono">VITE_PAYPAL_CLIENT_ID</span> to enable PayPal checkout.
        </div>
      </div>
    );
  }

  if (!looksLikeClientId(clientId)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
        <div className="text-sm font-semibold">PayPal isn’t configured</div>
        <div className="text-xs mt-1">
          Your <span className="font-mono">VITE_PAYPAL_CLIENT_ID</span> looks invalid.
          For local testing set it to <span className="font-mono">sb</span>, or paste the full Client ID from PayPal.
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700">
        <div className="text-sm font-semibold">PayPal</div>
        <div className="text-xs mt-1">Complete the current step to continue.</div>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {status === 'loading' && (
        <p className="text-xs text-slate-600 mt-2">Loading PayPal…</p>
      )}
      {status === 'error' && message && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-red-600">{message}</p>
          <button
            type="button"
            onClick={() => {
              resetPayPalSdk();
              lastInitKeyRef.current = '';
              setRetryNonce((n) => n + 1);
            }}
            className="text-xs underline text-slate-700 hover:text-slate-900"
          >
            Retry PayPal
          </button>
        </div>
      )}
    </div>
  );
}
