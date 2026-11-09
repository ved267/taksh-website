What changed:

Why:

What was tested (commands/results):

Visual change: No / Yes (include desktop AND mobile screenshots if Yes).

Database migrations: None / List committed migrations and explicit apply command.

Preview URL and branch (claude/<task> or codex/<task>):

Definition of Done (docs/STANDARDS.md):

- [ ] Validate passes, including the copy lint, the token check and the link check
- [ ] Phone (390 × 844) and desktop (1440 × 900) screenshots attached for any visual change; nothing fixed covers a primary button
- [ ] Product numbers come from `lib/catalogue.json`; `Namo Products/System/products.json` updated in the same task if they changed
- [ ] New or changed pages: in `public/sitemap.xml`, with canonical, title, description and a share image of 300 KB or less
- [ ] Analytics events follow the catalogue in STANDARDS.md; no personal data in events or URLs
- [ ] No secrets, customer data or media in Git
