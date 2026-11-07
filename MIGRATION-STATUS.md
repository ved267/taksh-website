# Taksh migration status

## Live cutover, 6 November 2026

[taksh.store](https://taksh.store) started serving from the owner Cloudflare Worker at 18:15 IST (12:45:36 UTC). Namecheap delegates to keira.ns.cloudflare.com and neil.ns.cloudflare.com. Cloudflare Universal SSL is active. The original builder stays frozen. [Production deploy](https://github.com/ved267/taksh-website/actions/runs/42216581204)

- The fresh import reconciled 13 order records and one reporting-state row. The late snapshot found no new requests or conflicts and preserved the newer Cloudflare Sheet acknowledgement. No Sites sessions were restored.
- All 21 existing URLs matched the expected status and redirect. HTTPS, the www redirect and owner login and logout passed. A single internal request persisted through retry, left demand totals unchanged and arrived in the existing Sheet as Test. A 5 MiB synthetic support photo downloaded byte for byte with owner access. Anonymous and revoked access returned 401. The forwarding inventory was empty.
- GA4 loaded the existing tag and queued page_view. The test browser's Google Analytics opt-out prevented a delivery acknowledgement. Google reports are a separate GitHub job with owner credential setup pending. [Analytics reporting PR](https://github.com/ved267/taksh-website/pull/8)
- The owner accepted the desktop staging LCP differences. Five-load median differences were +0.148 s Home, +0.248 s Bharat, +0.240 s Gully and +0.204 s checkout. The repeated mobile matrix was not completed. Claude owns the speed follow-up.
- The hosted 72-hour check started and passed. The daily R2 backup passed after cutover. Claude owns the watch and retirement decision. [First watch](https://github.com/ved267/taksh-website/actions/runs/42220678130) · [Daily backup](https://github.com/ved267/taksh-website/actions/runs/42323902953)

November usage at 12:50 UTC on 6 November, account-wide and potentially delayed. Workers reported 510 requests and 14.399 CPU seconds. D1 reported 4,849 rows read and 1,129 written. R2 reported 117 operations, with billed storage unavailable from this query. Cloudflare Builds returned no minutes and the repository cannot report the account-wide GitHub minutes. The approved base remains $5/month plus applicable tax, with R2 within its free allowance. [Usage job](https://github.com/ved267/taksh-website/actions/runs/42220688529)

[Current operations and cold Sites backup](docs/OPERATIONS.md)

## Staging review record, 6 November 2026

6 November 2026. **Functional staging review is available; speed approval and cutover remain open.** taksh.store is still on Sites v60. Namecheap nameservers are unchanged. Production readiness is false.

Staging: https://taksh-staging.taksh-ved267.workers.dev

## Verified

- Main4950b598bbe4dc46f21c43b7cec5d719153f179d reconciles v60, requested owner lockout and hosted recovery. Original builder frozen. [Current main Validate](https://github.com/ved267/taksh-website/actions/runs/42167477547) passed111 units, six compiled request flows, build, types, lint (zero errors; three existing warnings) and strict public size checks.
- [Current staging deployment](https://github.com/ved267/taksh-website/actions/runs/42167569320) succeeded after the recovery rehearsal. Owner completed private password/Sheet-key entry; no values are in Git or evidence. Unauthenticated admin and Sheet feed return401/no-store.
- [GitHub backup](https://github.com/ved267/taksh-website/actions/runs/42160789232) and [staging restore](https://github.com/ved267/taksh-website/actions/runs/42166096423) succeeded, matching all table counts/content:13 requests,1 reporting-state row, zero support/enquiry/subscription/session rows,5 migrations. This is a rehearsal snapshot, not a fresh cutover export.
- Daily GitHub backups enabled03:30IST, private R2,30-day retention. D1 Time Travel remains the second layer. Monthly Mac copy best effort only.
- [GitHub-only rollback](https://github.com/ved267/taksh-website/actions/runs/42167481956) restored the preceding safe staging version in3.245seconds and passed page checks. The first rehearsal exposed suppressed CLI JSON; the checked API-based fix now passes the actual hosted job.
- Claude PR#4 passed Validate and received a real [preview](https://github.com/ved267/taksh-website/pull/4#issuecomment-6676707537), through the same jobs as the [Codex preview](https://github.com/ved267/taksh-website/pull/5#issuecomment-6676711049). #4 closed unmerged. Both preview URLs returned200/noindex. Normal preview, backup and rollback execute using GitHub credentials only; the Cloudflare token stays in Actions.
- Complete Namecheap inventory saved privately: zero email forwarders, zero domain redirects, DNSSEC off. All ten original DNS type/name/value/priority entries match the Free Cloudflare zone. Added www alias/routes and canonical301; preserved live HTTP-to-HTTPS302 with path/query. Four editable registrar TTLs now300seconds; automatic mail records are provider-locked at1800seconds. No new mailbox or unused Email Routing activation needed.
- Existing Apps Script source saved and verified against GitHub; only marked internal Test handling changed. Existing key/cursor/notes preserved. Existing time-based sync trigger remains, latest displayed run6Nov10:46:43IST,0% error rate. Live endpoint still Sites; Cloudflare delivery/acknowledgement remains a cutover check.
- All21 public routes match the live status/canonical destination, including four existing308 redirects. Staging remains noindex.
- Existing GA4 G-NHQFYHTNLP preserved, no new tracking library. Staging is excluded by hostname; www will redirect to the existing tracked apex. Production GA receipt remains a cutover check.

## One live-v60 comparison — approval still open

Native Chrome, cache disabled, desktop1440×900 and mobile393×852, no CPU/network throttling; viewport emulation, not a physical phone. No repeated benchmark matrix. All samples HTTP200, matching titles, CLS0.

| Largest contentful paint | Live v60 | Staging |
|---|---:|---:|
| Desktop home |0.672s|1.128s|
| Desktop Bharat (heaviest page) |4.264s|1.024s|
| Mobile home |0.564s|0.636s|
| Mobile Bharat |0.584s|1.176s|

These are mixed single observations, not a speed pass or proof of equivalent speed. The first staging origin had DNS34ms/TLS104ms while live had an existing connection. Live mobile Bharat did not settle to network-idle; both mobile product samples were read after load without reloading. PerformanceTimeline was unavailable; native browser timing/paint entries were used. Browser viewport/cache overrides were restored. Public JS247520bytes gzip/CSS33364bytes and all21 compiled key-page size gates remain unchanged; Worker415017bytes gzip includes the requested235-byte auth addition. No public UI/copy/assets changed.

## November usage snapshot

[GitHub usage job](https://github.com/ved267/taksh-website/actions/runs/42204395481), as of2026-11-06T10:40:31.249Z UTC, month beginning1Nov00:00UTC. Account-wide, potentially sampled/delayed; is not an invoice.

| Category | Reported usage |
|---|---|
| Workers |331 requests;0 errors;6.711seconds total CPU |
| D1 |4073 rows read;1060 written; production110592bytes, staging110592bytes at snapshot |
| R2 |103 operations; exact billed-storage measure unavailable in this query |
| Cloudflare Workers Builds |No build-minute rows returned; builds run in GitHub Actions |
| GitHub Actions |Account-wide included-minute consumption not available from the repo-level query; no paid overage authorised |

Cost: Workers Paid$5/month plus applicable tax, R2 within its free allowance. Existing$3 usage emails plus invoices; no forecast alert, extra paid service or Mac usage monitor.

## Phone review — about10minutes

1. Open staging/admin and sign in with the password you set. This also marks that browser internal.
2. Home/menu, Bharat and Gully Cricket: compare text/images with live; swipe/open/close galleries and note loading or layout problems.
3. Add a set, change quantity, refresh the bag, then open checkout. Submit one request using phone-check@example.test. No payment is collected.
4. Refresh the confirmation, then open admin → All: find that reference once, labelled Test/automated, with demand totals excluding it. Do not export or screenshot customer rows.
5. Test Help → missing piece with a small non-sensitive photo and check its confirmation. Log out and check that owner access closes. Private exact-byte retrieval is covered by the compiled support flow and earlier remote upload proof.

Report functional or speed problems. Cutover still requires the owner's explicit staging/cutover go and resolution of the speed hold. After go: fresh Sites export/import/reconciliation, validated production deploy, nameserver switch, website/www/TLS/request/dedup/marked Sheet Test/GA checks, second late-request export. No mail-alias test applies to the verified empty forwarding inventory. Critical failures roll back; quiet hosted72-hour watch and14-day Sites retirement approval follow. PR#2 rebases/checks only after cutover.

Maintained handoffs: [Operations](docs/OPERATIONS.md), [Architecture](docs/ARCHITECTURE.md). Private evidence paths are listed there; no exports, customer rows, credentials or customer hashes are committed.
