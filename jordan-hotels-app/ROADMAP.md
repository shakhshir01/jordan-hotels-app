# VISIT-JO — Prioritized Improvement Backlog (Jan 2026)

This backlog is ordered by **impact on conversion + trust + performance** first (the things that make Expedia/Booking “feel premium”), then by implementation risk.

## P0 — Must-haves (1–2 weeks)
- **Performance budget + code splitting**: keep initial JS small, split routes/vendor chunks, lazy-load heavy pages (maps, checkout, blog post, insights).
- **Image performance**: ensure responsive images, lazy-loading everywhere, and consistent fallback handling; avoid loading full-size images in grids.
- **Core SEO for a SPA**: strong `index.html` metadata, robots, OpenGraph/Twitter tags; generate a sitemap/robots strategy for CloudFront/S3.
- **Reliability + observability**: centralize API error reporting, add correlation IDs, and ensure user-visible errors are actionable.
- **Security posture**: enforce CSP headers via CloudFront, strict CORS, and harden auth/session handling.

## P1 — Conversion + trust (2–4 weeks)
- **Search UX parity**: fast filters (price/rating/amenities), sort, clear empty states, and pagination or incremental loading.
- **Booking confidence**: transparent fees, cancellation details, “pay later” rules, and final price breakdown.
- **Reviews credibility**: verified-stay badge, rating distribution, recent reviews, and localization for review content.
- **Support + help center**: structured FAQ flows, contact options, and clear policy pages.

## P1 — SEO / discoverability (2–4 weeks)
- **Pre-rendering strategy**: for marketing pages (home, destinations, blog), use SSR or pre-render (or a hybrid) for real SEO.
- **Structured data**: add JSON-LD (Organization, Hotel, BreadcrumbList, FAQ) to key pages.
- **Canonical strategy**: align hash routing vs real paths; if SEO is a top goal, migrate away from HashRouter.

## P2 — Product differentiation (4–8 weeks)
- **Personalization**: “because you viewed…”, seasonal recommendations, saved preferences.
- **Bundles**: hotel + experience packages, flight + hotel deals.
- **Loyalty / wallet**: points, perks, referral program.
- **Payments hardening**: idempotency, retries, partial refunds, chargeback-safe logging.

## P2 — Platform engineering (ongoing)
- **Test coverage targets**: critical flows (auth, search, booking, checkout) with stable UI tests.
- **CI gates**: lint/test/build required, bundle-size check, dependency audit.
- **Data contracts**: typed API schemas, runtime validation, and safer migrations.

## What’s already shipped (this session)
- Lint/test/build are green.
- Route-level code-splitting via `React.lazy` + `Suspense`.
- Improved HTML metadata + performance preconnects.
- Rollup vendor chunk splitting to reduce giant bundles.
