# Taksh operations — Claude and Codex

Updated 5 November 2026. GitHub `ved267/taksh-website` is the source. Shared checkout: `/Users/devanshsmac/Desktop/Taksh Website`. Read `AGENTS.md` first. Sites remains live pending two owner go/no-go decisions; this runbook describes the target and records incomplete account setup in `MIGRATION-STATUS.md`.

## Work and checks

Use `claude/<task>` or `codex/<task>`, one task and one agent per branch. Pull latest main before branching. Both agents use the same workflow; neither needs Cloudflare credentials for routine contributions. Never edit the frozen original builder. Open a PR explaining change, reason and tests. Visual changes require desktop/mobile screenshots; this migration changes no public design. Never include .env, exports, customer data or secrets.

```sh
npm ci --no-audit --no-fund
npm run build
npm test
npm run typecheck
npm run lint
node scripts/test-local.mjs
node scripts/check-main-performance.mjs BASE_COMMIT_SHA
```

CI sets `TAKSH_PERFORMANCE_BUILD_ID=00000000-0000-4000-8000-000000000001` for both builds. The baseline is the actual PR base/main commit, reconciled to live v60 via PR#1. Temporary legacy-baseline overrides affect build identity metadata only. The Validate job also pins public synthetic Vinext RSC/prerender/revalidation inputs for both benchmark builds; production and preview workflows rebuild separately without these test fixtures. Never deploy the benchmark build. A JS/CSS, compressed Worker or combined key-page weight increase fails. Do not relax a budget or update a baseline to conceal a regression. Performance artifacts are numeric only.

Local request tests use a direct Miniflare compiled-Worker/D1/R2 harness. Wrangler's local dev proxy intermittently failed the authenticated Sheet POST with `Network connection lost`, including on native v60; that proxy problem is not claimed fixed. Direct compiled-Worker tests and hosted synthetic tests pass. `npm start` still uses Wrangler's normal local proxy.

## Preview and production

GitHub Actions builds `claude/*` and `codex/*` without deployment secrets. A separate `workflow_run` job checks out trusted main tooling, verifies the successful current-branch run/steps/SHA, and safely extracts its compiled artifact. It ignores artifact hosting configuration/build hooks and constructs fixed preview bindings from trusted configuration. Artifact JavaScript is never run locally in the credentialed job. That job deploys separate native Preview URLs with dedicated branch-hashed D1/R2 resources. The deploy script explicitly applies committed migrations to that preview only and posts the verified stable URL on its open PR. Previews/staging use no production credentials/data and cannot send customer email. No full test suite on ordinary branch pushes; PR/main runs full checks. Superseded runs cancel. Compiled preview artifacts are about145MiB with current originals and expire after1day; account storage/included compute must be checked before activation to avoid paid overage.

Trust limit: same-repo writers can deliberately create another secret-reading workflow on private GitHub Free. Trusted-main deployment tooling prevents accidental branch-script/config/dependency access in the normal preview path; it is not a hostile-writer security boundary. Strong separation from hostile repo writers would require an owner-only deployment repository/broker outside contributor control, or a plan with applicable protected environments. No such new service/repository/paid plan was silently added. Owner/admin manual deployment capability is not falsely claimed revoked.

Production is only `.github/workflows/production.yml`, triggered by a successful main **push** Validate run. It verifies server-side actual completed checks, same repo/workflow, exact current-main SHA and successful required steps before install and immediately before deploy. A skipped Validate is insufficient. No Workers Builds production connection is configured. The sole automatic production credential is the repo Actions secret `CLOUDFLARE_API_TOKEN`; app/backup secrets stay in Cloudflare. Private GitHub Free branch protection is unavailable, so all contributors must preserve the deployment gate.

