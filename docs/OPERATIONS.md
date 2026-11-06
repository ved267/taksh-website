# Taksh operations

Status: migration preparation; Sites remains live. Read AGENTS.md first. This document describes implemented controls; successful hosted evidence belongs in MIGRATION-STATUS.md at the three agreed milestones. Do not confuse an available workflow with a verified run.

## Resources

| Resource | Name / ID |
|---|---|
| Private source repository | ved267/taksh-website |
| Cloudflare account | 60742c7f90408058b71f1065a6815ddd |
| Production Worker | taksh-store; workers.dev disabled |
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
| Production domain / registrar | taksh.store / Namecheap; DNS/forwarding preparation pending |
| Live source baseline | Sites v60, f07dfe675471c0befd519aabea1cf1d79e5aa392; reconciled GitHub main e036f7e395b9e65466f53b3c34a94f47a1455518 |

Zone ID, matched DNS/aliases and cutover timestamp must be added when prepared. Do not invent them. Do not touch unrelated Cloudflare resources.

## Credentials and gates

Only Cloudflare token: **Taksh GitHub deploy**, stored only as repository Actions secret **CLOUDFLARE_API_TOKEN**. Minimum permissions in the owner account: Workers Scripts Edit, D1 Edit, Workers R2 Storage Edit, Account Settings Read, and Account Analytics Read for the requested usage/watch queries. Analytics Read is an addition to the historical four-scope OWNER-STEPS list and must be visible in the same owner final token review. No billing, DNS, user administration, KV, AI or containers. Scope workers/resources further if supported. It is used by trusted-main deployment and backup jobs; no separate backup credential. GITHUB_TOKEN is GitHub's ephemeral per-job credential, not another Cloudflare token.

Application secrets are Cloudflare Worker settings: ADMIN_PASSWORD_HASH, CUSTOMER_SHEET_SYNC_KEY; optional existing email settings RESEND_API_KEY/FROM_EMAIL. .env.example lists all names. Branch previews override every inherited secret with synthetic values and disable customer mail. Never copy real credentials into branches, logs or artifacts.

Repository variables: TAKSH_CI_READY enables checks within included GitHub compute; TAKSH_DEPLOYMENT_READY enables operations/previews; TAKSH_PRODUCTION_READY remains false until the owner's cutover go; TAKSH_BACKUP_READY remains false until the first GitHub backup and restore pass; TAKSH_CUTOVER_AT is an ISO UTC timestamp set only at cutover. GitHub's $0 paid-overage budget must remain in place. Private GitHub Free cannot enforce protected-main rules; agents must use PRs, and production tooling independently verifies current main's successful Validate.

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
| retirement.yml | Manual or daily05:00UTC after cutover. At14days, private approval issue requesting final Sites export, then disables itself. Does not retire Sites. |

GitHub Actions must be allowed to create PRs for the automated72-hour milestone PR. Notifications are private issues assigned to ved267; delivery of GitHub email follows the owner's GitHub notification settings. A workflow failure is visible in Actions even if email is delayed. Scheduled Actions can be delayed; they are not an uptime SLA.

All mutable data jobs share taksh-data-operations concurrency. Preview deployments have per-branch concurrency; production releases serialize separately. Never start a migration/restore during a release.

## Runbooks

**Deploy / product page.** Create claude/<task> or codex/<task>, one task per branch. Edit catalogue/routes/assets following existing patterns; product facts come from Namo Products/System/products.json. No secret or customer fixture. Open PR with what/why/tests and desktop/mobile screenshots for a visual change. Inspect Validate and the preview URL. Merge passing PR. After cutover, production deploys current validated main; manual retry uses production.yml. Before cutover, it stays locked. Staging deployment: operations.yml input deploy-staging, using wrangler.staging.json.

**Rollback.** Dispatch operations.yml with rollback-production (or rollback-staging). It selects the previous100% Worker version, verifies the active version and probes home/product paths. Code only: it never reverses schema or DNS. Before first domain switch, retain two healthy own-account releases so previous means a known-good app. During initial DNS smoke failure, the operator restores the privately recorded Namecheap nameservers/records immediately; no extra owner approval. Hosted watch can restore Worker code but cannot operate the Namecheap browser. Use additive, backwards-compatible migrations so code rollback remains possible.

**Backup now.** Dispatch backup.yml on main. Native D1 export is downloaded privately, bounded to20MiB, SHA256 checked and parsed as SQLite, written to d1/YYYY-MM-DD/<snapshot UUID>/taksh-production.sql plus manifest.json. Forced manual backups create another immutable snapshot; the day's latest.json pointer changes only after completion. SQL/manifests remain private R2, never Actions artifacts. health/latest.json is published only after completion. Thirty-day lifecycle covers d1/ including pre-restore snapshots; verify retention after setup. Failed jobs leave the prior completed backup available. If the database approaches20MiB, raise/review the supported size before it exceeds this bound. D1 Time Travel on Workers Paid provides a separate30-day recovery layer.

