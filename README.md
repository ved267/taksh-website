# Taksh website — GitHub source of truth

Owner: ved267. Shared equally by Claude and Codex. Read AGENTS.md.

Current branch `codex/cloudflare-free-migration` reconciles the exact published Sites version60 source. The earlier Next/Vercel and Netlify/Turso work is saved on its own branches; no paid provider or account was provisioned. Main remains the original export baseline until a reviewed migration is approved.

**Stopped at the requested Cloudflare Free gate:** compressed existing Vinext artifact405.90KiB, but real live v60 CPU samples exceed10ms. No own-account deployment or DNS switch. Read [Cloudflare status](docs/cloudflare/STATUS.md), [measurements](docs/cloudflare/feasibility-2026-11-04.json) and the [owner-only steps](docs/cloudflare/OWNER-STEPS.md).

The original builder folder is frozen with a README. Live taksh.store remains on Sites. After an approved future cutover, keep Sites unchanged as rollback for14days. Customer backups and unfinished original-folder work are private and excluded from Git. The source app still contains historical Sites build configuration because runtime adaptation is intentionally stopped at the feasibility gate; do not publish it to Sites.
