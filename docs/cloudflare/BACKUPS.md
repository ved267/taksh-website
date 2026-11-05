# Backups and recovery

Updated 5 November 2026. The daily schedule is **OFF** until the permanent credential is entered and verified. No backup HTTP endpoint is public.

## Verified first remote backup

On 5 November, the production D1 export was written to private `taksh-private-backups/d1/2026-11-05/taksh-production.sql` (13,592 bytes), with a SHA256 manifest and matching R2 metadata. The first run used the existing authorised owner's Wrangler OAuth in memory; that expiring session was **not** stored as the cron credential.

The SQL and manifest were downloaded into the owner-only folder `/Users/devanshsmac/Desktop/Taksh Website Export/2026-11/private-data/`, with private directory/file permissions. A fresh remote D1 database, `taksh-restore-check-2026-11-05-956f5f48`, was created independently and restored from this SQL. Every field matched production. Counts: orders 13, reporting_state 1, d1_migrations 5; enquiries, subscriptions, support, admin_sessions and rate_limits 0. The private restore database is retained for review and is not bound to a public Worker. Evidence: ignored `.local/remote-backup-verified.json`.

This proves the export, real R2 object, offsite download and remote restore. It does not prove a permanent token or a scheduled execution.

## Permanent credential and activation

Follow the single owner checklist in [OWNER-STEPS.md](OWNER-STEPS.md). The first account-restricted **D1 Read** token was created and tested: database metadata GET200, native export POST401/code10000. It is not sufficient in this tested setup. Do not assume Read is a verified export permission or silently grant Edit. That token also appeared in a stale native screenshot and must be disabled/revoked and never reused; owner action/verification pending. A fresh working permission must be reviewed and approved before activation. Private entry helper:

```sh
node scripts/set-private-setting.mjs backup-token
```

Input is hidden. The helper verifies that this credential can complete an actual production export, stores it only in the backup Worker's `D1_BACKUP_TOKEN` secret, and writes non-secret verification metadata locally. Never use a Global API Key or paste tokens into chat. The token permission covers D1 in the selected account; a per-database selector must not be invented.

Then the operator runs:

```sh
node scripts/enable-daily-backup.mjs
```

This refuses activation without a matching remote restore and dedicated credential proof from the last 24 hours, plus the saved Worker secret. If those proofs have expired, repeat verification first. The committed configuration enables `0 22 * * *`: **03:30 IST daily**. After activation, verify the schedule through Cloudflare and the next real `health/latest.json`; record the first cron result. Do not claim cron health from the one-time operator run.

## What is retained

The backup code uses the official [D1 polling export API](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/export/). Signed downloads receive no API token. Empty, HTML and exports above 20 MiB fail. SQL is written before its completion manifest; a matching completed day's backup is idempotent. `health/latest.json` records generic success/failure without SQL or credentials. Private R2 lifecycle expires only `d1/` objects after 30 days; 30 maximum-size copies use at most 600 MiB plus metadata. Existing account R2 storage/operations also count toward its free allowance. Export can briefly block database writes; daily time is off peak.

D1 Time Travel is always enabled with **30-day retention on Paid**, without extra backup or restore charges ([Cloudflare documentation](https://developers.cloudflare.com/d1/reference/time-travel/)). Remote `wrangler d1 time-travel info DB --config wrangler.json` returned a current bookmark on 5 November. No Time Travel restore was performed against production.

## Monthly copy outside Cloudflare

The first monthly copy is verified in the private Desktop export folder above. Repeat monthly from the shared checkout:

```sh
node scripts/download-d1-backup.mjs
```

This fetches the latest successful health record, SQL and manifest, checks size/SHA256, and saves private files outside Git. This command is documented and tested. Codex automation `taksh-monthly-private-d1-copy` is ACTIVE: the first of each month at10:00IST. It checks checksum/size, owner-only permissions and a backup/health age within48hours; stale or failed copies are reported, not accepted as fresh. The first scheduled run has not occurred yet. The Mac must be awake with Wrangler signed in. The deleted hourly usage monitor is not involved or recreated.

## Independent restore check

```sh
node scripts/verify-backup-restore.mjs /absolute/private/backup.sql /absolute/private/manifest.json
```

Paths must be in the owner's Desktop export folder. The script creates a new private database, imports, then compares all user-table contents/counts against the current production standby. On an actively changing production database, reconcile against the export-time snapshot rather than assuming a later live read is identical. Keep customer rows and SQL out of logs/Git. Never overwrite production as a restore test; a production recovery requires a reviewed recovery point and a fresh pre-restore backup.
