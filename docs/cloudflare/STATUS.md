# Cloudflare migration — stopped at the Free CPU gate

Checked4 November2026. The user expressly required stopping if the application does not fit Free, with no upgrade unless separately approved. No own-account resources, deployment, paid plan, trial, payment details or domain change were made. Netlify/Turso work is stopped, not continued.

## Preserved and reconciled

- Previous migration work is already committed and pushed at `5a6296be8f175d9872e751d613840918d9b18cb3`, branch `migration/free-hosting`. No customer exports or secret files are tracked.
- Current branch `codex/cloudflare-free-migration` starts from the GitHub export baseline and applies the exact checked live v60 delta. All delta files compared byte-for-byte with live source commit `f07dfe675471c0befd519aabea1cf1d79e5aa392`. No Netlify upload chunking, Turso/Blob adapters or extra upload migrations are carried into this branch. Existing native D1/R2 support5MB handler/schema/migrations are preserved; no new standalone runtime is claimed.
- Original builder folder has a freeze README pointing to GitHub. Its later uncommitted changes, including historical internal-demand exclusion work, were copied to the owner's private backup first. They are not live v60, not silently dropped, not approved for Git or merged. Do not resume edits/builds in that folder.
- One rules file is AGENTS.md; CLAUDE.md points only there. Branch names/PR notes and intended equal checks/previews are documented. Main remains the baseline; Sites remains the live site until an approved cutover.

## Measurement result

Wrangler4.151.0 `deploy --dry-run` against the existing original-builder artifact reported:

- Total upload1421.63KiB, **gzip405.90KiB** (about0.396MiB): below the user's3MiB threshold.
- No upload/deployment occurred. This is the existing local Vinext artifact, not a rebuilt standalone target. Exact artifact provenance cannot be certified because the builder has later uncommitted changes. The current live-source CPU measurements below are the decisive failure.
- Cloudflare's current limits page lists64MiB Worker size, differing from the older3MiB figure. We honoured the stricter3MiB requirement supplied by the user. Size passes either way.

Read-only Cloudflare invocation logs for current live v60 returned100 events from the latest120minutes. Public-route aggregates, with no IPs, contacts, headers, cookies or raw events:

|Route|Samples|Min CPU ms|Median CPU ms|Max CPU ms|Samples above10ms|
|---|---:|---:|---:|---:|---:|
|POST /api/integrations/customer-sheet|48|3|14|57|34|
|GET /help/contact|1|92|92|92|1|
|GET /sets/gully-cricket|7|8|28|139|6|
|GET /sets/map-of-india|9|15|90|246|9|
|GET /|12|4|95|231|11|
|GET /sets/nonsense|5|15|25|37|5|
|GET /sets/yellow-taxi|5|16|43|121|5|
|GET /sets/ram-mandir|5|14|26|67|5|
|GET /sets/chandrayaan-3|5|21|31|119|5|
|GET /sets|1|74|74|74|1|

These are real CPU timings reported by Cloudflare, not wall time, browser load time or a local CPU estimate. The sample is mixed traffic/cache state, not a controlled benchmark. It includes multiple routes exceeding10ms. It does not prove a future stripped standalone build will have identical CPU, but it does not support the requested drop-in Free qualification. No write traffic was generated to obtain these observations. Availability/checkout writes, owner reports and5MB uploads were not separately CPU-tested; those remain unmeasured, not presumed passing.

Cloudflare documents Workers Free at10ms/request. Workers Paid starts at**$5/month**, with included usage and possible additional usage charges; this is not a fixed all-in guarantee. No upgrade is approved or performed. Keep the gate stopped. Any CPU reduction/static-rendering work would be a separate implementation choice to authorise and remeasure, beyond simply replacing Sites wiring.

## Other verified constraints

- Workers Builds Free includes3000build minutes/month, one concurrent build and20minute timeout. Deploys do not have a per-deploy fee, but unlimited updates cannot be guaranteed within a finite build allowance. Requested2000minute warning is sensible but not yet active.
- R2 setup requires adding a billing subscription through checkout; it is metered beyond its free allowance. No owner account's ability to enable R2 without a card/billing commitment was verified. The strict no-card/no-charge condition must be honoured; do not enable a billable subscription as a workaround.
- GitHub's main-protection read returned403: “Upgrade to GitHub Pro or make this repository public to enable this feature.” The private repository remains private. Main protection is not enforced; an agent rule is not equivalent. No account upgrade or visibility change was made.

## Verified now

71 v60 unit tests passed. Source-delta comparison passed. Wrangler dry-run succeeded. Real current CPU logs retrieved and reduced to public aggregates. Previous migration branch push verified. No new staging, hosted test, own-account build, mobile/desktop target performance, CI/protection, usage alert or preview URL was verified.

## Left pending by the stop gate

Plain owner-account Wrangler config/Worker and removal of Sites-only wrappers; isolated D1/R2 provisioning; explicit committed migration commands; GitHub Actions/checks and main protection; Workers Builds main/branch/PR integration; usage alerts; synthetic staging; fresh Sites export/count/content reconciliation and orphan R2 export; owner/Sheet secrets; every URL, request retry/duplicate/Sheet/support/analytics/security/mobile/desktop performance check; owner's staging go; domain cutover and14day rollback retention.

Cloudflare supports preview builds for non-production branches and GitHub PR comments. The eventual rule must treat `claude/*` and `codex/*` identically, with isolated preview resources and no production secrets. **It is not configured, so an actual Claude PR preview URL cannot yet be confirmed.**

Read [OWNER-STEPS.md](OWNER-STEPS.md) for the single consolidated list of actions that need the owner. Do not ask for secrets in chat.

## Sources checked

- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- https://developers.cloudflare.com/r2/get-started/
- https://developers.cloudflare.com/r2/pricing/
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
