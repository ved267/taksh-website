# Free hosting migration implementation plan

**Goal:** Move the current Taksh website and its records to owner-controlled commercial-compatible Free services, with no subscription, card entry or billable overage enabled.

**Architecture:** Keep the checked Next.js runtime and incoming Sites version60 source. Use Turso Free for durable SQLite-compatible data and Netlify Free for hosting/private Blobs. Stay within hard free limits; service may pause when exhausted. No promise of unlimited free hosting. Keep Sites live until the target passes staging and data reconciliation.

**Authorisation:** User explicitly asked to complete the entire shift and required it to be free. Continue native implementation and review without repeating a planning approval. Account sign-in/new account terms and unavailable masked secrets still require the owner's action. Do not add paid services, trials or payment details.

## Tasks

- [ ] Reconcile exact checked v60 source patch; preserve portable origin/database adapters; rerun demand and request tests on an isolated local database. Changes to stock wording come from the already approved live v60 release, not migration design.
- [ ] Add fail-closed Netlify hosting detection, trusted address header and a lazy server-only private Blobs adapter. Pin Next adapter/CLI as needed; add netlify.toml and document Free account constraints. Test hosted missing-config failures first.
- [ ] Preserve5MB support uploads: large photos transfer as bounded chunks only on the support form. Validate metadata/signature/total size, random expiring upload tokens, one-use finalisation, private parts and bounded cleanup. Small photos keep their existing single request. No new fields, copy or third-party client library. Unit tests cover partial, oversize, expired/reused tokens and byte-exact recombination; local integration covers persistence and access control.
- [ ] Prepare additive schema/data migration with explicit target checks and count/content verification. Capture current live source/data before cutover; preserve token hashes, stored prices and test exclusions. Do not restore sessions/rate limits as business records. Secrets and exports stay outside Git.
- [ ] Verify full locked install/build, unit and request flows, Sheet protection/owner access and public/private responses. Build a Netlify staging artifact. Review before deployment.
- [ ] Once owner Free accounts are accessible, verify Free/no recharge, deploy staging with synthetic data, test hosted uploads/requests/secure cookies and asset performance, migrate/reconcile live data, connect taksh.store with rollback, and verify live owner/Sheet flow. Do not claim complete if account, secret, storage or DNS steps remain unresolved.

## Review focus

Missing hosted secrets must never fall back to ephemeral disk; retries cannot duplicate demand; uploads cannot escape private keys, exceed5MB or survive unbounded without cleanup; preview traffic/data cannot corrupt production; source must match v60, including Sheet retry state and approved no-payment wording.

## Progress

v60 reconciled; private Netlify/Turso adapters, host identity/preview isolation, bounded5MB photo flow/cleanup, and reviewed-target restore implemented.91 unit tests, four isolated production-preview integration flows, full Next build and Netlify offline packaging passed. Current customer backup restore checked privately. Independent review identified/fixed two bugs but final reviewer sign-off hit account usage limit. Accounts/sign-in, real staging, credentials/storage reconciliation and live cutover remain incomplete. See docs/verification/2026-11-04-free-hosting.md.
