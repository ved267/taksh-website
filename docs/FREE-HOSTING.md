# Free hosting migration — Netlify and Turso

The user explicitly requires a complete move away from Sites with **no hosting payment**. Target: owner-controlled Netlify Free + Turso Free. Vercel Hobby excludes commercial use, so no Vercel commercial deployment or Pro upgrade will be used.

## Spending and capacity

Keep both accounts on Free. Do not enter a card, start a paid trial, enable recharge/overages, buy credits or add a paid provider. Netlify Free has300 credits/month across deployments, compute, bandwidth and requests; exhausted allowance pauses service until reset. Turso Free currently includes5GB storage,500M rows read/month and10M rows written/month. These are limited free services, not unlimited capacity or an uptime guarantee. Verify the actual accounts' plan/usage before launch and before substantial ads.

Sources checked4 November2026:
- https://www.netlify.com/pricing/
- https://www.netlify.com/blog/introducing-netlify-free-plan/
- https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/
- https://turso.tech/pricing

## Source and runtime

Branch `migration/free-hosting` reconciles the checked live Sites version60 delta (`f07dfe675471c0befd519aabea1cf1d79e5aa392`). Original product images/styles/layout remain. Updated demand/checkout wording comes from that approved release. Portable runtime, same-origin handling and server-side rate limiting remain.

`netlify.toml` builds standard Next.js with the pinned tested adapter. `scripts/prepare-host-context.mjs` bakes only non-secret platform/context identity before both Next compilation and standalone function bundling. NETLIFY/CONTEXT are build-only variables; runtime additionally recognises Netlify SITE_ID. A Netlify build identity never permits local filesystem persistence.

Production runtime needs TURSO_DATABASE_URL/TURSO_AUTH_TOKEN. Preview/branch builds require separate TAKSH_PREVIEW_DATABASE_URL/TAKSH_PREVIEW_AUTH_TOKEN and refuse to reuse global production credentials. Create two databases within Turso Free, not a paid branch feature. Scope secrets deliberately in Netlify. Never place values in source, generated identity JSON, netlify.toml or chat.

Netlify Blobs holds private support photos with strong reads in Singapore. Production/preview use separate stable store names, aligned with their separate databases. No Vercel Blob resource is required. Existing Vercel adapter is dormant on this target. Never use a preview against customer records.

## Uploads

The existing5MB allowance remains. Photos up to3MB use the original one-request flow. Larger photos transfer as3MB plus remainder, avoiding Netlify's effective4.5MB binary request limit. No new public fields/copy/screens or client dependency. Server validates contact binding, signature, full size and random expiring one-use tokens; recombination preserves exact bytes. Private temporary parts expire after10minutes and hourly cleanup runs on Netlify's Free-supported scheduled functions. Failed deletion keeps a tracked claimed record for retry. Large owner downloads use the adapter's streaming support; verify5MB retrieval in staging.

## Migration data

Owner-only v60 export and verified SQLite/SQL restore are in `/Users/devanshsmac/Desktop/Taksh Website Export/2026-11-04/private-data/`, outside Git. Seven source tables were read without truncation.13 request/cart/draft records remain; these are not paid orders. Source reading is not an atomic snapshot: refresh and reconcile immediately before cutover.

`scripts/restore-migration-backup.mjs --backup <private-json>` defaults to dry-run. Apply requires `--apply --target <exact-url>` matching the configured database and a fresh empty target; it refuses existing tables. It restores business rows with token hashes, timestamps, historical prices/currency and test exclusions unchanged. Old sessions/rate limits are excluded. Schema plus import runs transactionally and every copied value is compared afterwards. No row values appear in normal output. Do not import real records into previews.

Sites masks ADMIN_PASSWORD_HASH and CUSTOMER_SHEET_SYNC_KEY; do not claim they were exported. Reconcile the existing owner credential work privately and securely reconnect the existing Sheet key. Preserve Apps Script cursor/retry properties, trigger and manual Sheet notes. Current URL `https://taksh.store/api/integrations/customer-sheet` stays stable after DNS switch. No R2 object-list/export tool was available; orphan storage remains unverified, despite no support photo references in the current table.

## Launch gate

1. Owner completes/signs in to both Free accounts; verify plans, no payment details/overages and scoped access. Netlify CLI currently reports NOT_LOGGED_IN; no site is linked. Browser is open at Netlify login.
2. Provision separate preview and production databases and a Netlify site without adding charges. Deploy synthetic preview, then verify real hosted requests/concurrency, private5MB upload/download, secure cookies, cache headers, mobile UI and performance. Local adapter packaging is not a live deployment test.
3. Refresh/export live source/data, reconcile remaining uploads and masked credentials, migrate production and verify row contents plus owner/Sheet access. Keep Sites rollback.
4. Connect the existing domain only after target checks pass; verify public site/forms, admin protection and Sheet sync after cutover. Do not remove the old project or backups prematurely.

Independent review found runtime detection and failed-upload cleanup bugs; both have focused regression tests and fixes. The reviewer then failed with an account usage-limit error; independent sign-off is still pending. Do not claim the entire migration or hosted verification is complete.
