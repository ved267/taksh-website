# Taksh Cloudflare migration

Updated 5 November 2026. **The transfer is not complete.** taksh.store still runs on Sites v60; its domain and live app remain untouched. The original builder is frozen. Owner-approved hosting is Workers Paid ($5/month) plus R2 within its free allowance. No other paid service or trial is authorised.

## Source and deployment

- GitHub: https://github.com/ved267/taksh-website . Main is reconciled to published v60 through PR#1, commit `e036f7e395b9e65466f53b3c34a94f47a1455518`. Migration is on `codex/cloudflare-migration`, draft [PR#3](https://github.com/ved267/taksh-website/pull/3). Reporting PR#2 remains separate.
- Plain Worker/Vinext/Wrangler runtime replaces active Sites, ChatGPT sign-in and .openai hosting hooks. Original schema and five explicit migrations preserved. Public components, copy, layout, CSS and assets unchanged.
- GitHub Actions is the production path. It requires successful actual Validate steps on exact current main, rechecked before deployment. Workers Builds production is not connected. Private GitHub Free lacks branch protection; the owner's replacement safety rule is the deployment gate.
- GitHub variables: `TAKSH_CI_READY=true`, `TAKSH_DEPLOYMENT_READY=false`, `TAKSH_PRODUCTION_READY=false`. CI uses the verified free allowance. Deployment credential readiness enables preview testing separately from the production approval switch, which stays false until the release go/no-go.
- Preview builds have no deployment secrets. A trusted-main workflow verifies run identity/SHA/steps, safely extracts compiled data and uses fixed isolated bindings. Artifact scripts/configuration are not executed with credentials. A deliberately malicious repository writer can still create another secret-reading workflow on private Free; this is not claimed prevented.

## Verified

