# Taksh — shared Claude and Codex rules

This is the single rules file for both agents. CLAUDE.md only points here. Repository: https://github.com/ved267/taksh-website. Shared checkout: `/Users/devanshsmac/Desktop/Taksh Website`.

## Current hosting decision and gate

Target is the owner’s Cloudflare Workers Paid + D1 + R2 account. The owner explicitly approved Workers Paid’s$5/month base charge and a card for R2 while staying within its free allowance. The owner personally added the card/subscribed, and Workers Paid/R2 were verified; agents must never enter payment details. No other paid add-ons, plans or trials are authorised. Netlify/Turso work remains stopped. Do not make the private GitHub repository public.

The earlier Free10ms CPU gate failed and the owner explicitly resolved it by approving Paid. Continue migration from step3, preserving the existing UI and v60 source. Keep the compressed-size/performance baseline and CPU measurements in the status record. Set/verify billing notifications for a total bill above$10; distinguish actual usage alerts from forecasts, fixed fees and tax. Report monthly requests, CPU, D1, R2 and build minutes with a source/as-of date; unknown values stay unknown. No Cloudflare account subscription or alert is assumed active merely from this approval. Daily D1 backups and a DNS inventory/preservation plan are now explicitly requested; document and verify them. Domain cutover still requires staging approval.

GitHub is the source of truth. Original builder folder `/Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh` is frozen with a README. No further edits/builds/publishing there. Sites version60 remains live until the owner approves a verified staging cutover. After cutover, retain Sites unchanged for14days as rollback.

## Equal workflow

- Claude branches: `claude/<task>`. Codex branches: `codex/<task>`. One task per branch; never two agents on one branch. Both use the same GitHub permissions and branch-based preview/check path; neither needs Cloudflare credentials for normal contributions.
- Main is intended production after cutover. Every other branch/PR is intended to get an isolated Cloudflare preview, regardless of author. This is not yet configured or verified; do not claim preview parity until a PR from each path proves it.
- Open a pull request. Notes state what changed, why and what was tested. For any visual change include desktop and mobile screenshots. Do not change public UI/UX as part of the hosting migration.
- Required intended checks: locked install, build, unit tests, request-flow tests, lint and comparison against main for JS/CSS, key-page weight and compressed Worker size. A regression must fail. These checks and enforced main protection are pending account setup and verification. GitHub returned403 because private-repo branch protection requires a different plan; agent conventions are not a substitute for enforcement. No force pushes; no direct production push or bypass of required checks.

## Data, secrets and migrations

Never commit .env files, credentials, customer/contact identifiers or hashes, exports, support photos or private backup archives. Never screenshot a browser window after it has revealed a credential: native text state can advance while the rendered image retains an old secret modal. Use non-secret API status/secret-name verification for credential setup; if a credential appears in any capture, treat it as exposed, disable/revoke it and never reuse it. Do not capture it again to investigate. App/backup secrets belong only in the owner’s Cloudflare settings; the least-privilege deployment token is the explicit exception and belongs only in this repository’s GitHub Actions secrets; .env.example lists names only. Use ignored local fixtures for synthetic tests. Do not put real customer records into preview storage or share production D1/R2 with writable previews.

Preserve v60 schema/migrations, stored prices/currency, timestamps, token hashes, test exclusions, consent and Sheet retry state. Database changes only through committed migrations applied by an explicit documented `wrangler d1 migrations apply` command, never during a request. Do not restore old admin sessions/rate limits as business records. Preserve the existing Sheet endpoint/key continuity and manual notes; never request raw secrets in chat.

Current published source: f07dfe675471c0befd519aabea1cf1d79e5aa392. Later original-folder work was saved privately at the freeze; it is not part of v60 and needs review. No dummy payment, revenue claim or paid-order analytics event. Availability requests are not paid sales.

## Verification and cutover

Report actual tool errors, repair routine issues safely and mark failed capabilities unresolved. A fallback does not complete a failed capability. Do not claim a benchmark, hosted check, deployment, protection rule, usage alert or complete export without evidence.

Before domain switch: synthetic staging; fresh Sites D1 export/restore and count/content reconciliation; storage/secret reconciliation; owner sign-in; request/duplicate checks; Sheet delivery; direct5MB support upload/private download; analytics; every existing URL; desktop/mobile performance against live. Show staging and get the owner’s go before switching taksh.store.

The owner removed the Free-plan 70000/day and2000 build-minute thresholds. Do not recreate a Mac usage monitor or schedule. The hourly Codex automation was deleted on4 November2026. Use Cloudflare billing emails: the saved$3 usage warning plus the requested$10 total-bill warning. Distinguish usage from fixed fees/tax and actual spend from forecasts; the total-bill notification remains unverified until account evidence proves it.

## Latest brief —5November2026

Production deployment ONLY through GitHub Actions after Validate succeeds on main. Disable automatic Workers Builds production or any unchecked main path. All claude/* and codex/* branches get isolated previews, URL comments on their PRs, with the same GitHub-only contribution path. Full CI runs only PRs/main and cancels superseded jobs. No paid GitHub upgrade. Track free Actions minutes.

The owner requires two distinct go/no-go decisions: staging and nameserver switch. The latest complete written brief supersedes earlier broad “all approved” wording. Keep Sites live/untouched until these decisions and verify all dependencies first. Full Namecheap zone, redirects and forwarding rules must be captured privately; replace Namecheap forwarding with free Cloudflare Email Routing before nameserver switch. Preserve verification records. Lower TTLs a day ahead.

Images/Stream: investigate creation date/actor/plan/cost/use. If unused by Taksh and chargeable, cancellation is expressly authorised; if used, report purpose/cost before changes. No other paid add-on.

Backups require first remote export and separate test restore with matching counts/content before daily schedule. Include Paid D1 Time Travel30days and monthly owner-only copy outside Cloudflare. Do not mark an absent Sites R2 list/export as complete. After switch, reconcile late Sites writes idempotently; report errors/CPU/requests/Sheet for72hours, keep Sites14days, ask before retirement with final export.
