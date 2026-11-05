# Demand reporting — hosting handoff

Published Sites version60 is the live baseline (f07dfe675471c0befd519aabea1cf1d79e5aa392). GitHub is now the source of truth. The original builder folder is frozen; this follow-up belongs on its own codex branch and must be reconciled into the own-account Cloudflare migration through review. No Sites deployment, DNS change or hosting subscription is part of this follow-up.

## Runtime and data continuity

- Preserve the migration's Cloudflare runtime adapters and account-owned DB/BUCKET bindings. Reporting uses the existing prepared-statement/batch interface and SQLite JSON functions. No new tracking library, public reporting request, visitor identifier or per-event database operation is introduced.
- Keep all existing migrations, including 0003_fat_proteus.sql and 0004_vengeful_nuke.sql, already included in v60. Preserve traffic_type, referrer, currency, item price JSON, totals, timestamps, consent and reporting_state. This follow-up adds no migration.
- Keep taksh.store/api/integrations/customer-sheet and CUSTOMER_SHEET_SYNC_KEY continuous at cutover, or rotate/reconnect deliberately. Preserve bound Script Properties CURSOR, SYNC_STATE, INITIAL_IMPORT_DONE and alert state, the single five-minute trigger, the existing Sheet layout and P/Q manual notes. Do not reset the cursor to repopulate previously cleared records.
- The committed customer-sheet.gs additionally skips contactless legacy selections. Install the matching script when integrating this follow-up; preserve its credentials and properties. Newly scanned excluded rows advance the cursor but create no customer row or alert. Existing excluded rows would need a separate targeted reconciliation; the live reference range was empty at the last check, so none were removed.

## Private owner exclusions and access

- Owner password was explicitly configured through the Sites secret store on4November and live sign-in verified. Never copy the password or hash into Git, this document, screenshots or chat. Establish the corresponding production secret privately during migration; do not use the local test fixture.
- INTERNAL_CONTACTS is a server-only secret containing JSON email/mobile arrays for verified owner testing contacts. Its value is not in source. Configure production privately and use synthetic contacts in previews. .env.example lists the name only. The Sites configuration has this setting prepared, but live v60 does not consume it; this follow-up has not been published to the frozen Sites deployment.
- Private contact matching runs only in authenticated dashboard/CSV reporting and key-authenticated Sheet export. It must never affect public checkout response flags: callers must not be able to probe whether a contact belongs to the private list. GA suppression uses the existing browser/internal marker, not private-contact matching. Each owner's testing browser/device must enter the existing /admin route once to acquire its internal marker; historical GA visits cannot be separated perfectly.
- Contactless historical placed records are retained as legacy selections, outside contactable request/unit/potential-value totals. Owner tests remain visible in All with an exclusion label. No records are deleted and historical prices are unchanged.

## Existing public flow and analytics

Preserve the user-approved v60 flow: no stock warning on product/cards/bag; the existing contact form ends with Go to payment; only after the same server-confirmed availability-request save does it show Currently out of stock, no payment and no confirmed order. No payment provider, address fields, revenue event or additional consent control was added.

Visitor/returning/funnel reports stay in existing Google Analytics by user choice. Keep measurement ID G-NHQFYHTNLP, canonical host, consent key and taksh-internal-traffic marker. No Analytics Data API bridge or extra Google permission is required. Browser identities are not exact unique people. Marketing-link tagging remains deferred.
