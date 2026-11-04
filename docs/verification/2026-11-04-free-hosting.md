# Free-hosting preparation verification — 4 November2026

Scope: `migration/free-hosting` against migration baseline b8ee4fee, reconciling checked live v60. No real hosted deployment, paid resources, card entry or DNS changes.

## Checks completed

- Full Next production build with asset preparation, TypeScript,32 generated pages and performance hooks passed. Netlify CLI offline deploy-preview build also passed with Next adapter5.16.6, server function and hourly cleanup function packaged. The first Netlify build exposed a ProcessEnv typing error, then corrected and rebuilt successfully.
-91 unit tests passed. New coverage includes Netlify runtime detection, preview database isolation, non-secret baked deployment identity, real Netlify SDK/local Blobs-server roundtrip and environment isolation, full-size chunk recombination, expiry/reuse/contact/signature limits, transient cleanup failure, and explicit fresh-target database restore.
- Four integration scripts passed against a fresh isolated local production preview on5274: availability-request, cart-lifecycle, v60 demand/Sheet health, and5MB support upload/download. Synthetic email credentials were empty. Historical prices, optimistic save/retry, duplicate recovery, exclusions, reports/Sheet failure recovery and owner photo access were exercised. A maximum-size photo returned byte-for-byte with owner authentication; unauthenticated access401, private/no-store response.
- Source comparison against original v60: all components/taksh files and CSS match exactly except help.tsx's transport import/call. That form's visible copy/fields/layout is unchanged. Product routes preserve original components/metadata. No new tracking library/public-page fetch was added.
- Homepage CSS103792bytes; all six product CSS budgets passed at or below their original required stylesheet sums. Image hashes/thumbnails passed;17 Gully originals remain identical. No hosted speed, mobile visual or Core Web Vitals claim.
- Focused lint zero errors; existing unused `_options` warning remains. Generated tsbuildinfo is now ignored instead of committed.
- Seven current live DB tables exported without truncation to owner-only storage. Private restore copied13 orders/request records and1 reporting row, preserving every copied column/value; source session/rate-limit rows excluded intentionally. SQLite integrity check passed; private portable SQL saved. No customer records entered Git or local application test DB.

## Review and unresolved work

Independent reviewer found build-only Netlify env detection could cause local fallback and that deleting a token before its Blob could leave an orphan. Both fixed with regression tests. Baked public identity and runtime SITE_ID detection choose private platform storage; previews require separate credentials and stable preview store. Claimed rows persist until successful private-part deletion. The reviewer subsequently failed with an account usage-limit error; independent final sign-off remains incomplete.

Chrome's extension browser creation failed (“tabs must be active”/visibility unavailable). Native Chrome controls opened a separate Netlify login window as a disclosed fallback; no account terms accepted or account created. Netlify CLI reports NOT_LOGGED_IN. Both Free account sign-ins are still required.

Hosted Turso/Blobs behavior, secure platform cookies, real5MB streaming downloads, owner credential/Sheet key continuity, orphan R2 export, fresh pre-cutover writes, mobile/performance and DNS cutover remain unverified. Read docs/FREE-HOSTING.md. Sites remains live rollback/current production. This is not a completed hosting shift.
