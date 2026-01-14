import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Initialize i18n (en/ar) once for the whole app
import "./i18n/i18n.js";

// Import Tailwind CSS
import "./index.css";

import { initCloudWatchRum } from "./rum/initRum.js";
import { initAmplify } from "./amplifyInit.js";
import { preloadCriticalImages } from "./hooks/useImagePreloader.js";

async function cleanupStaleServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // Avoid reload loops.
  const markerKey = 'visitjo_sw_cleanup_done_v2';
  if (sessionStorage.getItem(markerKey)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    let didUnregister = false;

    for (const registration of registrations) {
      const ok = await registration.unregister();
      didUnregister = didUnregister || ok;
    }

    // Clear old app caches that could contain stale HTML/JS.
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const visitJoCaches = cacheNames.filter((name) => name.startsWith('visitjo-'));
      await Promise.all(visitJoCaches.map((name) => caches.delete(name)));
    }

    sessionStorage.setItem(markerKey, '1');

    if (didUnregister) {
      // Reload once so the page is fetched without SW interference.
      window.location.reload();
    }
  } catch {
    // Non-fatal; app should still boot.
  }
}

// If an older build registered a service worker, it can keep serving stale
// cached HTML/chunks after deploy. Clean it up in production.
if (import.meta.env.PROD) {
  cleanupStaleServiceWorker();
}

// Register service worker for caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// CloudWatch RUM (safe no-op unless env vars are set)
initCloudWatchRum();

// Amplify (Analytics/Auth/etc) init
initAmplify();

// Preload critical images for better performance
preloadCriticalImages();

// Runtime image optimizer: ensure images without attributes get lazy loading
function installImageRuntimeOptimizations() {
  try {
    const applyAttrs = (img) => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
    };

    const processAll = () => {
      document.querySelectorAll('img:not([loading])').forEach(applyAttrs);
      document.querySelectorAll('img[loading="eager"]').forEach((i) => i.setAttribute('loading', 'eager'));
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      requestAnimationFrame(processAll);
    } else {
      window.addEventListener('DOMContentLoaded', processAll, { once: true });
    }

    // Catch images added later (e.g., dynamic content)
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1) {
            if (n.tagName === 'IMG') applyAttrs(n);
            n.querySelectorAll && n.querySelectorAll('img').forEach(applyAttrs);
          }
        }
      }
    });
    mo.observe(document.documentElement || document, { childList: true, subtree: true });
  } catch {
    // Non-fatal — skip optimization if any browser quirk
  }
}

installImageRuntimeOptimizations();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