Free included compute and the existing zero-dollar paid Actions budget are verified; `TAKSH_CI_READY=true`. Credential activation remains pending (`TAKSH_DEPLOYMENT_READY=false`). An independent `TAKSH_PRODUCTION_READY=false` keeps production closed even when credential readiness later enables previews. Only after the owner release go/no-go may the operator set the production flag true and rerun Validate on exact current main to trigger the checked deployment. Do not enable production before staging/cutover approval. Test actual Codex and Claude PR previews/comments after activation before claiming parity. Deployment secret permissions must be verified against the actual preview command; no broad Global API Key.

Manual operator-only preview repair after a local build: `node scripts/deploy-preview.mjs`. Routine agents use Actions instead.

## Staging and rollback

Dedicated synthetic staging: https://taksh-staging.taksh-ved267.workers.dev (D1 `taksh-preview`, R2 `taksh-preview-support`; neither is production). Build explicitly with `TAKSH_WRANGLER_CONFIG=wrangler.staging.json npm run build`; verify compiled config name before deploying it. Do not overwrite another agent's active local build. Staging has `noindex`; public production headers are unchanged.

Inspect, then explicitly roll back:

```sh
node scripts/rollback.mjs staging
node scripts/rollback.mjs staging --apply
node scripts/rollback.mjs production --apply
```

The one apply command selects the preceding distinct 100% version, refuses gradual deployments, rolls code back, verifies the active version and loads Home/Gully Cricket. Staging drill on5Nov passed in9.05seconds; the latest noindex version was then restored. Production has no prior public app deployment yet. Target under2minutes applies to the measured command, not GitHub runner queue/install time or DNS propagation. An optional Actions → Roll back production → Run workflow button is prepared for main once activated. The command changes neither schema nor DNS. Check secret/binding compatibility with the prior version first; use backward-compatible migrations.

## Database and backup

Schema only through committed `drizzle/*.sql` migrations. Apply explicitly outside requests:

```sh
npx wrangler d1 migrations apply DB --remote --config wrangler.json
npx wrangler d1 migrations apply DB --remote --config wrangler.staging.json
```

Production migrations require reviewed compatible SQL and a current backup. Preview provisioning applies the same migrations only to its isolated database. No DDL in request handlers.

See [BACKUPS.md](cloudflare/BACKUPS.md) for first real remote restore evidence, permanent credential activation, daily03:30IST private R2 exports, always-on Paid30day Time Travel and the tested monthly private Desktop copy. Daily cron is currently OFF. Recovery is tested in a fresh separate database, never by overwriting production. Preserve source-time counts/content for restore comparison after live writes begin.

## Private settings

Owner personally opens Terminal in this checkout and runs `node scripts/set-private-setting.mjs MODE`. Modes: `production-admin`, `staging-admin`, `production-sheet`, `staging-sheet`, `backup-token`, `deployment-token`. Hidden input never enters command arguments/files/output. Admin input is confirmed and hashed locally; Sheet keys must be existing64hex values; backup mode verifies actual export permission before storing. Deployment mode stores only the repo Actions secret. App/backup modes store only Worker secrets. After rotation, verify the relevant login/Sheet/backup path; do not overwrite production Sheet key without updating its paired Apps Script property.

The source `INTERNAL_CONTACTS` secret is redacted by Sites and unused by exact v60; do not invent its values or silently add the later unpublished feature. Production email is optional and was not configured in the inspected source. Nonproduction always fails closed for customer email.

## Product changes

After migration, use a new agent branch and the current product record in Taksh OS `System/products.json`. Follow existing catalogue/page/image patterns; keep exact original images and responsive derivatives. Verify page, bag quantities/server price snapshot, existing URLs, metadata and mobile/desktop screenshots. Do not infer production stock/sales from availability requests. A new product needs PR review and the same regression gate; no editing Sites.

## Costs and health

Only Workers Paid$5base plus included D1 and R2 within free allowances is approved; no paid email/DNS/monitoring/backup/GitHub upgrade. Check Manage Account → Billing → Subscriptions, Billable Usage and Invoices monthly; R2 account use includes other projects. The saved$3usage warning is an early warning, not a cap. Cloudflare's [budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) track cumulative usage costs and [exclude fixed subscriptions](https://developers.cloudflare.com/billing/manage/billable-usage/); they do not implement the requested exact$10tax-inclusive forecast. Preserve invoice emails and report this limitation honestly.