- Local suite now **90/90 unit tests**, including a failing-then-passing test that preview activation cannot open the production release gate. Typecheck/lint and all five compiled-Worker synthetic request suites previously passed; lint has three existing warnings.
- Actual [GitHub Validate on ddc4e84](https://github.com/ved267/taksh-website/actions/runs/42018271372) passed locked install, build, 89 units, typecheck, lint, request flows and strict comparison against native live-v60 main. Its preview build also passed. The new production-switch test/change follows that verified revision and needs the next hosted run.
- Downloaded both numeric GitHub performance reports: JS gzip **247,520 bytes**, CSS **33,364 bytes**, Worker **414,782 bytes**, identical between base and target. All 21 key page-weight checks passed. Reports now upload even from the hidden folder and missing reports fail. Vinext's random server build/authentication inputs are fixed only in the non-deployed synthetic benchmark job; production/preview builds retain normal random values. No size threshold was relaxed. Earlier 51-byte differences were observations before these remaining random inputs were controlled.
- Dedicated staging and isolated branch preview passed five hosted synthetic suites: cart, availability requests, duplicate/retry prevention, owner sign-in/CSV, Sheet endpoint failure/ack recovery, direct exact **5 MiB** private photo roundtrip and logout revocation. These do not prove an actual Google Sheet row or notification.
- Full live/staging comparison: **18 URLs and 637 assets**, no errors; sitemap, robots, metadata, 404, fonts and images checked.
- First real production D1 export: **13,592-byte SQL**, private R2 SQL/manifest/hash verified, owner-only copy outside Cloudflare, fresh independent remote D1 restore with every field/count matching. Orders 13, reporting_state 1, migrations 5, other tables 0. Initial standby import replay: 14 exact records, no conflicts/writes. These are not final cutover snapshots.
- Staging rollback applied and health verified in **9.05 seconds**, then current staging restored. This excludes Actions queue/install and DNS propagation.
- Native Chrome: Home/Gully rendered, desktop gallery open/next/close, iPhone 16 menu open/close, add-to-bag and bag persistence observed. Initial single Gully LCP observations: staging/live 1.14/3.70 seconds on 393×852 phone preset; 0.95/3.22 seconds on narrow desktop with DevTools docked right; all CLS 0, no CPU/network throttling. These uncontrolled-cache single samples are not the full repeated/key-page or physical-phone gate. No quantity-change claim.

## Staging and integrations

Staging: https://taksh-staging.taksh-ved267.workers.dev . Branch preview: https://codex-cloudflare-migration-taksh-store.taksh-ved267.workers.dev . Both use synthetic isolated storage, non-production email blocking and noindex. **Staging is not yet ready for final owner approval.**

A private synthetic Google Sheet with the existing 17 headers is prepared, with no customer rows. Native headers, private access, IST timezone, frozen rows/columns and native export render verified. Its staging-only Apps Script is prepared privately. Owner key/Google permission, actual feed row and owner notification remain pending. Production Sheet and its cursor/manual notes remain untouched. Owner passwords also need private setup.

Automatic Actions preview deployment, PR URL comments and actual Claude/Codex parity remain unverified until the deployment credential and trusted-main workflow are active. Do not claim that Claude's PR has received a preview yet.

## Backups and account settings

Daily backup Worker is deployed without a public endpoint; **daily schedule remains OFF**. Owner approved token creation and unlocked the Mac. Account-owned `Taksh daily D1 export` was created with D1 Read only and saved only as the backup Worker secret. Database-info GET returned200; native export POST returned401/code10000, so export permission is not verified and no activation proof was written. A later native screenshot retained the old token-success modal despite text state showing it closed; treat that token as exposed and never reuse it. Owner was asked to disable/revoke it because browser controls became inconsistent/blank. Disable/revoke verification and a fresh working least-privilege credential are pending. No broader permission was granted. Daily schedule remains off.

Paid D1 Time Travel's current remote bookmark verified; 30-day retention is always on. R2 `d1/` retention is 30 days. Monthly owner-only copy automation `taksh-monthly-private-d1-copy` is ACTIVE for the first of each month at 10:00 IST. It requires matching checksum/size, private permissions and backup age ≤48 hours. First scheduled run pending; the Mac must be awake and Wrangler signed in. The old hourly usage monitor remains deleted.

Cloudflare $3 usage email warning is saved. Native budget alerts exclude fixed subscriptions/tax, so they cannot implement an exact $10 total-bill forecast; the existing $10 usage alert is not that forecast or a cap. Images/Stream is unused by Taksh, configured at **$0/month**, paid storage unchecked, zero image delivery/transformations/origins; left unchanged under the owner's conditional cancellation instruction. Exact creation date/actor remains unattributed. Invoice IN-87226026 was Workers proration $1.77 +18% IGST $0.32 = $2.09. Owner declined the second invoice download; not read.

## Monthly usage

Cloudflare account-wide November UTC snapshot **5 Nov 11:22:45 UTC**; delayed/sampled analytics, not an invoice:

| Metric | Observation |
| --- | --- |
| Workers | 295 requests, 0 errors; total CPU 5,595.348 ms; median 6.856 ms, p99 198.367 ms |
| D1 | 3,102 rows read / 820 written; production 110,592 bytes, all five databases 544,768 bytes |
| R2 | 68 operations; last dashboard billed-storage observation 0.11 GB-month/$0 for 15 Oct–14 Nov, observed 4 Nov |
| Cloudflare build minutes | No rows; Workers Builds not connected |
| GitHub Actions | Before these runs: $0.05/$12 included compute, 0/0.5 GB storage, $0 billed; owner UI 5 Nov about 11:00 UTC. Existing $0 paid Actions budget blocks overage; included alerts On. Exact account-month billed minutes unavailable: current dashboard reports compute dollars. Validate ddc4e84 elapsed 9m37s; this is a job duration, not account billed minutes. |
| Expected base cost | $5/month plus tax and actual usage; no other paid add-on activated |

## Remaining before the switch

1. Disable/revoke the exposed newly created backup token and verify it no longer authenticates. Mac unlock is complete. Native text/rendered frame inconsistency and blank Cloudflare UI prevent reliable security clicks; dedicated DOM calls still fail with timeoutMs. No disable success is claimed.
2. Replace the exposed, export-incompatible read token with a fresh verified credential (broader access needs explicit approval); finish deployment credentials, owner passwords and Sheet key/Google consent; verify real isolated Sheet/notification delivery and the first daily cron.
3. Finish hosted current-head CI, automatic preview URL comments and Claude test PR parity; complete repeated browser/analytics checks and the phone checklist.
4. Capture full private Namecheap DNS/TTL/redirect/forwarding inventory. Prepare equivalent Cloudflare Free zone, verified free Email Routing and www redirect. Lower TTLs a day ahead. Public lookups are not a complete inventory.
5. Sites connector cannot list/export the managed R2 bucket, including orphan objects. Zero support rows is not proof it is empty. The exact unsupported boundary is documented in STORAGE-MIGRATION.md; owner UI/provider export is still sought, with no complete storage-export claim.
6. Owner approves verified staging, then separately approves the nameserver switch/window. Take fresh and late-write Sites snapshots, reconcile counts/content idempotently, switch and smoke-test domain/TLS/mail/Sheet/GA. Keep Sites 14 days, report 72 hours, obtain a separate retirement decision.

Owner-only actions: [OWNER-STEPS.md](docs/cloudflare/OWNER-STEPS.md). Operations: [RUNBOOK.md](docs/RUNBOOK.md).
