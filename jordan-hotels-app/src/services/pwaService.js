/**
 * PWA Configuration
 * Progressive Web App setup and utilities
 */

/**
 * Register Service Worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

/**
 * Unregister Service Worker
 */
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
    }
  }
};

/**
 * Check if app can be installed (PWA criteria met)
 */
export const canInstallPWA = () => {
  return (
    'serviceWorker' in navigator &&
    'caches' in window &&
    'indexedDB' in window &&
    'localStorage' in window
  );
};

/**
 * Request PWA Installation
 * Triggers the browser install prompt if available
 */
export let deferredPrompt = null;

export const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event for later use
    deferredPrompt = e;
  });
};

export const requestInstallPWA = async () => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  console.log(`User response to the install prompt: ${outcome}`);
  deferredPrompt = null;

  return outcome === 'accepted';
};

/**
 * Cache Management
 */
export const cacheManager = {
  /**
   * Cache assets
   */
  cacheAssets: async (cacheName, assets) => {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(assets);
      console.log(`Cached ${assets.length} assets`);
    } catch (error) {
      console.error('Failed to cache assets:', error);
    }
  },

  /**
   * Delete cache
   */
  deleteCache: async (cacheName) => {
    try {
      const deleted = await caches.delete(cacheName);
      console.log(`Cache ${cacheName} deleted:`, deleted);
      return deleted;
    } catch (error) {
      console.error('Failed to delete cache:', error);
      return false;
    }
  },

  /**
   * Get all cached responses
   */
  getCachedResponses: async (cacheName) => {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      const cached = {};

      for (const request of keys) {
        const response = await cache.match(request);
        cached[request.url] = response;
      }

      return cached;
    } catch (error) {
      console.error('Failed to get cached responses:', error);
      return {};
    }
  },

  /**
   * Clear cache older than specified days
   */
  clearOldCaches: async (_maxDays = 7) => {
    try {
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        // Simple strategy: delete cache if its name contains old date
        if (cacheName.includes('v1')) {
          await caches.delete(cacheName);
        }
      }
    } catch (error) {
      console.error('Failed to clear old caches:', error);
    }
  },
};

/**
 * Offline Detection
 */
export const offlineManager = {
  isOnline: () => navigator.onLine,

  onOnline: (callback) => {
    window.addEventListener('online', callback);
  },

  onOffline: (callback) => {
    window.addEventListener('offline', callback);
  },

  /**
   * Queue actions while offline
   */
  queueOfflineAction: (action) => {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push({
      ...action,
      queuedAt: new Date().toISOString(),
    });
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
  },

  /**
   * Get queued actions
   */
  getQueuedActions: () => {
    return JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  },

  /**
   * Clear queued actions
   */
  clearQueuedActions: () => {
    localStorage.removeItem('offlineQueue');
  },
};

/**
 * Web App Manifest Generator
 */
export const generateManifest = (options = {}) => {
  return {
    name: options.name || 'VisitJo - Jordan Hotels Booking',
    short_name: options.shortName || 'VisitJo',
    description: options.description || 'Book hotels in Jordan with ease',
    start_url: options.startUrl || '/',
    scope: options.scope || '/',
    display: options.display || 'standalone',
    orientation: options.orientation || 'portrait-primary',
    theme_color: options.themeColor || '#1a5f7a',
    background_color: options.backgroundColor || '#ffffff',
    icons: options.icons || [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: options.categories || ['travel', 'booking'],
    screenshots: options.screenshots || [
      {
        src: '/screenshots/screenshot1.png',
        sizes: '540x720',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/screenshots/screenshot2.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
    shortcuts: options.shortcuts || [
      {
        name: 'Search Hotels',
        short_name: 'Search',
        description: 'Search for hotels',
        url: '/search',
        icons: [{ src: '/icons/search.png', sizes: '192x192' }],
      },
    ],
  };
};

/**
 * Notification Handler for PWA
 */
export const notificationHandler = {
  /**
   * Request notification permission
   */
  requestPermission: async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }

    return false;
  },

  /**
   * Send notification
   */
  notify: (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    }
  },

  /**
   * Send booking confirmation notification
   */
  notifyBookingConfirmation: (hotelName, checkInDate) => {
    notificationHandler.notify('Booking Confirmed', {
      body: `Your booking at ${hotelName} on ${checkInDate} is confirmed`,
      tag: 'booking-confirmation',
      requireInteraction: true,
    });
  },

  /**
   * Send price drop notification
   */
  notifyPriceDrop: (hotelName, oldPrice, newPrice) => {
    notificationHandler.notify('Price Drop Alert', {
      body: `${hotelName} price dropped from ${oldPrice} to ${newPrice}`,
      tag: 'price-drop',
    });
  },
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  canInstallPWA,
  setupInstallPrompt,
  requestInstallPWA,
  cacheManager,
  offlineManager,
  notificationHandler,
  generateManifest,
};
