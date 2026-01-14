import React from 'react';
import { getOptimizedImageUrl, getResponsiveImageSrcSet, getImageSizes } from '../services/imageOptimization';

/**
 * OptimizedImage component with WebP/AVIF support, lazy loading, and responsive images
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  sizes,
  loading = 'lazy',
  ...props
}) => {
  if (!src) {
    return (
      <img
        src="/placeholder-image.jpg"
        alt={alt || 'Placeholder'}
        className={className}
        loading={loading}
        {...props}
      />
    );
  }

  // Generate URLs for different formats
  const fallbackUrl = getOptimizedImageUrl(src, { width, height, quality, format: 'jpg' });

  // Responsive srcset
  const webpSrcSet = getResponsiveImageSrcSet(src, [320, 640, 1024, 1920]);
  const avifSrcSet = getResponsiveImageSrcSet(src, [320, 640, 1024, 1920], 'avif');
  const fallbackSrcSet = getResponsiveImageSrcSet(src, [320, 640, 1024, 1920], 'jpg');

  const imageSizes = sizes || getImageSizes();

  return (
    <picture className={className}>
      {/* AVIF source */}
      <source
        srcSet={avifSrcSet}
        sizes={imageSizes}
        type="image/avif"
      />
      {/* WebP source */}
      <source
        srcSet={webpSrcSet}
        sizes={imageSizes}
        type="image/webp"
      />
      {/* Fallback */}
      <img
        src={fallbackUrl}
        srcSet={fallbackSrcSet}
        sizes={imageSizes}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        className={className}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;