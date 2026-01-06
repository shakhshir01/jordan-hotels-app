/**
 * Service Worker
 * Handles caching, offline support, and background sync
 */

const CACHE_NAME = 'visitjo-v1';
const RUNTIME_CACHE = 'visitjo-runtime-v1';
const API_CACHE = 'visitjo-api-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

/**
 * Install Event
 * Cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.warn('Failed to cache some assets:', error);
      });
    })
  );

  self.skipWaiting();
});

/**
 * Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/**
 * Fetch Event
 * Network-first for API, cache-first for assets
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // HTML pages - network first
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Other assets - cache first
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Network First Strategy
 * Try network, fall back to cache
 */
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(
        request.url.includes('/api/') ? API_CACHE : RUNTIME_CACHE
      );
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fall back to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page if available
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/index.html');
    }

    throw error;
  }
}

/**
 * Cache First Strategy
 * Use cache, fall back to network
 */
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

/**
 * Background Sync
 * Retry failed requests when online
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  try {
    // Get pending bookings from IndexedDB or localStorage
    const pendingBookings = await getPendingBookings();

    for (const booking of pendingBookings) {
      try {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        });

        // Remove from pending
        await removePendingBooking(booking.id);
      } catch (error) {
        console.error('Failed to sync booking:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

async function getPendingBookings() {
  // Implementation depends on storage choice
  return JSON.parse(localStorage.getItem('pendingBookings') || '[]');
}

async function removePendingBooking(bookingId) {
  const pending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
  const filtered = pending.filter((b) => b.id !== bookingId);
  localStorage.setItem('pendingBookings', JSON.stringify(filtered));
}

/**
 * Push Notifications
 * Handle push events
 */
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  let notificationData = {
    title: 'VisitJo',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

/**
 * Notification Click
 * Handle notification interactions
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});

/**
 * Message Handler
 * Communicate with clients
 */
self.addEventListener('message', (event) => {
  console.log('Message from client:', event.data);

  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(event.data.cacheName);
  }

  if (event.data.type === 'CACHE_URLS') {
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
});
