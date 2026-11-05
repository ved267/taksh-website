# Cloudflare migration status

Updated 5 November 2026. The owner has active Workers Paid ($5/month) and R2. No other paid add-on or trial is authorised. Sites v60 remains live; original builder frozen; domain unchanged. [MIGRATION-STATUS.md](../../MIGRATION-STATUS.md) contains current evidence, usage and remaining checks.

## Resources

Owner account `60742c7f90408058b71f1065a6815ddd`.

| Purpose | D1 | R2 | State |
| --- | --- | --- | --- |
| Production standby | taksh-production | taksh-production-support | Initial 13 orders/1 reporting record reconciled; no live domain cutover |
| Dedicated synthetic staging | taksh-preview | taksh-preview-support | Five hosted suites pass; noindex, no production email/data |
| Branch previews | taksh-pr-<slug>-<hash> | Same branch-specific name | Isolated native preview deployed; actual Actions comments/parity pending |
| Daily backup | Production export source | taksh-private-backups | First remote backup/independent restore pass; permanent token and cron pending |

No public R2 access. Backup d1/ retention 30 days, Paid D1 Time Travel 30 days. First monthly private copy verified; monthly copy automation active for first-day 10:00 IST, first scheduled run pending.

## Source and deployment

Main matches published v60 through PR#1. Draft migration PR#3 has the plain runtime, isolated storage, explicit migrations/import/restore tools and shared Claude/Codex workflow. Independent review fixes cover secret-free branch builds, verified trusted-main extraction/deploy, all-field import conflicts/CAS and complete contiguous export pages.

Actual GitHub Validate on ddc4e84 passed all checks and its preview build passed. Controlled benchmark main/target JS 247,520 / CSS 33,364 / Worker 414,782 gzip bytes, identical; all 21 key-page gates pass. Numeric artifacts downloaded. Current local unit suite 90/90 includes a new separate production-activation regression test; its next hosted verification is pending.

`TAKSH_CI_READY=true` after free-budget verification. `TAKSH_DEPLOYMENT_READY=false` until the scoped deploy credential is verified. `TAKSH_PRODUCTION_READY=false` is an independent release gate, so previews can be tested before production approval. Production accepts only actual successful Validate steps on exact current main; no Workers Builds production path. GitHub private Free branch protection is unavailable, as accepted in the owner's deployment-gate brief. Actual Claude/Codex preview comments remain unverified.

## Billing and access

$3 usage email alert saved. Native usage budgets cannot forecast an exact $10 total including fixed subscriptions/tax. Images/Stream verified unused/$0 with paid storage off; left unchanged. Creation actor/date still unresolved. Workers proration invoice verified privately; second invoice skipped by owner. Hourly Mac usage monitor deleted and remains absent.

Wrangler can deploy/access D1/R2. Account token-management API returned 403/9109; billing/audit API 403/10000. Native Chrome recovered sufficiently to prepare the D1 Read token review and verify GitHub free compute/zero paid-overage budget. Owner approved and the read token was created/stored, but metadata read200/export401. A stale native screenshot exposed it; owner disable/revoke and verification are pending. Do not reuse it or grant broader permissions silently. Browser DOM control still fails with a timeout-options error; native work later stopped because the Mac locked and automatic unlock failed. Owner unlock is complete; no daily-cron activation or cutover claimed.

## Data and integrations

Latest bounded source export was complete within the exposed seven tables but is not an atomic snapshot. Initial import/remote restore exact; final fresh and late-write reconciliation remain required. Sites exposes no R2 list/export operation, so orphan-object export cannot be claimed; see STORAGE-MIGRATION.md.

Staging Sheet is private, empty and structurally verified; actual key/script authorisation/feed row/notification pending. Initial desktop/phone-preset Gully measurements and basic UI interactions captured, but wider repeated speed, analytics and physical-phone approval remain pending. Full DNS/forwarding inventory, free Cloudflare equivalents and the two owner go/no-go decisions remain before cutover.
