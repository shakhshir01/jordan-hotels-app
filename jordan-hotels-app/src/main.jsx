import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Initialize i18n (en/ar) once for the whole app
import "./i18n/i18n.js";

// Import Tailwind CSS
import "./index.css";

async function cleanupStaleServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // Avoid reload loops.
  const markerKey = 'visitjo_sw_cleanup_done_v1';
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