**Restore test / recovery.** Dispatch operations.yml with restore-staging and optionally a completed daily key. The destination is fixed to staging and must differ from production. Verify source UUID, byte count/SHA, parse SQL, save a private pre-restore staging snapshot, import remotely and compare every table's count and canonical row-content hash. A failure restores the prior staging snapshot; inspect a failed restoration immediately. Proof is private R2 health/restore-staging.json; only counts and run links are logged. This job cannot restore production. To recover production, validate a staging restore first and use an explicitly reviewed recovery migration/import plan; never silently point this job at production. A restore replaces staging data; branch previews remain synthetic and isolated.

**Database change.** Commit generated SQL under drizzle/. Dispatch migrate-staging; run request checks. For production, after release approval dispatch migrate-production: it applies staging migrations first, takes a fresh production backup, then runs `wrangler d1 migrations apply DB --remote --config wrangler.json`. Staging uses `--config wrangler.staging.json`. Never apply migrations from a request. Do not drop columns needed by the preceding release. Validate/preview jobs run committed migrations against their own storage.

**Rotate a secret.** Owner uses Cloudflare Worker Settings → Variables and Secrets for application values; choose the correct Worker. For Sheet-key rotation, coordinate both Worker CUSTOMER_SHEET_SYNC_KEY and the existing Apps Script TAKSH_SYNC_KEY without resetting cursors/notes. Owner performs new credential entry privately. Deployment token rotation keeps the same scopes/account, replaces only GitHub CLOUDFLARE_API_TOKEN, verifies a preview+backup, then revokes the old token. No values in tickets/chat/screenshots. Initial hidden-entry helper is scripts/set-private-setting.mjs; owner-admins applies one privately entered password to both environments, and production-sheet accepts the existing key. Values are never printed. This is owner onboarding, not a routine operating dependency.

**Usage and cost.** Dispatch operations.yml with usage for requests/CPU/D1/R2 counters; use Cloudflare Billing invoices for money and Workers/D1/R2 dashboards for current allowance use. Base$5/month plus tax if applicable; R2 stays inside free allowance. The existing$3 usage email is sufficient with invoices; Cloudflare cannot provide the requested fixed-fee-inclusive forecast. GitHub stays within included compute/storage with$0 paid overage. Native branch previews also consume Worker/storage capacity; review stale resources before reaching limits. Do not buy add-ons or create daily status reports. Record usage only with the agreed migration milestones; label sampled/delayed metrics and unavailable exact build-minute totals honestly.

**Cutover and verification.** Prepare the complete private Namecheap DNS/URL redirect/email-forwarding inventory, matched Cloudflare Free zone, verified destinations, same aliases and lower TTLs. Do not switch nameservers before owner staging go. Run one mobile/desktop live-v60/staging comparison. At the go: fresh Sites bounded export/import and count/content reconciliation, enable production, deploy validated main, attach domain/routes and change Namecheap nameservers in the owner's browser. Probe apex/www/TLS, owner sign-in, availability request/retry dedup, Sheet marked Test, GA and an actual test mail to every alias. Use one internal request with campaign taksh-migration-check, excluded from demand totals and labelled Test in the Sheet. Take a second Sites export and idempotently import late requests. Critical failure triggers immediate rollback. Set the cutover timestamp only when switched. At72hours publish one summary/status milestone. At14days ask before retirement and export Sites first. Rebase/check reporting PR#2 only after cutover.

## Private Mac locations (paths only)

- Checkout: /Users/devanshsmac/Desktop/Taksh Website
- Ignored verification/helper files: /Users/devanshsmac/Desktop/Taksh Website/.local/
- Private exports/rollback inventory: /Users/devanshsmac/Desktop/Taksh Website Export/
- Monthly offsite copies: /Users/devanshsmac/Desktop/Taksh Website Export/2026-11/private-data/ (future months YYYY-MM)
- Frozen original: /Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh
- Shared business state: /Users/devanshsmac/Desktop/Namo Products/System/STATE.md

The existing monthly automation taksh-monthly-private-d1-copy runs on the first day at10:00IST, best effort only, and needs this Mac awake. All daily backups, release, migration, rollback and staging restore operations are hosted Actions; monthly Mac copy is the sole accepted local scheduled dependency.

## Lessons

Use exact published v60 for parity, not later builder drafts. Build branch code without secrets and deploy with trusted tooling. Gate production independently of previews. Match restore contents as well as counts. Native UI text and screenshots can disagree: never capture a revealed credential window. Do not mistake an accepted dispatch or prepared form for a successful operation. Sites object inventory could not be exported completely; no support rows reference photos, so the owner closed that unused-data limitation without further export work.
