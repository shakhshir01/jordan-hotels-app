import { useEffect, useState } from 'react';

/**
 * Hook to preload critical images for better performance
 */
export const useImagePreloader = (imageUrls = []) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [loading, setLoading] = useState(Boolean(imageUrls && imageUrls.length));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageUrls.length) return;
    let cancelled = false;

    // Defer setting loading to avoid synchronous setState inside the effect body
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });

    const preloadPromises = imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          if (!cancelled) setLoadedImages(prev => new Set([...prev, url]));
          resolve(url);
        };
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      });
    });

    Promise.allSettled(preloadPromises)
      .then((results) => {
        const failedLoads = results
          .filter(result => result.status === 'rejected')
          .map(result => result.reason);

        if (failedLoads.length > 0) {
          if (!cancelled) setError(failedLoads);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrls]);

  return { loadedImages, loading, error };
};

/**
 * Preload critical images on app start
 */
export const preloadCriticalImages = () => {
  // Preload hero images, logos, and commonly used images
  const criticalImages = [
    '/jordanfavicon.png',
    // Add other critical images here
  ];

  criticalImages.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};