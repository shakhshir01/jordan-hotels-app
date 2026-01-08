# Performance & Accessibility Recommendations

Priority action items:

1. Bundle analysis
  - Add `rollup-plugin-visualizer` to devDependencies and run a build to inspect large bundles.
  - Target: reduce `vendor-maps` and `vendor` sizes by lazy-loading map-heavy pages.

2. Code splitting & lazy loading
  - Keep heavy libs (Leaflet, maps, stripe) behind dynamic imports for pages that need them.

3. Image optimization
  - Serve WebP/AVIF for large images; resize and compress on upload or at build time.
  - Consider using an image CDN (CloudFront + Lambda@Edge or third-party like Imgix).

4. Caching and HTTP headers
  - Confirm Amplify or hosting sets long cache TTLs for fingerprinted assets and short TTL for `index.html`.

5. Lighthouse & automated checks
  - Add a Lighthouse job in CI for key pages (home, search, hotel details).

6. Accessibility
  - Add axe-core checks for critical flows and run in CI.
  - Fix missing alt text, color contrast issues, and keyboard focus order.

7. Monitoring
  - Add RUM and error monitoring (Sentry/Datadog) to spot performance regressions.
