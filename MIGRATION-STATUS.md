# Migration status — 3 November 2026

## Verified

- GitHub CLI authenticated as ved267 with repository access.
- Vercel CLI59.17.0 authenticated as ved267, team ved267s-projects (owner membership confirmed).
- Vercel guidance/plugin is installed globally in Codex; no duplicate skills package installed.
- Shared official Vercel MCP endpoint configured in Codex user settings and OAuth login completed. Current already-running chat has not loaded the new server tools; the get-started guide's direct search_vercel_documentation/list_teams MCP calls remain unverified. Authenticated team listing via Vercel CLI succeeded.
- Claude Code user configuration now contains the same shared HTTP endpoint, preserving unrelated settings. The Vercel helper could not add it because Claude Code CLI is not on PATH; merged the documented entry into .claude.json as a fallback. Claude must perform its own OAuth in /mcp. Claude.ai/Desktop remote connectors require manual setup in Settings → Connectors; their connection is not verified.
- Exact current live Sites version59 source commit confirmed; original Git history bundle verified.
- Live D1 export read all six returned tables and all pages without truncation. Captured13 order/request records and10 rate-limit records; other four tables empty. Of13 order records,6 are stored as placed,4cart,3draft. These internal statuses do not prove paid orders or real demand. No payment record was verified.
- All890 available source/public files hashed in the owner backup. Public source images and generated image variants are included there. Source and asset scan found no obvious credential patterns; this is not a formal secret-history audit.

## Outstanding before leaving Sites

1. Finish/reconcile original builder measurement changes; current export is version59 plus a separately saved working-tree snapshot, not a promise of all future changes.
2. Decide and implement the Vercel runtime adaptation and portable database/storage providers. The code currently imports cloudflare:workers; copying it to Vercel alone will not migrate the backend. Preserve existing UI and APIs while replacing platform adapters and build configuration.
3. Back up again immediately before cutover and migrate/reconcile database records, uploads and current writes. Exported JSON includes the table schema/columns and rows; original SQL migrations are in source. Owner-only SQLite and SQL backups were restored locally, passed integrity checks and round-tripped with matching counts for all six tables. Do not restore expired admin sessions or rate limits as persistent business data.
4. Sites masks ADMIN_PASSWORD_HASH and CUSTOMER_SHEET_SYNC_KEY; their values were not retrievable. The inventory records the names and source revision. Recreate an owner-approved admin credential securely and rotate/reconnect Sheet sync during migration. Do not copy an unrelated local test password into production. Never paste secrets into chat or Git.
5. No support records reference uploaded photos, but no R2 bucket-list/export capability was available. Bucket emptiness and unreferenced/orphaned objects have not been verified. Check/export via an owner-accessible route before declaring all storage exported.
6. Current Vercel team is Hobby. Its terms restrict it to non-commercial personal use. A Taksh business deployment needs an appropriate commercial plan. Pro currently lists a $20/month base platform fee, including one deploying seat and $20 usage credit; extra usage/provider costs can apply. No purchase, upgrade, trial or integration subscription has been made.
7. Create/link a Taksh Vercel project only as part of the actual migration/deployment step; global agent setup intentionally creates no project. No domain/DNS changes performed.
8. Verify owner sign-in, requests, anti-duplicates, allowed analytics, Sheet delivery, support uploads, assets, performance and all existing URLs on a staging environment before switching taksh.store. Keep the original live deployment as rollback and do not allow tests to write to the live customer database.

## Sources

- Requested setup playbook: https://vercel.com/get-started.md (fetched directly after web reader rejected text/markdown).
- Official shared endpoint/setup: https://vercel.com/docs/agent-resources/vercel-mcp
- Hobby restrictions: https://vercel.com/docs/plans/hobby
- Pro pricing: https://vercel.com/docs/plans/pro-plan

This is not a completed hosting migration. Source ownership and agent setup are separate from a verified production deployment and complete runtime-data restore.
