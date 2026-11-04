# Taksh — shared Claude and Codex rules

This is the single rules file for both agents. CLAUDE.md only points here. Repository: https://github.com/ved267/taksh-website. Shared checkout: `/Users/devanshsmac/Desktop/Taksh Website`.

## Current hosting decision and gate

Target is the owner’s Cloudflare Workers + D1 + R2 account, Free only. Stop Netlify/Turso work; those migration branches are preserved for history/useful tests. No plans, trials, card details, upgrades or billable overages are authorised. Do not make the private GitHub repository public.

The user requires compressed Worker size below3MiB and server CPU below10ms. Current live v60 invocation logs exceed10ms; migration is stopped at that gate. Read docs/cloudflare/STATUS.md and feasibility-2026-11-04.json. Do not continue provisioning, deploying, changing DNS or claiming Free readiness until the owner resolves this gate. Workers Paid starts at$5/month; that fact is not approval to buy it.

GitHub is the source of truth. Original builder folder `/Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh` is frozen with a README. No further edits/builds/publishing there. Sites version60 remains live until the owner approves a verified staging cutover. After cutover, retain Sites unchanged for14days as rollback.

## Equal workflow

- Claude branches: `claude/<task>`. Codex branches: `codex/<task>`. One task per branch; never two agents on one branch. Both use the same GitHub permissions and branch-based preview/check path; neither needs Cloudflare credentials for normal contributions.
- Main is intended production after cutover. Every other branch/PR is intended to get an isolated Cloudflare preview, regardless of author. This is not yet configured or verified; do not claim preview parity until a PR from each path proves it.
- Open a pull request. Notes state what changed, why and what was tested. For any visual change include desktop and mobile screenshots. Do not change public UI/UX as part of the hosting migration.
- Required intended checks: locked install, build, unit tests, request-flow tests, lint and comparison against main for JS/CSS, key-page weight and compressed Worker size. A regression must fail. These checks and enforced main protection are pending the feasibility gate. GitHub returned403 because private-repo branch protection requires a different plan; agent conventions are not a substitute for enforcement. No force pushes; no direct production push or bypass of required checks.

## Data, secrets and migrations

Never commit .env files, credentials, customer/contact identifiers or hashes, exports, support photos or private backup archives. Secrets belong only in the owner’s Cloudflare settings; .env.example lists names only. Use ignored local fixtures for synthetic tests. Do not put real customer records into preview storage or share production D1/R2 with writable previews.

Preserve v60 schema/migrations, stored prices/currency, timestamps, token hashes, test exclusions, consent and Sheet retry state. Database changes only through committed migrations applied by an explicit documented `wrangler d1 migrations apply` command, never during a request. Do not restore old admin sessions/rate limits as business records. Preserve the existing Sheet endpoint/key continuity and manual notes; never request raw secrets in chat.

Current published source: f07dfe675471c0befd519aabea1cf1d79e5aa392. Later original-folder work was saved privately at the freeze; it is not part of v60 and needs review. No dummy payment, revenue claim or paid-order analytics event. Availability requests are not paid sales.

## Verification and cutover

Report actual tool errors, repair routine issues safely and mark failed capabilities unresolved. A fallback does not complete a failed capability. Do not claim a benchmark, hosted check, deployment, protection rule, usage alert or complete export without evidence.

Before domain switch: synthetic staging; fresh Sites D1 export/restore and count/content reconciliation; storage/secret reconciliation; owner sign-in; request/duplicate checks; Sheet delivery; direct5MB support upload/private download; analytics; every existing URL; desktop/mobile performance against live. Show staging and get the owner’s go before switching taksh.store.

Configure usage alerts for >70000 daily requests and >2000 build minutes/month only after authenticated account metrics are available. Alerts are not active yet. Keep notifications quiet below thresholds and avoid repeated alerts for unchanged state.
