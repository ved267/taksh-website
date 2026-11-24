# Taksh operations

[taksh.store](https://taksh.store) has run in the owner's Cloudflare account since 6 November 2026 at 18:15 IST. Claude owns day-to-day website work. GitHub main is the source of truth. [Migration evidence](../MIGRATION-STATUS.md)

## Resources

| Resource | Name / ID |
|---|---|
| Private source repository | ved267/taksh-website |
| Cloudflare account | 60742c7f90408058b71f1065a6815ddd |
| Production Worker | taksh-store, workers.dev disabled |
| Dedicated staging Worker | taksh-staging; https://taksh-staging.taksh-ved267.workers.dev |
| Production D1 | taksh-production / d110db81-9cb7-4b8d-90e5-3787ffd01517 |
| Staging D1 | taksh-preview / ee526389-8611-4c32-85f5-f9d29dadd27a |
| Production support bucket | taksh-production-support, private |
| Staging support bucket | taksh-preview-support, private |
| Backup bucket | taksh-private-backups, private; d1/ expires after 30 days |
| Branch storage | deterministic taksh-pr-<branch>-<hash>; lib/cloudflare/preview-config.mjs |
| Workers subdomain | taksh-ved267.workers.dev |
| Legacy restore verification D1 | taksh-restore-check-2026-11-05-956f5f48 / 55f0d177-2e1c-416d-ab70-02e52cefcc96 |
| Retired backup Worker | taksh-daily-backup; no public URL, no cron; not the backup path |
| Existing demand Sheet | 1PP8TvtPv5nD9XAbedCjQ7woxrjMu6G0ygUWRgfol9X0; Customer requests; gid1125591437 |
| GA4 measurement | G-NHQFYHTNLP |
| Production domain / registrar | taksh.store / Namecheap |
| Cloudflare DNS zone | ed2fc0cd07488e846bf9a736f9d3b734 / taksh.store / Free, active |
| Assigned nameservers | keira.ns.cloudflare.com and neil.ns.cloudflare.com |
| Production Worker routes | taksh.store/* and www.taksh.store/* → taksh-store |
| Canonical www redirect | 68dea6c78a10430bbd87230217f640ec; first;301 to apex with path/query |
| Existing HTTP upgrade redirect | 5403be6c336849f68de49d66f1aafdaf; second;302 to HTTPS with path/query |
| Original Sites source baseline | Sites v60, f07dfe675471c0befd519aabea1cf1d79e5aa392; reconciled GitHub main e036f7e395b9e65466f53b3c34a94f47a1455518 |

The apex uses proxied 192.0.2.0 and 192.0.2.1 placeholders. The www CNAME to taksh.store is proxied. Universal SSL covers both hosts. The www rule returns 301 to the HTTPS apex, and the apex HTTP rule returns 302 to HTTPS. Both preserve the path and query. The original verification and mail records were copied. Namecheap had zero email forwarding aliases and zero URL redirects, so there was no forwarding destination to test.

## Credentials and gates

**Taksh GitHub deploy** is the Cloudflare token in the repository Actions secret **CLOUDFLARE_API_TOKEN**. Its owner-account scopes are Workers Scripts Edit, D1 Edit, Workers R2 Storage Edit, Account Settings Read and Account Analytics Read. Trusted workflows use it for deploys, backups and recovery. DNS changes require the owner dashboard.

Application secrets are Cloudflare Worker settings: ADMIN_PASSWORD_HASH, CUSTOMER_SHEET_SYNC_KEY; optional existing email settings RESEND_API_KEY/FROM_EMAIL. .env.example lists all names. Branch previews override every inherited secret with synthetic values and disable customer mail. Never copy real credentials into branches, logs or artifacts.

`TAKSH_CI_READY`, `TAKSH_DEPLOYMENT_READY`, `TAKSH_PRODUCTION_READY` and `TAKSH_BACKUP_READY` are true. `TAKSH_CUTOVER_AT` is `2026-11-06T12:45:36Z`. GitHub has a $0 paid overage budget. Private GitHub Free cannot enforce branch protection. Follow the PR rules in AGENTS.md. Production independently checks Validate on current main.

## GitHub jobs — same API for Claude and Codex

Use `POST /repos/ved267/taksh-website/actions/workflows/<file>/dispatches` with JSON `{ "ref": "main", "inputs": {...} }`. Read the returned run in Actions; HTTP204 only accepts dispatch, it does not prove completion. CLI equivalent: `gh workflow run <file> --repo ved267/taksh-website --ref main -f operation=<operation>`. Read results with `gh run list` and `gh run view <id> --log-failed`. Never paste logs containing private data.

| File | Trigger / effect |
|---|---|
| validate.yml | Every PR and main push: locked npm install, build, units, type/lint, request flows and strict main-relative JS/CSS/Worker/page-weight gate. Cancels superseded runs. |
| preview.yml | Push to claude/* or codex/*, their PRs, or manual dispatch **with ref set to that branch**. Builds without deployment secrets. |
| deploy-preview.yml | Successful preview build; trusted main verifies provenance/extracts data-only artifact, creates isolated D1/R2, applies committed migrations and posts the preview URL on the PR. Never executes branch scripts with the token. |
| production.yml | Successful Validate push on current main, or manual main dispatch; independently rechecks successful current-main Validate and all readiness gates before deploy. |
| operations.yml | Manual main dispatch. `operation`: deploy-staging, rollback-staging, rollback-production, migrate-staging, migrate-production, restore-staging, usage. Optional backup_key only for restore. Production actions require production readiness. |
| backup.yml | Manual main dispatch for **backup now**. Daily at22:00UTC (03:30IST), only when deployment and backup gates are true. |
| rollback.yml | Legacy manual production rollback entry, also behind production readiness; prefer operations.yml. |
| migration-watch.yml | Manual or hourly at minute23, only after TAKSH_CUTOVER_AT. Quiet when healthy; private failure issue/rollback on HTTP/TLS failure; one72-hour summary and milestone PR, then disables itself. |
| retirement.yml | Manual or daily at 05:00 UTC. Opens a private owner decision issue after 14 days and then stops. The owner decides whether to delete the retained Sites project. |
| google-report.yml | Manual main dispatch with optional `days`. Read-only GA4 and Search Console aggregates. The `GOOGLE_SERVICE_ACCOUNT_JSON` secret still needs owner setup. |
| auto-merge.yml | After a successful pull_request Validate on a claude/* branch: squash-merges the PR with `AUTOMERGE_TOKEN` (see Auto-merge). Never touches codex/* PRs. |
| nightly-lighthouse.yml | Nightly 03:00 IST or manual: mobile Lighthouse on four live pages, trend in the job summary. Informational, never blocks. |

GitHub Actions must be allowed to create PRs for the automated72-hour milestone PR. Notifications are private issues assigned to ved267; delivery of GitHub email follows the owner's GitHub notification settings. A workflow failure is visible in Actions even if email is delayed. Scheduled Actions can be delayed; they are not an uptime SLA.

All mutable data jobs share taksh-data-operations concurrency. Preview deployments have per-branch concurrency; production releases serialize separately. Never start a migration/restore during a release.

## Auto-merge

Owner decision, 9 November 2026: claude/* pull requests merge themselves once Validate passes, so no merge waits for the owner.

- `auto-merge.yml` runs after every completed Validate. It acts only when all of these are true: the run was a successful `pull_request` run on a `claude/*` branch in this repository; Validate's own job ran and passed (a skipped job never counts); the PR is open, not a draft, based on `main` and without the `hold` label; its head is the commit Validate tested.
- One PR at a time (concurrency `taksh-automerge`). It first waits up to 20 minutes for Validate on the latest main commit. If main's Validate failed it comments on the PR and stops. If the PR's base is behind main it updates the branch and stops; Validate re-runs and the workflow fires again.
- It squash-merges with the `AUTOMERGE_TOKEN` secret, a fine-grained personal access token of ved267 (repository `ved267/taksh-website` only; Contents and Pull requests read and write, Metadata read; one-year expiry). A merge made with `GITHUB_TOKEN` would not start main Validate or production, so the token is required. Without it the workflow comments "auto-merge needs AUTOMERGE_TOKEN" and does nothing else.
- After the merge, main Validate and `production.yml` run exactly as for a manual merge. Merged branches are deleted automatically (repository setting).
- To stop one PR: add the label `hold`. To stop all: disable the workflow in Actions. codex/* PRs are unaffected and still merge by hand.
- Logic and tests: `scripts/auto-merge.mjs`, `tests/auto-merge.test.mjs`. The workflow runs main's copy of the script and never checks out PR code.

## Runbooks

**Deploy / product page.** Create claude/<task> or codex/<task>, one task per branch. Edit catalogue/routes/assets following existing patterns; product facts come from Namo Products/System/products.json. No secret or customer fixture. Open PR with what/why/tests and desktop/mobile screenshots for a visual change. Inspect Validate and the preview URL. Merge passing PR. Production deploys current validated main. Manual retry uses production.yml. Staging deployment: operations.yml input deploy-staging, using wrangler.staging.json.

**Rollback.** Dispatch operations.yml with rollback-production or rollback-staging. The job selects the preceding 100% Worker version and verifies the active version and key pages. Use additive migrations so earlier app versions can still use D1. DNS recovery and reopening the private Sites backup require an owner account action.

**Backup now.** Dispatch backup.yml on main. Native D1 export is downloaded privately, bounded to20MiB, SHA256 checked and parsed as SQLite, written to d1/YYYY-MM-DD/<snapshot UUID>/taksh-production.sql plus manifest.json. Forced manual backups create another immutable snapshot; the day's latest.json pointer changes only after completion. SQL/manifests remain private R2, never Actions artifacts. health/latest.json is published only after completion. Thirty-day lifecycle covers d1/ including pre-restore snapshots; verify retention after setup. Failed jobs leave the prior completed backup available. If the database approaches20MiB, raise/review the supported size before it exceeds this bound. D1 Time Travel on Workers Paid provides a separate30-day recovery layer.

**Restore test / recovery.** Dispatch operations.yml with restore-staging and optionally a completed daily key. The destination is fixed to staging and must differ from production. Verify source UUID, byte count/SHA, parse SQL, save a private pre-restore staging snapshot, import remotely and compare every table's count and canonical row-content hash. A failure restores the prior staging snapshot; inspect a failed restoration immediately. Proof is private R2 health/restore-staging.json; only counts and run links are logged. This job cannot restore production. To recover production, validate a staging restore first and use an explicitly reviewed recovery migration/import plan; never silently point this job at production. A restore replaces staging data; branch previews remain synthetic and isolated.

**Database change.** Commit generated SQL under drizzle/. Dispatch migrate-staging; run request checks. For production, after release approval dispatch migrate-production: it applies staging migrations first, takes a fresh production backup, then runs `wrangler d1 migrations apply DB --remote --config wrangler.json`. Staging uses `--config wrangler.staging.json`. Never apply migrations from a request. Do not drop columns needed by the preceding release. Validate/preview jobs run committed migrations against their own storage.

**Rotate a secret.** Owner uses Cloudflare Worker Settings → Variables and Secrets for application values; choose the correct Worker. For Sheet-key rotation, coordinate both Worker CUSTOMER_SHEET_SYNC_KEY and the existing Apps Script TAKSH_SYNC_KEY without resetting cursors/notes. Owner performs new credential entry privately. Deployment token rotation keeps the same scopes/account, replaces only GitHub CLOUDFLARE_API_TOKEN, verifies a preview+backup, then revokes the old token. No values in tickets/chat/screenshots. Initial hidden-entry helper is scripts/set-private-setting.mjs; owner-admins applies one privately entered password to both environments, and production-sheet accepts the existing key. Values are never printed. This is owner onboarding, not a routine operating dependency.

**Usage and cost.** Dispatch operations.yml with usage for requests/CPU/D1/R2 counters; use Cloudflare Billing invoices for money and Workers/D1/R2 dashboards for current allowance use. Base$5/month plus tax if applicable; R2 stays inside free allowance. The existing$3 usage email is sufficient with invoices; Cloudflare cannot provide the requested fixed-fee-inclusive forecast. GitHub stays within included compute/storage with$0 paid overage. DNS is prepared through the owner dashboard: the deployment credential intentionally has no DNS/zone-edit scope. Routine Wrangler deployments leave routes absent from config and preserve the dashboard-managed bindings. Native branch previews also consume Worker/storage capacity; review stale resources before reaching limits. Do not buy add-ons or create daily status reports. Record usage only with the agreed migration milestones; label sampled/delayed metrics and unavailable exact build-minute totals honestly.

**Cold Sites backup.** On 7 November 2026, the Sites integration changed v60 project `appgprj_6abff32e49a88191a4f182d4a3f59b98` to owner-only. Public access is disabled. The final D1 export contains 13 order records and one reporting-state row, plus source session and rate-limit data kept in the private export. Comparison with the cutover snapshot found zero new records and zero late submissions. Reconciliation with Cloudflare planned zero writes and found zero conflicts. The Sites integration has no R2 export capability. Zero support records reference files, and the bucket remains with the retained project. The owner may decide on deletion from **20 November 2026**. Resolve any need for a full bucket copy before deletion.

**Check the browser measurement (Pixel, Clarity, Google tag).** All three load from one place, `lib/tracking.ts`, and only when every one of these holds: `brand.ga` looks like `G-…`; `location.hostname` is exactly `taksh.store` (never localhost, a workers.dev host or a preview host); the path is not under `/admin`; `localStorage['taksh-internal-traffic']` is not `1`; the request is not classed automated (`taksh_auto=1` cookie, `navigator.webdriver`, or a user agent containing bot, crawler, spider, headless, preview or facebookexternalhit — `lib/bot-domain.mjs`); and the stored analytics choice is not off, the default being on. The Pixel and Clarity files then download on `requestIdleCallback` with a 4-second timeout (2-second `setTimeout` fallback), so allow about ten seconds before judging a page.

The owner's own browser is excluded for good after a single `/admin` visit, which makes every hand check look as if the Pixel were dead. Read and clear that flag in the browser console on taksh.store:

```
localStorage.getItem('taksh-internal-traffic')                      // "1" means this browser is excluded
localStorage.removeItem('taksh-internal-traffic'); location.reload() // measure this browser again
```

`tests/tracking-lifecycle.test.mjs` covers both halves of that, so the way back stays true. To check as a real visitor instead, drive a clean browser profile with Playwright, set `navigator.webdriver` to false and use an ordinary user agent (otherwise the automated rule excludes the run), then watch requests to `facebook.com/tr`: a set page sends PageView and ViewContent, Add to bag sends AddToCart, opening `/checkout` sends InitiateCheckout. Never submit the checkout form in a test — that saves a real request and sends a real server-side Lead.

## Private Mac locations

- Final Sites D1 export and checksum manifest: `/Users/devanshsmac/Desktop/Taksh Website Export/2026-11-07/private-data/sites-final.json` and `sites-final-manifest.json` in the same folder.
- Earlier private exports and DNS inventory: `/Users/devanshsmac/Desktop/Namo Products/Taksh Website Export/`.
- Checkout and ignored verification files: `/Users/devanshsmac/Desktop/Namo Products/Taksh Website/` and its `.local/` folder.
- Frozen builder: `/Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh`.
- Shared business state: `/Users/devanshsmac/Desktop/Namo Products/System/STATE.md`.

No scheduled website task depends on the Mac. The monthly D1 copy automation is paused and the hourly monitor is gone. The Mac holds private archive copies. GitHub runs the releases, previews, backups, restore, migrations and cutover watch. Apps Script runs the existing Sheet sync in Google's cloud.

## Lessons

Use the exact published v60 baseline for parity. Build previews without deployment secrets. Verify the hosted run and compare restored contents as well as counts. If the main size report expired, dispatch validate.yml on main and retry the PR. The owner accepted a staging desktop LCP difference of about 0.25 seconds on Bharat and Gully Cricket. Claude owns the speed follow-up and the 72-hour watch.

Browser measurement can go quiet without a single test failing, because nothing downstream breaks when the loaders disappear. `scripts/check-performance.mjs` now asserts that the built client still carries the Pixel, Clarity and Google tag loaders, the three identifiers and the funnel event names; `tests/tracking-lifecycle.test.mjs` locks the browser funnel, which event carries a server-shared `event_id` (only `Lead` does) and the owner-exclusion recovery. Running `npm run build` on the Mac rewrites `lib/image-assets.json` with different derivative hashes, because the local image library differs from CI's: never commit that churn (`git checkout -- lib/image-assets.json`), since the generated files under `public/media` are not in Git and CI regenerates files and manifest together.
