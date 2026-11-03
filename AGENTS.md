# Taksh shared website source

This repository belongs to ved267 and is intended for both Codex and Claude. Read README-TAKSH.md and MIGRATION-STATUS.md before making changes.

The initial snapshot is the exact tracked source of Sites version59, commit d090acfe3163346d2f2a63f24ef119aef6b147fe, plus the available public assets. It is an export baseline, not a completed Vercel migration. Preserve product design, public UI/UX, customer-data protections and performance. Do not publish this checkout to Sites or use its historical .openai/hosting.json to modify the original site.

Work on a separate branch for each bounded change; start from current main and review differences before integration. Avoid simultaneous edits to the same files from different agents. Keep a concise decision/check log and do not label incomplete work production ready.

Never commit .env files, credentials, database exports, customer records, uploaded support files or private backup archives. Keep secrets in the owner's account and local ignored configuration. Do not grant Claude or Codex access to unrelated repositories or accounts.

Do not introduce a dummy checkout, paid services, marketing-link tagging, new UI fields, new tracking libraries, or public design changes as part of the hosting migration. Those need their own brief. Complete source adaptation, database/file migration, owner access, Sheet configuration and end-to-end verification before changing taksh.store. Preserve the Sites deployment as rollback until migration is confirmed.

The original builder is still editing /Users/devanshsmac/Documents/Codex/2026-10-02/sites-plugin-sites-openai-curated-remote/taksh. Its unfinished work is outside this baseline and must be reconciled after completion. Do not silently replace it with this older snapshot.
