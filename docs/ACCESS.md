# Taksh access register

Everything Claude can reach for Taksh, where it lives, and what is still missing. **Names and locations only. No token, password or key is ever written here, in chat, in Git or in a screenshot.** Last updated 7 November 2026, 13:30 IST. Update this page when any access is added, changed or removed (it is part of the Save step).

Status words: **Live** (used and working), **Set, unverified** (set up, not yet proved end to end), **Missing** (not available yet).

## 1. How Claude gets in

| Route | What it reaches | Status |
|---|---|---|
| GitHub (`gh` as ved267, REST API) | Code, branches, PRs, Actions jobs for `ved267/taksh-website`, `taksh-reels`, `taksh-hq` | Live |
| GitHub Actions jobs | Deploy, rollback, backup, migrations, usage, Google report. Claude triggers them with `gh api -X POST repos/ved267/taksh-website/actions/workflows/<file>/dispatches` | Live |
| Cloudflare connector | Read Workers, D1, R2 (listing and queries) | Live |
| Google Sheets / Drive / Gmail connectors | Customer requests Sheet, files, mail | Live |
| Microsoft Clarity connector | Sessions, heatmaps, recordings, dashboard queries | Live; no data until the snippet ships (PR #11) |
| Chrome extension | Analytics, Search Console, Meta dashboards when a click is needed | Live, used sparingly |
| Devansh's Mac (device bridge) | `Namo Products/` folders, System, exports | Live |

Limits that apply every time: Claude cannot merge its own pull requests and cannot change DNS or domains (the safety classifier blocks both, so Devansh clicks). `gh pr create` is blocked, so PRs are opened with `gh api repos/ved267/taksh-website/pulls`. The GitHub Actions secrets and variables lists cannot be read from the cloud workspace; check names in GitHub settings.

## 2. Repositories

| Repo | Visibility | Use |
|---|---|---|
| `ved267/taksh-website` | Private | The live site. Source of truth. Rules in `AGENTS.md`; guides `docs/OPERATIONS.md`, `docs/ARCHITECTURE.md`; this register is mirrored at `docs/ACCESS.md` |
| `ved267/taksh-reels` | Private | Reel code |
| `ved267/taksh-hq` | **Private since 7 Nov (Devansh)** | Weekly text mirror of Taksh OS (no media, no customer data) |

Branch rules: Claude uses `claude/<task>`, Codex uses `codex/<task>`, one task per branch, never force push, never touch the other agent's branch. Branch protection is unavailable on the free GitHub plan, so follow the PR convention: open a PR, pass Validate, then Devansh merges. Production deploys only from `main` after Validate, and only while `TAKSH_PRODUCTION_READY=true`.

Open pull requests (7 Nov): **#11** tracking stage 1 (Pixel, Clarity, pay-tap event, wording; awaiting approval), **#10** docs export path, **#2** demand reporting (conflicts with main; Claude to rebase). Merged: #8 Google report job, #9 Codex close-out.

## 3. Secrets and tokens (names only)

| Name | Held in | Purpose | Status |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` ("Taksh GitHub deploy") | GitHub Actions secret | The one deployment and backup credential | Live |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | GitHub Actions secret | Read-only GA4 and Search Console reports | Live (report ran 7 Nov) |
| `META_CAPI_TOKEN` | Cloudflare Worker secret on `taksh-store` (and `taksh-staging` if added) | Server-side Meta events | Set by Devansh 7 Nov; **unverified** until stage 2 sends its first event |
| `META_SYSTEM_TOKEN` | would be a GitHub Actions secret | Meta ads and insights through GitHub jobs | **Missing**: needs a Facebook-backed login (section 6) |
| Clarity API token | not needed | Clarity connector already reads data | n/a |

GitHub variables (not secret): `GA_PROPERTY_ID`, `GSC_SITE`, `TAKSH_PRODUCTION_READY`, `TAKSH_CUTOVER_AT` and related release switches. `META_PIXEL_ID` is not a variable: the Pixel ID is public and lives in `lib/shop.ts`.

Rules: app secrets live only in Cloudflare; deployment secrets only in GitHub; never ask for or paste a secret in chat; revoke anything that is exposed. Details in `AGENTS.md`.

## 4. Cloudflare (owner account)

- Domain `taksh.store`: DNS zone on Cloudflare (nameservers keira.ns.cloudflare.com and neil.ns.cloudflare.com); registrar Namecheap; Universal SSL; canonical www redirect.
- Workers: `taksh-store` (production), `taksh-staging` (at taksh-staging.taksh-ved267.workers.dev), `taksh-daily-backup`. Per-PR previews get their own D1 and R2 (`taksh-pr-<branch>-<hash>`) with synthetic data only.
- D1: `taksh-production`, `taksh-preview`. R2: `taksh-production-support`, `taksh-preview-support`, `taksh-private-backups`.
- Backups: daily D1 export 03:30 IST to private R2 with 30-day retention; D1 Time Travel as the second layer.
- Cost: Workers Paid $5 a month is the only paid service. Everything else must stay free unless Devansh says yes. $3 usage email alert.

## 5. Google

- GA4 property 558410788, web stream 16104950538, measurement ID `G-NHQFYHTNLP`. Consent default: analytics on, advertising off, Google signals off.
- Search Console: domain property `sc-domain:taksh.store`, verified by DNS.
- Google Cloud project `taksh-513913`. A read-only service account (robot) has Editor on the GA4 property and a user in Search Console. Its key is the GitHub secret above.
- Reports: run the `Google Analytics report` workflow; it prints a summary. Known fixes owed: filter bot traffic; the engagement column is a total, not an average.
- Customer requests Sheet (Google Sheets connector). Never put customer data in Git or chat.

## 6. Meta

- Business portfolio: taksh.build, business ID `1807573087095813`. Ad account `1755364592403973`. Instagram `taksh.build`.
- Dataset / Pixel: "Taksh website", ID `29283360584637655` (public). Client Pixel ships with PR #11; server events are stage 2.
- Devansh logs in with **Instagram only**. Meta's developer app, system user, one-click Conversions API setup and every Meta ads connector need a **Facebook-backed login**, so these failed on 7 Nov. Fix: Instagram app → Accounts Center → add a Facebook account, then create the developer app (phone check failed once; retry or use another number).
- After that: create app "Taksh Claude" → system user `taksh-claude` → assign ad account, dataset, Page, Instagram → token (never expires) → save as `META_SYSTEM_TOKEN` in GitHub. Until then Claude cannot create or read ads.
- Ads rule: Claude builds campaigns **paused**; nothing spends until Devansh says go with a budget.
- Events Manager settings to switch off: Automatic advanced matching, Automatic events.
- Connector options if wanted later (not installed; check pricing first): Adspirer Social Ads (Meta and TikTok, launches paused), Windsor.ai (Meta, GA4, Search Console, Instagram).

## 7. Clarity and analytics tools

- Clarity project `z9fvuelbga`. Microsoft Clarity connector works in chat (tools: query dashboard, list session recordings, documentation). Install is in code, not manual: loaded after the page is idle, typed inputs masked (`data-clarity-mask`).
- `analytics-skills` plugin and the Cloudflare plugin (web-perf, workers-best-practices, wrangler, nextjs-on-cloudflare) are installed. Skill `taksh-website` holds the site conventions.

## 8. Connectors, plugins and skills Claude uses for Taksh

Connected: Cloudflare Developer Platform, Google Sheets, Google Drive, Gmail, Microsoft Clarity, Buzzfy, Metricool, Runway, ElevenLabs, Canva, Figma, Firecrawl, Claude Docs. Not needed or off: Shopify (signed out, site is not on Shopify), Brick Builder (off in chats). Full list and by-job guide: `System/TOOLS.md`.

## 9. On Devansh's Mac

- `Namo Products/` is the workspace; System folder is the brain.
- Private website exports: `/Users/devanshsmac/Desktop/Namo Products/Taksh Website Export/` (final Sites database at `2026-11-07/private-data/sites-final.json`). Never copy into Git.
- Old 2 GB checkout `Namo Products/Taksh Website`: awaiting "delete it". Empty Desktop folders `Taksh Website` and `Taksh Website Export`: to bin.
- Old Sites project (`appgprj_6abff32e49a88191a4f182d4a3f59b98`, owner-only cold backup): delete on or after 20 Nov after a last export. Claude reminds.

## 10. Still missing

1. Facebook-backed Meta login, then developer app, system user and `META_SYSTEM_TOKEN` (ads and insights).
2. Proof that `META_CAPI_TOKEN` works (first stage 2 event).
3. Clarity data (fills after PR #11 is live).
4. Razorpay connector and test keys, when paid reservations start.
5. Legal name, address and GSTIN for the Privacy and Returns pages.

## Release note, 9 Nov 2026

Merging several PRs within seconds leaves the in-between main commits without a performance baseline, so the push Validate fails and production skips. Merge one PR at a time and wait for its main Validate. If it happens anyway: run Validate manually on main, then merge any docs-only PR so the next push compares against that refreshed baseline.
