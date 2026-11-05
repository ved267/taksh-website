# Taksh — shared Claude and Codex rules

Repository: https://github.com/ved267/taksh-website. This is the single rules file; CLAUDE.md points here. The owner's final migration brief of 5 November 2026 supersedes older migration plans and handoffs.

Read [Operations](docs/OPERATIONS.md) for resources, GitHub jobs and recovery. Read [Architecture](docs/ARCHITECTURE.md) for application and data boundaries. These are the two maintained handoff documents. MIGRATION-STATUS.md records only staging ready, cutover done and the 72-hour milestone.

## Hosting and release

- Only authorised paid service: Cloudflare Workers Paid ($5/month) and R2 within its free allowance. No other paid services, add-ons or trials. Images/Stream is $0 and unused: leave it alone. Use the existing $3 usage notification plus invoices; no total-bill forecast or Mac usage monitor.
- Sites v60 remains live until the owner reviews staging and gives the cutover go. Production readiness stays false until then. After the switch, keep Sites unchanged for 14 days; ask before retirement and take a final export first.
- GitHub is the source of truth. Never edit, build or publish the frozen original builder at `/Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh`.
- This migration must not change public UI, UX, copy, layout, images or speed, or add tracking libraries.

## Equal access

- Claude: `claude/<task>`; Codex: `codex/<task>`. One task per branch; never two agents on the same branch. Open a PR, pass Validate, then merge. Never force push. Notes explain what changed, why and what was tested; any subsequent visual change needs desktop and mobile screenshots.
- Both agents use the same GitHub API and Actions jobs. Normal operations require GitHub access only, never this Mac, a Codex session or the owner's Chrome. Preview artifacts build without credentials; trusted-main tooling verifies them before using the deployment secret. Production deploys require successful Validate on current main and TAKSH_PRODUCTION_READY=true.
- Private-repository main protection is unavailable on the current GitHub Free plan. Do not claim server-enforced PR protection, buy an upgrade or make the repository public. Follow the PR convention and release checks.

## Secrets and data

- Never put credentials, customer data or hashes, exports, private support photos or backups into Git, chat, screenshots or build artifacts. Never screenshot a page/window after a credential has been revealed; native text can advance while a rendered secret modal remains. Revoke any captured credential.
- One deployment credential only: `Taksh GitHub deploy`, held solely as GitHub Actions secret CLOUDFLARE_API_TOKEN. The same credential performs backup operations. Application secrets live only in Cloudflare; .env.example lists names without values. Never ask for secrets in chat.
- Branch previews use separate D1/R2 and public synthetic credentials/data; they never share production storage. Dedicated staging may receive the expressly requested private backup restore. Do not expose restored records through public endpoints.
- Preserve v60 schema, migration history, timestamps, stored prices/currency, consent, retry cursors and manual Sheet notes. Apply database changes only through committed migrations and explicit Actions jobs (`wrangler d1 migrations apply`), never inside requests.
- Availability requests are not paid sales. Preserve bot/internal/test exclusions; no dummy payment or paid-order/revenue claims.

## Migration scope and recovery

- Daily GitHub backup: D1 native export to private R2, 30-day retention; enable the schedule only after a real GitHub backup and staging restore match counts/content. D1 Time Travel is the second layer. Monthly Mac copy is best effort only.
- Do not create a separate backup token, staging Google Sheet, Sites R2 export, daily report or repeated staging performance benchmark. Source support rows reference no photos; the unavailable complete Sites object inventory is a documented limitation, closed by the owner.
- Before staging review: prepare matched DNS, forwarding, redirects and TTLs; one desktop/mobile comparison against live. Send staging and a short phone checklist, then wait for the cutover go.
- Cutover: fresh and late Sites exports with idempotent reconciliation; browser nameserver change; website/www/TLS/request/admin/Sheet/GA/mail checks. A marked internal migration request must be excluded from demand totals and labelled Test in the existing Sheet.
- Roll back critical failures without asking, notify the owner. Hosted checks stay quiet when healthy, stop at 72 hours with one summary, and ask at day 14 before retiring Sites. Rebase/check reporting PR #2 only after cutover.
- Report actual tool failures; a fallback does not complete a failed capability. Record tested results separately from pending work. Collect the remaining owner confirmations/hidden inputs into one session, not piecemeal questions.
