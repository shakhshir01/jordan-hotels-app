import React from 'react';

// Extend HTMLImageElement attributes to include fetchpriority
declare module 'react' {
  interface ImgHTMLAttributes<T> extends React.HTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

// Lightweight, production-ready image component focused on mobile perf
// - Uses native lazy-loading + async decoding
// - Reserves layout using an aspect-ratio wrapper to avoid CLS
// - Ensures images always fill their container with object-fit:cover
export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  ratio = '3/2',
  fallback = undefined,
  priority = false,
  loading = undefined,
  onError = undefined,
  ...rest
}: {
  src: string;
  alt?: string;
  className?: string;
  ratio?: string;
  fallback?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  [key: string]: any;
}) {
  const [errored, setErrored] = React.useState(false);

  // Provide a simple SVG fallback to avoid broken images and layout shifts
  const FALLBACK_SVG =
    fallback ||
    'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#e6edf3"/><text x="50%" y="50%" fill="#9aa7b7" font-family="Arial" font-size="36" text-anchor="middle" dominant-baseline="middle">Image unavailable</text></svg>`
      );

  const imgSrc = errored ? FALLBACK_SVG : src;

  // Aspect class uses Tailwind-like syntax (e.g., "3/2" -> aspect-[3/2])
  const aspectClass = `aspect-[${ratio}]`;

  // Determine loading behaviour: explicit `loading` prop overrides `priority`
  const effectiveLoading = loading ?? (priority ? 'eager' : 'lazy');

  return (
    <div className={`relative ${aspectClass} bg-slate-200 overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        loading={effectiveLoading}
        decoding="async"
        fetchpriority={priority ? 'high' : 'low'}
        className="w-full h-full object-cover block"
        onError={(e) => {
          setErrored(true);
          if (typeof onError === 'function') onError(e);
        }}
        {...rest}
      />
    </div>
  );
}