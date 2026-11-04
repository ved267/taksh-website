# Local migration verification — 4 November 2026

Scope: `migration/vercel-unpaid`, exported Sites version59 baseline. This is unpaid source preparation, not a Vercel deployment or a production-readiness sign-off.

## Implemented

- Standard Next.js dev, production build and start commands; Sites runtime imports removed from active code and historical platform files archived.
- D1-shaped SQLite/libSQL adapter preserves statement binding, affected-row counts, optimistic updates and atomic batches. Explicit local migration command; no request-time schema changes.
- Private local uploads and optional private Blob adapter. Keys are restricted to support IDs; local directories/files use owner-only permissions. Vercel execution refuses local database/filesystem fallback.
- Platform-aware address selection for rate limiting and same-origin checks compatible with Next's internal URL normalization.
- Existing product components, CSS, image sources and request UI unchanged. Product-specific route entrypoints preserve metadata and avoid importing every product into one shared entrypoint.

## Verified locally

- `npm run install:ci`: clean locked installation succeeded; Next executable verified. Registry deprecation/install-script policy warnings remain; no installer failure.
- `npm run db:init`: local schema initialised; no customer data imported.
- `npm test`: 67 passed, zero failed/skipped. Includes adapter binding, optimistic updates, transactional rollback, upload privacy/path restrictions, hosted fail-closed settings, origin and address handling, plus existing request/consent checks.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: full asset preparation, webpack production compilation, TypeScript checks, generation and postbuild performance checks passed. All six concrete product URLs prerendered.
- Production preview on loopback port5274, email credentials explicitly empty: both existing availability-request and cart-lifecycle integration scripts passed. Email-only/mobile-only requests, rejection without contact details, duplicate recovery, stale price/name handling and cart/request isolation verified.
- Home, sets, six product URLs, privacy and returns returned200; unknown product404; unauthenticated owner orders401 with `no-store`; content-hashed image returned immutable cache headers.
- Desktop browser spot check: homepage and Ulta Chashma rendered with images and expected request copy. No full mobile visual comparison, browser performance benchmark, hosted latency, network or Core Web Vitals claim.
- Focused lint: zero errors, two unused-variable warnings (`ramDescription` in shared metadata module; `_options` in local storage API signature).
- Independent code review found an old Vinext installer assumption. Replaced active installer and shell wrapper; reviewer rechecked and reported no remaining actionable findings within local-preparation scope.

## Performance evidence

Generated homepage CSS103,792bytes (gzip20,296). Product CSS totals below their original required stylesheet sums:

| Product | Migration CSS bytes | Original required CSS bytes |
|---|---:|---:|
| Chandrayaan-3 |125289|126764|
| Ram Mandir |115596|117094|
| Map of India |120079|121558|
| Yellow Taxi |119226|120728|
| Ulta Chashma |128125|129542|
| Gully Cricket |122275|123760|

Nonsense reuses ChandrayaanGallery; its Chandrayaan CSS is an intended dependency. Bharat, Taxi and Gully share Ram Mandir styles. Thumbnail budgets passed; image cache keys match bytes; all17 Gully original images remain byte-identical. These checks constrain CSS/images; they do not establish that a new host or framework is universally faster.

## Open before production

1. Reconcile the original builder's unfinished measurement work. This branch does not include it.
2. Select authorised commercial hosting and durable services. No Vercel project, database, Blob store, subscription, upgrade, trial or DNS change was created. User chose to remain unpaid.
3. Configure and test hosted database schema/data and private storage, owner credential, Sheet secret/delivery and real email delivery. No hosted adapter has been exercised.
4. Preserve the support form's5MB photo allowance. Vercel Functions'4.5MB body limit requires a verified upload approach before hosting; the optional server-side Blob adapter alone does not resolve it. See https://vercel.com/docs/functions/limitations.
5. Refresh the owner backup before cutover; reconcile writes. Sites masked admin/Sheet secrets cannot be exported. No R2 listing/export capability was available, so orphan objects remain unverified. Keep private data outside Git.
6. Complete staging checks for owner access, same-origin/secure cookies behind the platform, concurrency, rate limits, requests, Sheet export, email, uploads, mobile visuals and performance before switching taksh.store. Keep Sites as rollback.
7. Codex Vercel connector still lacks team consent (403); CLI account access works. Claude's separate Vercel OAuth remains unverified. Repository source is usable by either agent independently of those deployment connections.
