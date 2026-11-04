# Taksh website — owner-controlled shared source

Owner: **ved267**. Shared by Codex and Claude. No hosting purchase or live cutover is authorised.

## Current branch

`migration/vercel-unpaid` adapts the exported Sites version59 application to standard Next.js. The public components, product CSS, images and request journey are preserved. Local SQLite and private file storage allow testing without connecting to real customer data. Optional hosted libSQL and private Blob adapters are present but unprovisioned and unverified.

`main` remains the original export baseline: Sites source commit `d090acfe3163346d2f2a63f24ef119aef6b147fe`, plus available public assets. The original framework README is in `docs/SITES-STARTER-README.md`; historical platform code is in `docs/legacy-sites/`.

## Run locally

Use Node 22.13 or newer. From this checkout:

```sh
npm run install:ci
npm run db:init
npm run dev
```

For a production preview use `npm run build`, then `npm start -- --port 5274`. Development and preview bind to this computer only. Local records and uploads live in ignored `.local/`. Schema changes run explicitly through `db:init`, never inside a request. Empty email credentials prevent test notifications; never use live email credentials for synthetic checks.

Optional settings are listed in `.env.example`. Never commit credentials or customer data. For local scripts, export required settings in the shell; Next loads its own local environment files.

## Working with Claude and Codex

Both agents can edit this Git repository. Use a separate branch per task, review changes, and merge finished work deliberately. Avoid simultaneous edits to the same files. Read `AGENTS.md` and `MIGRATION-STATUS.md` first.

The original builder has unfinished measurement changes in a separate checkout. Reconcile its final patch before selecting the migration source. A source push does not deploy the website or switch its domain.

- Shared checkout: `/Users/devanshsmac/Desktop/Taksh Website`.
- Owner-only source/data backup: `/Users/devanshsmac/Desktop/Taksh Website Export/2026-11-03/`.
- Original builder: `/Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh`.

## Before hosting

Read `MIGRATION-STATUS.md` and `docs/verification/2026-11-04-local-migration.md`. Hosted database/storage, migration reconciliation, owner credentials, Sheet delivery, support-upload limits and staging checks remain open. The current Hobby account is restricted to personal non-commercial use; the user chose to keep setup unpaid. No Vercel deployment, project provisioning, paid integration or DNS change has been made.
