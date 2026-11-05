# Taksh migration status

Updated5 November2026 (Asia/Kolkata). **Migration in progress; taksh.store still runs unchanged on Sites.** Workers Paid and R2 are active in the owner's Cloudflare account. The old Free CPU stop is resolved by explicit Paid approval. Only Workers Paid$5/month plus R2 inside its free allowance is authorised. No other paid products/trials.

## Saved source and current deployment

- GitHub source: https://github.com/ved267/taksh-website (private). Main reconciled to approved live Sites v60 through PR#1, merge `e036f7e`. Published Sites source `f07dfe675471c0befd519aabea1cf1d79e5aa392` was the reconciliation reference. Unpublished builder work was preserved privately; original builder folder is frozen.
- Active migration branch: `codex/cloudflare-migration`. Legacy Netlify/Turso work remains stopped on its old branches.
- Isolated synthetic preview: https://codex-cloudflare-free-migration-taksh-store.taksh-ved267.workers.dev . This is the previous branch's temporary URL; it will be replaced by the renamed branch/staging deployment. The URL does not contain production data. All five hosted request suites passed on this preview.
- Production D1/R2 provisioned; all five original schema migrations applied explicitly. Initial private Sites business snapshot imported into production D1:13orders,1reporting row,0enquiries/subscriptions/support; field-for-field reconciliation passed. No admin sessions/rate limits restored. Production domain/Worker app not switched. Final fresh export/delta reconciliation is still required at cutover.

## Verified

- Plain Cloudflare Worker/Vite/Vinext build; active Sites/ChatGPT/.openai hooks removed and legacy source archived.
-76unit tests passed. Typecheck and lint passed (3existing warnings). Fresh local D1/R2 request suites passed: selection/cart, email/mobile availability requests, no-contact validation, server prices, duplicate/retry prevention, owner login, confirmed-only demand/internal exclusion, Sheet failure/ack recovery, direct5MiB upload, private exact-byte photo download, logout revocation.
- Same five suites passed remotely on the isolated synthetic preview. A5MiB test upload took43seconds from this Mac; private download2.7seconds. This is network wall time, not CPU or a phone benchmark.
- Native live-v60 build baseline and target compared: total client JS/CSS, compressed Worker and combined key-page weight had no increase. Framework random build IDs caused a1-byte independent HTML-gzip fluctuation; requested combined page-weight gate passed. Deterministic CI build identities are being added so repeated comparisons are stable. No claim of a completed mobile/desktop browser speed comparison yet.
- Private backup Worker deployed with **no active daily schedule**; local R2/export polling/failure/checksum/SQLite restore tests passed. Private R2 backup bucket has verified30-day retention for `d1/` only. Remote credential, first backup and remote restore/count check are pending.
- Cloudflare$3usage early-warning email alert saved and verified. The existing$10usage alert is **not** a verified total-bill alert. Exact total-bill support/configuration remains unresolved.
- Hourly Mac monitor/schedule was deleted at the owner's request. No70k/day or2000minute alert applies on Paid. Do not recreate it.

## Latest required workflow (supersedes Workers Builds plan)

Production must deploy only from GitHub Actions after Validate passes on main. Private Free GitHub branch protection is unavailable (403); deployment enforcement must block failed/unchecked main builds. Disable Workers Builds or any other automatic production path. Isolated Claude/Codex branch previews, PR URL comments, least-privilege deployment token in this repository's GitHub Actions secrets, and staging rollback test still need setup and verification. Agents use GitHub only. Full checks run on PRs/main, with superseded jobs cancelled, within free Actions minutes.

## Monthly usage and cost

| Metric | Latest verified observation | Source/as-of |
| --- | --- | --- |
| Workers fixed fee |$5/month approved and active | Cloudflare subscriptions,4Nov |
| Requests / CPU | Initial analytics query returned no samples before public preview traffic; current totals pending | Cloudflare account GraphQL,4Nov14:59UTC; do not infer zero after later tests |
| D1 rows |365read /150written in November snapshot; subsequent test/import activity not included | Account GraphQL,4Nov14:59UTC |
| D1 storage | Pending current measured total | Not inferred |
| R2 operations |21in November snapshot (account-wide); later activity not included | Account GraphQL,4Nov14:59UTC |
| R2 billed storage |0.11GB-month,0billable/$0usage in current cycle | Cloudflare billing UI,4Nov; cycle15Oct–14Nov |
| Cloudflare build minutes | No builds recorded in initial snapshot | GraphQL,4Nov14:59UTC; latest plan now Actions |
| GitHub Actions minutes | Pending account usage query | Must remain within free allowance |
| Images/Stream | Plan label Images Stream Basic; creation audit response being inspected for price/which subscription | Audit event4Nov19:24:46IST, owner account via Dashboard; not yet attributed to this plan |
| Total monthly bill | Not yet verified; about$5target, plus applicable tax | Usage alert is not a hard cap/total forecast |

## Required before staging approval

Complete integrations inventory, all-URL/sitemap/link/image/security/analytics checks, desktop/mobile comparison with live, dedicated staging resources and synthetic Sheet/email tests, daily remote backup+restore then schedule, tested staging rollback, deployment-only CI enforcement and Claude/Codex preview parity. Resolve Images/Stream cost/use and cancel only if unused and chargeable per owner's latest instruction. Set native billing emails, with honest limits if Cloudflare cannot alert on fixed-fee/tax-inclusive totals.

## Required before switch approval

Private complete Namecheap zone, TTLs, redirects and forwarding-address inventory. Cloudflare Free zone and equivalent free Email Routing/redirects/verification records; lower TTLs a day ahead. Owner privately completes account security/credentials/forwarding verification. Written timed cutover/delta-import/rollback runbook. Owner must approve staging and separately approve nameserver switch. Sites stays live/untouched and builder frozen until then. Keep Sites14days after actual cutover, ask before retirement, take final export. Monitor and report72hours after switch. Monthly owner-only export outside Cloudflare must be documented and tested without a Mac hourly monitor.

Owner-only steps: [OWNER-STEPS.md](docs/cloudflare/OWNER-STEPS.md). Evidence and limitations: [Cloudflare status](docs/cloudflare/STATUS.md).
