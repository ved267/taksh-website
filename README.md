# Taksh website — owner-controlled shared source

Owner: **ved267**. Prepared 3 November 2026 for Codex and Claude collaboration.

This contains the Sites version59 tracked application source and available public assets. The original framework README is preserved in docs/SITES-STARTER-README.md. GitHub stores the editable source; hosting can be moved independently of which coding agent edits it.

## Current state

- Initial baseline source: d090acfe3163346d2f2a63f24ef119aef6b147fe (Sites version59).
- The application currently uses Vinext/React, Cloudflare D1 for records and R2 for uploads. It has not yet been converted to Vercel's deployment runtime.
- The real customer database and private configuration inventory are deliberately excluded from this repository. The owner has a separate local export.
- Public UI/UX is unchanged by this export. There are no deployments or domain changes implied by a GitHub push.

## Local locations

- Shared editable copy: `/Users/devanshsmac/Desktop/Taksh Website`.
- Owner's export/backup: `/Users/devanshsmac/Desktop/Taksh Website Export/2026-11-03/`.
- Original Sites builder checkout: `/Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh`.

Use separate branches or worktrees for Claude and Codex. Reconcile the original builder's unfinished measurement changes before selecting the final migration source. Keep the main branch deployable only after the Vercel migration checks pass; until then treat it as an export baseline.

Read MIGRATION-STATUS.md for the pending work and the current platform limitations. Read AGENTS.md before changes. Dependency packages, build output, local credentials, historical screenshots and temporary output folders are not required source; the dependency lockfile, source, public assets, migrations and original Git history backup are preserved.
