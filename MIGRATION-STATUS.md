# Taksh migration status

Updated5 November2026 (Asia/Kolkata). **Migration in progress; taksh.store still runs unchanged on Sites.** Workers Paid and R2 are active in the owner's Cloudflare account. The old Free CPU stop is resolved by explicit Paid approval. Only Workers Paid$5/month plus R2 inside its free allowance is authorised. No other paid products/trials.

## Saved source and current deployment

- GitHub source: https://github.com/ved267/taksh-website (private). Main reconciled to approved live Sites v60 through PR#1, merge `e036f7e`. Published Sites source `f07dfe675471c0befd519aabea1cf1d79e5aa392` was the reconciliation reference. Unpublished builder work was preserved privately; original builder folder is frozen.
- Active migration branch: `codex/cloudflare-migration`. Legacy Netlify/Turso work remains stopped on its old branches.
- Current isolated branch preview: https://codex-cloudflare-migration-taksh-store.taksh-ved267.workers.dev . Five hosted synthetic suites passed through the trusted compiled-artifact configuration. Dedicated owner staging is listed below. No production customer data is present. Draft migration [PR#3](https://github.com/ved267/taksh-website/pull/3), code checkpoint `547531b`, pushed; GitHub checks are deliberately SKIPPED while readiness is false, not claimed passed.
- Production D1/R2 provisioned; all five original schema migrations applied explicitly. Initial private Sites business snapshot imported into production D1:13orders,1reporting row,0enquiries/subscriptions/support; field-for-field reconciliation passed. No admin sessions/rate limits restored. Production domain/Worker app not switched. Final fresh export/delta reconciliation is still required at cutover.

## Verified

- Plain Cloudflare Worker/Vite/Vinext build; active Sites/ChatGPT/.openai hooks removed and legacy source archived.
-89unit tests passed. Typecheck and lint passed (3existing warnings). Fresh local D1/R2 request suites passed: selection/cart, email/mobile availability requests, no-contact validation, server prices, duplicate/retry prevention, owner login, confirmed-only demand/internal exclusion, Sheet failure/ack recovery, direct5MiB upload, private exact-byte photo download, logout revocation.
- Five hosted synthetic suites passed on the dedicated staging site and again on the renamed migration branch preview. Secure owner login/CSV, Sheet endpoint failure/recovery, exact5MiB private upload/download and logout revocation passed. No real customer email was sent. This does not prove a real Google Sheet write or browser speed.
- Fresh deterministic target versus native live-v60 main baseline: JS gzip247541bytes, CSS33364bytes (identical); Worker415038bytes versus415089bytes (51bytes smaller). All21key URLs returned200 and combined page-weight gate passed. Same-source main baseline measured5Nov04:16UTC; final target5Nov04:51UTC. No mobile/desktop browser speed comparison claimed yet.
- Dedicated staging https://taksh-staging.taksh-ved267.workers.dev is deployed with its own synthetic D1/R2 and noindex. It is **not ready for final staging approval** until owner setup, actual synthetic Sheet/notification delivery and browser checks finish. Latest full read-only crawl against live:18URLs,637assets,0errors; sitemap/robots/meta/404 match. Public UI/copy/assets unchanged.
- Real first backup5Nov:13592byte SQL+manifest in private R2, downloaded privately outside Cloudflare, restored into a fresh remote D1; all fields/counts matched (13orders,1report,5migrations,other tables0). The one-time operator used existing OAuth in memory, not a stored cron secret. Permanent dedicated credential remains pending and daily schedule **OFF**. R2d1/retention30days verified. Paid Time Travel remote bookmark verified; documentation confirms30days always-on. First monthly owner-only copy verified; monthly recurring copy is not scheduled yet.
- Staging previous-version rollback applied and verified in9050ms, then latest noindex version restored. One-command rollback and an optional Actions button are prepared. The two-minute target excludes DNS propagation and Actions queue/install time; production has no previous public app deployment yet.
- Cloudflare$3usage early-warning email saved/verified; invoice emails received. Official Cloudflare budget alerts exclude fixed subscriptions and tax: an exact$10total-bill forecast is **not implemented by those alerts**. The existing$10usage warning is not a substitute or hard cap. No Mac monitor was added.
- Hourly Mac monitor/schedule was deleted at the owner's request. No70k/day or2000minute alert applies on Paid. Do not recreate it.

## Latest required workflow (supersedes Workers Builds plan)

