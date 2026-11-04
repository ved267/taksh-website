# Unpaid Vercel preparation implementation plan

**Goal:** Make the exported Taksh application run and build with standard Next.js, with locally testable persistence and no new hosting charge.

**Architecture:** Preserve the public React components and API contracts. Replace the Cloudflare binding adapter with a SQLite/libSQL adapter using the existing SQL and schema, plus private local-file storage and an optional private Vercel Blob adapter. Production configuration fails closed if durable services are absent. Local test data stays isolated from the live Sites database and the owner's backup.

**Authorisation:** User chose “Keep setup unpaid for now” and repeatedly instructed “go.” Work is on migration/vercel-unpaid in the separate exported repository. No Pro upgrade, subscription, hosted database provisioning, Vercel deployment, DNS change, messages or live Sites edits.

## Constraints

- Existing UI/UX, product facts, images and request journey are preserved.
- No client-side tracking libraries or new public fields.
- No local SQLite/filesystem fallback in a hosted Vercel function.
- Never migrate owner data implicitly or email test records.
- Original builder has unfinished tracking work; leave it untouched and reconcile its final patch later.

## Tasks and acceptance

1. Add focused adapter tests first: bound SQL, empty result, unique/optimistic concurrency, atomic rollback, file privacy/path traversal, hosted missing-service failures. Confirm expected failures, then implement adapters.
2. Change db/index.ts to expose the existing prepare/bind/first/all/run shape and environment access using the portable adapters. Add explicit local schema-init command. Keep schema changes out of request handlers.
3. Use Next dev/build/start commands, remove active Sites build/runtime requirements, preserve original legacy configuration in docs, configure static asset cache headers and exclude unused build examples from runtime type checking. Preserve image preprocessing and performance checks.
4. Add configured hosted libSQL and private Blob paths without creating accounts/resources. Document required environment variables and missing masked secrets. Keep optional provider code server-only.
5. Install dependencies and run existing unit suite plus adapter checks. Build production, start a local production server on a dedicated port, run the existing availability-request integration with synthetic contact data, and check owner access protection, retries and asset responses.
6. Record build/check results, remaining performance/visual limits and reconciliation needs. Push only the migration branch for Claude/Codex review; keep main as the export baseline. No live cutover.

## Review focus

Concurrent submissions must retain optimistic locking; private upload paths must not escape local storage or become public; hosted missing credentials must not silently create ephemeral data; cached responses must not expose owner/customer data; adapter migration must not modify original UI/component files. Verify these directly before handoff.

## Outcome — 4 November 2026

Tasks1–6 completed for local unpaid preparation. Full locked install/build,67 unit tests, two production-preview integration flows, HTTP protection/cache checks and focused lint passed (two warnings). Independent review finding on the old installer was fixed and rechecked. See `docs/verification/2026-11-04-local-migration.md` for evidence and explicit hosted/visual/performance limits. No live cutover or paid service was attempted.
