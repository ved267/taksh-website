# Cloudflare migration — current status

Updated5November2026 (Asia/Kolkata). Workers Paid+$5base and R2 are verified active; earlier Free10ms gate is resolved. No other paid add-on/trial authorised. Sites is still live, builder frozen, domain unchanged. See [MIGRATION-STATUS.md](../../MIGRATION-STATUS.md) for the current evidence, monthly figures and pending checks. The historical feasibility report remains historical, not a current stop instruction.

## Resources

Owner account `60742c7f90408058b71f1065a6815ddd`.

| Purpose | D1 | R2 | State |
| --- | --- | --- | --- |
| Production | taksh-production | taksh-production-support | Schema migrated; initial private13order/1report snapshot reconciled; no public app cutover |
| Dedicated synthetic staging | taksh-preview | taksh-preview-support | Hosted5suite verification passed; noindex; synthetic data only |
| Branch previews | taksh-pr-<branch slug>-<branch hash> | same branch-specific name | Dedicated writable resources, production IDs rejected |
| Daily backup | Production export source | taksh-private-backups | Worker deployed; daily schedule OFF until dedicated credential is verified; first remote backup+restore passed |

No public R2 access enabled. Backup `d1/` retention30days verified. Backup code rejects exports above20MiB and checks exact bytes/SHA256 before writing a completion manifest. Paid Time Travel remote bookmark verified;30days always on. First monthly outside-Cloudflare SQL/manifest download passed its checksum; recurring monthly copy is not yet scheduled.

## Deployment and source

Main is reconciled to livev60 through [PR#1](https://github.com/ved267/taksh-website/pull/1). Source baseline validated with locked native build,71original units and five local request suites. Migration adds84total unit tests and synthetic hosted verification. Current migration branch is `codex/cloudflare-migration`.

Latest owner brief replaces Workers Builds production deployment: GitHub Actions alone deploys production after Validate succeeds on main. Preview resources remain isolated for both `claude/*` and `codex/*`. Actions deployment secret, actual PR comments/Claude parity and free-minute reporting remain pending. Dedicated staging, direct branch preview and9second staging rollback are verified. Readiness flags are false until owner account setup. Private Free branch protection is unavailable; do not pretend repository instructions enforce it.

## Billing and monitoring

$3usage email warning saved. $10total-bill forecast cannot be provided by native budget alerts: official documentation excludes fixed fees; the existing$10alert is usage-only. Images/Stream cost and creation attribution are being investigated; no cancellation performed. Latest owner instruction authorises cancellation if Taksh does not use it and it costs money.

The hourly Codex Mac automation was deleted, not paused. No70000/day or2000minute monitoring threshold remains. There is no Mac schedule for it. Use Cloudflare billing emails. Included1%sampled/query-redacted observability is configured/deployed on staging; current account usage is reported in MIGRATION-STATUS. Permanent daily backup credential/schedule and post-cutover72hour reporting remain pending.

## Known account access limitation

Wrangler can deploy and access D1/R2. Account token-management API returned403/9109; billing/audit APIs returned403/10000. This is a permission limit, not token creation success. Browser audit inspection works through native Chrome controls; extension browser calls currently fail with a timeout-options error. Any credential creation/security confirmation or owner-only step must be completed through the owner's account/private settings; never request raw credentials in chat.

## Data/storage limitations

Latest bounded Sites table export had zero omitted/truncated cells and all seven table cursors completed. It is not an atomic database snapshot. Initial business import matched every exported field; final fresh reconciliation and post-switch delta import are required.0support rows does not prove an empty bucket. Sites connector has no R2 list/export operation, so orphaned object inventory/export remains unresolved and must be explicitly solved or explained before claiming complete transfer.