Run `node scripts/usage-snapshot.mjs` manually for current month requests, errors, total CPU microseconds, CPU percentiles, D1 rows/storage metadata, R2 operations and Cloudflare build minutes. This creates no monitor/schedule. Record as-of dates and analytics delay/sampling in MIGRATION-STATUS. Obtain account GitHub Actions included usage from owner billing UI; repository run counts are insufficient. Enable no paid overage; owner checks free allowance/budget before CI readiness flags. Included Workers observability uses1%sampling, query redaction, no invocation logs and no traces; no paid Logpush or monitoring add-on.

## Cutover timetable — not yet scheduled

- **At least24hours ahead:** private full Namecheap zone/TTL/redirect/forwarding inventory; lower relevant TTLs. Prepare Cloudflare Free zone, compare every record, free Email Routing aliases/verified destinations and equivalent redirects. Resolve Sites R2 export boundary in [STORAGE-MIGRATION.md](cloudflare/STORAGE-MIGRATION.md). Verify custom-domain ownership/TLS coexistence while leaving Sites untouched.
- **Before choosing a window:** dedicated staging/browser mobile+desktop and equal preview checks, isolated real Sheet/notification test, backup permanent credential/daily first cron, rollback evidence, all URLs/assets/metadata/privacy checks. Show [phone checklist](cloudflare/PHONE-CHECKLIST.md) and get **staging approved**.
- **T−30min:** check no code/data schema drift, health/backup/rollback versions; record source v60 and target validated SHA. Capture existing Sheet script properties/cursor/manual notes privately. Confirm operator and owner available. Get separate explicit **nameserver switch approval** for this window.
- **T−10min:** fresh complete bounded Sites export (every table/page untruncated). Save private checksum/time; never call a paged read atomic. Dry-run then `node scripts/import-sites-business-data.mjs /absolute/private/export.json --apply`. Compare counts and every field, investigate conflicts. Exclude admin sessions/rate limits; verify referenced R2 files before accepting keys. Do not wipe target's legitimate newer records.
- **T0:** enable only the validated-main production deployment and exact prepared Worker custom-domain/DNS routing; owner saves assigned Cloudflare nameservers in Namecheap after separate go. Release a Sites hostname only if Cloudflare requires it and the reviewed rollback path is ready. No registrar transfer.
- **T+0–15min:** check authoritative/public DNS from multiple resolvers, apex/www HTTPS/TLS/redirects, sitemap/404/images; owner sign-in/CSV, one identified test request/no duplicate, private support upload, actual Sheet row and configured free notification. Verify production GA receipt/consent and test/internal exclusions without contacts/revenue. Test every email-forwarding alias with an authorised real email; retain manual notes/cursors.
- **T+15–60min:** fresh Sites export again, idempotent delta import, exact source/target reconciliation with legitimate newer target records retained. Repeat once old-source writes cease after propagation; log mismatches, not customer rows. Do not count staging or migration checks as demand.
- **First72hours:** report daily requests/errors/CPU, D1/R2/build usage, backup health and Sheet pending/failures in MIGRATION-STATUS with dates. Use Cloudflare's native logs/metrics and explicit daily checks; no hourly Mac monitor. Daily reporting schedule is not yet installed.
- **Day14 after actual switch:** final private Sites export/delta reconciliation, then ask owner before retiring Sites. Never silently delete old source/storage/domain history. Retain source generated URL and recovery instructions until owner retirement go.

If immediate application smoke tests fail, use previous Worker-version command and recheck. DNS/Sites fallback uses captured original authoritative/website settings and may require hostname reattachment/propagation; it is not a promised2minute DNS reversal. If data integrity fails, stop writes/review recovery rather than replaying unsafe imports. Record actual timestamps, version IDs, counts, outcomes and unresolved limits in status.