Production is implemented in GitHub Actions only after actual Validate steps pass on current main, rechecked immediately before deploy. Skipped/failed/stale/PR/other-repo runs are rejected. No automatic Workers Builds production path was connected. Preview builds are secret-free; a separate workflow_run uses trusted-main tooling, verifies current run/SHA/steps and safely extracts compiled artifacts, ignoring artifact config/hooks. Preview scripts create isolated resources and write verified PR URLs equally for claude/* and codex/*; direct Codex CLI preview works, actual Actions parity/comments remain pending credentials. All five workflow files parse successfully. Account readiness flags remain false: `TAKSH_CI_READY=false`, `TAKSH_DEPLOYMENT_READY=false`, so runner spend/deploys are deliberately off until free pool/budget and credential checks. Private Free branch protection returned403; no upgrade/public exposure. No migration merge/cutover yet.

## Monthly usage and cost

| Metric | Latest verified observation | Source/as-of |
| --- | --- | --- |
| Workers fixed fee |$5/month approved and active | Cloudflare subscriptions,4Nov |
| Requests / CPU | 283requests,0errors; total CPU4855.252ms, median6.397ms,p99170.471ms | Cloudflare account GraphQL,5Nov05:39:55UTC; November UTC month, delayed/sampled account-wide data |
| D1 rows |3094read /811written | Account GraphQL,5Nov05:39:55UTC |
| D1 storage | Production metadata110592bytes; all5D1databases544768bytes total | D1API,5Nov; file-size metadata may lag |
| R2 operations |67operations in November snapshot (account-wide, delayed) | Account GraphQL,5Nov05:39:55UTC |
| R2 billed storage |0.11GB-month,0billable/$0usage in current cycle | Cloudflare billing UI,4Nov; cycle15Oct–14Nov |
| Cloudflare build minutes | No rows in5Novsnapshot; no Workers Builds connected | GraphQL,5Nov05:39:55UTC; deployments now use Actions |
| GitHub Actions minutes | Unknown account included pool; runners held off | Billing API404/extrauser scope; owner UI required, no broadening |
| Images/Stream | Plan label Images Stream Basic; creation audit response being inspected for price/which subscription | Audit event4Nov19:24:46IST, owner account via Dashboard; not yet attributed to this plan |
| Total monthly bill | About$5base target plus tax/actual usage;4Novinvoice$2.09 received, not itemised in email | Usage alert is not a hard cap/total forecast |

## Required before staging approval

Finish actual isolated Sheet/notification delivery, owner private credentials, browser phone/desktop/GA checks and speed comparison, permanent backup credential then daily schedule/first cron, actual Actions checks/PR comments and Claude/Codex parity. Runtime, isolated staging, full crawl, real first remote backup/restore and staging rollback are verified above. Resolve Images/Stream cost/use and cancel only if unused and chargeable per owner's latest instruction. Keep provider billing emails; exact tax-inclusive total forecast is unavailable through native usage budget alerts. Browser tab control currently fails with timeoutMs error; native Chrome is shared with ElevenLabs work. Account actions remain pending Cloudflare availability.

## Required before switch approval

Private complete Namecheap zone, TTLs, redirects and forwarding-address inventory. Cloudflare Free zone and equivalent free Email Routing/redirects/verification records; lower TTLs a day ahead. Owner privately completes account security/credentials/forwarding verification. Written timed cutover/delta-import/rollback runbook. Owner must approve staging and separately approve nameserver switch. Sites stays live/untouched and builder frozen until then. Keep Sites14days after actual cutover, ask before retirement, take final export. Monitor and report72hours after switch. The first monthly owner-only export outside Cloudflare is tested/documented; its recurring copy job remains unscheduled. The Mac hourly usage monitor stays deleted.

Owner-only steps: [OWNER-STEPS.md](docs/cloudflare/OWNER-STEPS.md). Evidence and limitations: [Cloudflare status](docs/cloudflare/STATUS.md).

## Fresh review and fix pass

Whole-branch independent review found no Critical and3Important issues. Fixed: production credential no longer reaches normal branch-authored preview scripts; terminal-order reconciliation compares all fields and permits only explicit known progress, with compare-and-swap writes; source export requires contiguous pages from offset0 and one final terminal page, with unique keys. Reproducing tests failed then passed; final89unit suite passed, lint0errors/3existing warnings. Compiled-artifact trusted-config preview deployed and all5hosted request suites passed. Actual GitHub Actions remains unactivated/unverified. Private GitHub Free cannot prevent a deliberately malicious repo writer from creating a new workflow that accesses repository secrets; normal workflow safeguards must not be presented as that stronger boundary.

Initial private source snapshot was replayed twice with exact14record matches and unchanged13order/1report counts; after stricter review fixes, a further run reported0plannedwrites,0conflicts and14exactmatches. These are standby rehearsals, not the required fresh cutover/delta exports.
