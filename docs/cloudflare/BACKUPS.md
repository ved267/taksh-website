# Daily D1 backups

The backup code is deployed as `taksh-daily-backup`, with **no HTTP URL and no active schedule yet**. `taksh-private-backups` is a private Standard R2 bucket. A verified lifecycle rule expires only `d1/` objects after30days. No public bucket access was enabled.

`workers/backup.mjs` exports production D1 using Cloudflare's polling export API, downloads its short-lived signed URL without forwarding the API credential, rejects empty/HTML/oversized data, writes SQL with a SHA256 checksum, then writes the completion manifest. A matching complete backup skips duplicate executions. Health is recorded at `health/latest.json`. Maximum export size20MiB;30copies are at most600MiB before small metadata. Existing account R2 usage also counts toward the free allowance. SQL export can briefly block writes; the intended time is03:30IST (22:00UTC), off peak.

## Owner credential setup

Use Cloudflare's API token screen to create a dedicated token with **Account / D1 / Read**, restricted to this account. The API does not provide a per-database resource selector; this permission can export D1 databases in the selected account. Never reuse the expiring Wrangler OAuth credential for a server cron, and never paste any token into chat/Git.

Copy it directly into Workers & Pages → taksh-daily-backup → Settings → Variables and Secrets → Add → Secret → `D1_BACKUP_TOKEN`. The account/database IDs and R2 binding are non-secret committed configuration. The storefront and GitHub Actions do not receive this token. Confirm only that the setting was saved; do not send its value.

After credential setup, explicitly deploy the committed `wrangler.backup.json` to enable the daily schedule:

```
npx wrangler deploy --config wrangler.backup.json
```

Do not mark backups operational until the first real SQL object, manifest/checksum and restore check have passed. Unit tests currently exercise actual local R2, export polling, auth isolation, failure/size handling, idempotency and restoration into SQLite with synthetic data. They do not prove the owner's remote token or cron ran.

## Restore verification

Download a selected SQL/manifest privately with Wrangler R2 commands, verify SHA256, and restore into a **new disposable D1 database**, never over production as a test. Compare schema and per-table counts, timestamps, totals and a content digest. Do not put SQL/customer data into Git. A production restore requires a separate reviewed recovery action and current pre-restore backup.

Migration commands remain explicit:

```
npx wrangler d1 migrations apply DB --remote --config wrangler.json
```

The preview deploy command explicitly applies the same committed migrations to that branch's dedicated synthetic database before deploying. Schema creation never happens during a website request.
