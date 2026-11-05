# Taksh website

GitHub is the source of truth for Claude and Codex: https://github.com/ved267/taksh-website. Follow [AGENTS.md](AGENTS.md); CLAUDE.md only points there. Original Sites builder folder is frozen. Sites remains live until the owner's staging and switch approvals.

Target: owner's Cloudflare Workers Paid ($5/month), native D1 and private R2 within its free allowance. No other paid add-on/trial. Production deploys only through GitHub Actions after Validate passes on main; isolated previews use the same path for Claude/Codex. Setup is in progress; do not assume a listed capability is already active.

```
npm ci
npm run build
npm test
npm run typecheck
npm run lint
node scripts/test-local.mjs
```

Use committed D1 migrations with explicit Wrangler commands, never request-time schema changes. Secrets/customer data/exports stay out of Git. Current progress, verified evidence and outstanding owner steps: [MIGRATION-STATUS.md](MIGRATION-STATUS.md), [Cloudflare status](docs/cloudflare/STATUS.md), [owner steps](docs/cloudflare/OWNER-STEPS.md).
