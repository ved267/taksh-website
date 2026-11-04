# Demand tracking — migration handoff

Current work follows the user's 3 November constrained scope: existing UI and asynchronous GA4 only. Marketing tagging deferred. No new visitor cookie, customer profile store, recording, paid service, public form/control/screen or blocking analytics request.

Migration-sensitive components:
- Existing `db/index.ts` is the only database binding boundary. APIs use the existing D1-compatible prepared-statement/batch interface. A Vercel runtime must adapt this existing boundary and R2 photo storage; tracking does not introduce another hosting dependency.
- Apply additive `drizzle/0003_fat_proteus.sql`: `orders.traffic_type`, `orders.referrer`, and `reporting_state` aggregate/sync cache. Also apply `drizzle/0004_vengeful_nuke.sql` for the explicit historical INR currency field. Preserve all older migrations, order item JSON, totals, timestamps, token hashes and consent choices. Do not recalculate old request prices.
- Keep `https://taksh.store/api/integrations/customer-sheet` and `CUSTOMER_SHEET_SYNC_KEY` stable across DNS/hosting cutover, or update the existing bound Google Apps Script endpoint at the same cutover. Its cursor, SYNC_STATE partial-write recovery property and deduplication reference column must survive. Test/automated rows are scanned but excluded from the customer Sheet. Raw secrets stay outside Git.
- Keep GA measurement ID `G-NHQFYHTNLP`, canonical domain and browser consent key. Preview hosts and automated/internal browsers are excluded.
- Owner access uses existing `ADMIN_PASSWORD_HASH`; user states they never set a password. Usable owner sign-in is unresolved. Do not export a guessed password or silently reset credentials.
- Customer Sheet owner: bengani.devansh2004@gmail.com. The bound Apps Script project is `1mtedPc3FL3ocp7zB0MoTZ4gTy35X0Wlmcytn_KFYxQwuXUlN93IafQO7`. Script property `TAKSH_SYNC_KEY` is already configured and must not be printed or committed.
- Existing owner reports/layout are retained. User chose to keep visitor/funnel reports in Google Analytics. No Analytics Data API bridge, new Google permission or duplicate visitor cache is shipped.

Export source only after the final checked commit; current uncommitted changes are in progress. Superseded expanded UI/identity draft is archived in ignored `outputs/measurement-plan-2026-11-03/superseded-draft`, not part of the shipping source.

4 November user-approved flow update: remove stock labels from cards/product pages/bag. The existing contact form now ends in “Go to payment”; only after the same server-confirmed availability-request save does it show “Currently out of stock,” explicitly no payment and no confirmed order. No payment form/provider, address fields, payment records or revenue events were added. Preserve this latest flow during export; earlier “keep all wording unchanged” constraint has this explicit exception.
