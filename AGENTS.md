# Taksh — shared Claude and Codex rules

Repository: https://github.com/ved267/taksh-website. This is the single rules file; CLAUDE.md points here. Claude owns day-to-day website work from 7 November 2026. Follow the owner's latest decisions and the operating record here.

Read [Operations](docs/OPERATIONS.md) for resources, GitHub jobs and recovery. Read [Architecture](docs/ARCHITECTURE.md) for application and data boundaries. Read [Access](docs/ACCESS.md) for every repository, token name, connector and account Claude and Codex use (names only, never values). These are the three maintained handoff documents. MIGRATION-STATUS.md records only staging ready, cutover done and the 72-hour milestone.

## Hosting and release

- Only authorised paid service: Cloudflare Workers Paid ($5/month) and R2 within its free allowance. No other paid services, add-ons or trials. Images/Stream is $0 and unused: leave it alone. Use the existing $3 usage notification plus invoices; no total-bill forecast or Mac usage monitor.
- Production is live on owner Cloudflare. Keep the owner-only Sites v60 cold backup through 20 November 2026. Deletion requires the owner decision.
- GitHub is the source of truth. Never edit, build or publish the frozen original builder at `/Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh`.
- The migration preserved the v60 public UI, copy and assets. Scope future changes to the owner-approved task.

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

## Recovery and handoff

- GitHub exports D1 daily to private R2 with 30-day retention. D1 Time Travel is the second recovery layer. The Mac backup schedule is paused.
- Use the GitHub jobs in Operations for preview, production deploy, rollback, migration, backup and staging restore. Keep the Cloudflare deployment token in Actions.
- Claude owns the hosted 72-hour watch, the Map and Gully speed follow-up, PR #2 and the Sites retirement decision with the owner. The final private Sites export and its R2 limitation are recorded in Operations.
- Report actual tool failures and distinguish verified results from pending work.
