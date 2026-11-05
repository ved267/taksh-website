# Cloudflare owner-account migration implementation plan

**Goal:** Run the checked v60 app on the owner's Cloudflare Workers Paid+D1+R2, with GitHub source/control shared equally by Claude and Codex, within the approved budget and without changing the domain before staging approval.

**Authorisation:** Owner explicitly approved the$5/month Workers Paid base and personally adding the R2 card/subscription. No other add-ons. Previous stop gate is resolved by this approval; proceed without another planning question. The original folder remains frozen. Ordinary contributors use GitHub only.

**Architecture:** Preserve Vinext/Vite, public components, SQL migrations, native D1/R2 APIs and cache behavior. Replace Sites hooks with a plain Worker and Wrangler config. Build separate production and synthetic-preview resources before deployment; do not give writable previews production data. GitHub checks use local Miniflare and no provider secrets. Use Workers Builds for agent-neutral branch previews/main production. A separate scheduled backup Worker exports D1 into a private R2 backup prefix; no backup API token enters Git.

## Tasks

- [ ] Pin locked dependencies/install in shared checkout. Plain worker/wrangler/Vite build; remove active .openai, Sites sign-in/connector hooks and runtime dependencies. Preserve existing direct5MB support upload; no chunking. Build/tests and compare v60 CSS/images/client output.
- [ ] Define isolated staging/production binding configuration and explicit d1 migrations commands. Staging must fail closed without its own resources/secrets. No request-time schema changes.
- [ ] Add CI locked install/build/unit/request-flow/lint/performance-baseline check. Main comparison includes JS/CSS/page weight/Worker gzip; exercise gate failure. Preserve private repository and report GitHub403 protection limitation rather than bypassing or upgrading.
- [ ] Add daily export/backup Worker using scoped D1 export API polling and private R2; verify success/failure/restore behavior with synthetic data; choose documented bounded retention within R2 allowance. Never label deployment/schedule active without account evidence.
- [ ] Provide one consolidated dashboard setup checklist for owner's card/Workers Paid/R2/GitHub grant and secrets. Configure/verify$10 total-bill notifications when account access exists, accounting for native usage-only alert behavior. Add monthly usage table with explicit unavailable values until real metrics can be queried; preserve earlier70k/day and2000build-minute alerts.
- [ ] Inventory current DNS without changing it; preserve A/AAAA/CNAME/MX/TXT/CAA and nameservers, old target and rollback. Prepare future change only after target is known. DNS actions still await staging approval.
- [ ] With authenticated account+subscription, provision isolated resources, deploy synthetic staging, verify request/duplicate/owner/Sheet/photo/analytics/allURLs/mobile/desktop performance and preview parity. Real records stay out of previews.
- [ ] Fresh Sites export, private restore/reconcile, secrets and R2 object export; show staging for explicit owner go. Only after that go switch domain, verify live and retain Sites14days. No further edits in frozen builder.

## Review focus

Preview DB isolation; private photo/cache controls; no forced retries/duplicate counts; no UI/CSS/image changes; committed explicit migrations; provider/backup token least privilege; no secrets/private exports in Git; financial alerts do not imply a hard spending cap; missing account steps remain pending.
