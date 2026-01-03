/**
 * Image Optimization Utilities
 * Handles lazy loading, compression, and responsive images
 */

import React from 'react';

/**
 * Lazy load images with Intersection Observer
 */
export const useLazyImage = (ref, callback) => {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(entry.target);
      }
    },
    {
      rootMargin: '50px', // Start loading 50px before visible
    }
  );

  if (ref.current) {
    observer.observe(ref.current);
  }

  return observer;
};

/**
 * Get optimized image URL with CloudFront parameters
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 85,
    format = 'webp',
  } = options;

  // Add CloudFront query parameters for optimization
  const params = new URLSearchParams({
    w: width,
    h: height,
    q: quality,
    f: format,
  });

  return `${imageUrl}?${params.toString()}`;
};

/**
 * Generate responsive image srcset
 */
export const getResponsiveImageSrcSet = (imageUrl, sizes = [320, 640, 1024]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(imageUrl, { width: size, quality: 85 })} ${size}w`)
    .join(', ');
};

/**
 * Get responsive image sizes attribute
 */
export const getImageSizes = () => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

/**
 * Compress image client-side before upload
 */
export const compressImage = async (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve({
              file: new File([blob], file.name, { type: 'image/jpeg' }),
              width,
              height,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: ((1 - blob.size / file.size) * 100).toFixed(2),
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Lazy Loading Image Component
 */
export const LazyImage = ({ src, alt, className = '', ...props }) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E'}
      alt={alt}
      className={`${className} ${isLoading ? 'bg-slate-200' : ''}`}
      onLoad={() => setIsLoading(false)}
      {...props}
    />
  );
};

import React from 'react';

export default {
  useLazyImage,
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
  getImageSizes,
  compressImage,
  LazyImage,
};
