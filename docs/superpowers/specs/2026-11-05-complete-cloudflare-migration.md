Finish the complete transfer of taksh.store from Sites to my own Cloudflare account. Be thorough and robust. Do not ask me again for approvals already given below; ask only for the owner steps in section 9 and my two go/no-go decisions.

0. Budget and fixed rules
- The ONLY paid service is Cloudflare Workers Paid ($5/month) + R2 within its free allowance, already active. Nothing else paid: no GitHub Pro, no paid email, monitoring, backup or DNS service, no trials. Use free features only. If something seems to need payment, find the free route or tell me why there is none.
- Images/Stream subscription found on my Cloudflare account: if taksh.store does not use it and it costs anything, cancel it and tell me. If the site uses it, tell me what for and the cost before changing anything.
- No UI/UX, copy, layout, image or design changes. No slower pages. No new tracking libraries. Customer data and secrets never go into Git, chat or screenshots.
- Sites stays live and untouched until I approve staging and the switch. The original builder folder stays frozen.

1. Save and correct the record now
- Commit and push all current work on its branch. Rename it to codex/cloudflare-migration (it is no longer "free").
- Rewrite MIGRATION-STATUS.md, docs/cloudflare/STATUS.md and OWNER-STEPS.md to today's truth: Workers Paid approved and active, stop gate resolved, what is done, what is left. Remove stale claims.
- Remove the hourly Mac usage monitor and its schedule. The 70,000/day and 2,000-minute thresholds were Free-plan limits. Rely on Cloudflare's own billing emails: $3 usage alert (done) plus a total-bill alert at $10.

2. Runtime
- Plain Worker + wrangler config; no Sites/ChatGPT/.openai code active. Every binding (D1, R2, secrets, vars, crons) declared, with separate production, staging and preview environments. Previews and staging can never reach production data, secrets or email.
- Every outside connection inventoried and working: Google Sheet sync, any notification email (free tier only), Google Analytics, owner dashboard, support uploads. Document each in docs/cloudflare/INTEGRATIONS.md.
- Keep security behaviour from Sites: secure owner cookies, rate limits, duplicate prevention, private uploads, security headers, HTTPS. Turn on Workers logs/observability (free) for errors and CPU.

3. Shared workflow for Claude and Codex (free only)
- GitHub branch protection is not available on our free plan, so enforce safety through deployment: production deploys ONLY from GitHub Actions after the Validate checks pass on main. Turn off any path that deploys main without checks. A failed check means nothing reaches taksh.store.
- Every claude/* and codex/* branch gets an isolated preview URL, posted on its pull request, the same for both agents. Agents need only GitHub access; the Cloudflare deploy token lives only in GitHub Actions secrets with the minimum permissions.
- Rollback: one documented command or button that restores the previous production version in under 2 minutes. Test it on staging.
- Keep CI within GitHub's free minutes: run full checks on pull requests and main only, cancel superseded runs, report monthly minutes used.

4. Data and backups
- Database: committed migrations only, applied by a documented command, never during a request.
- Backups: D1 Time Travel (30 days on Paid), plus the daily automatic export to the private R2 backup bucket (turn it on after its first backup and a test restore with matching counts), plus a monthly owner-only copy outside Cloudflare in /Users/devanshsmac/Desktop/Taksh Website Export/. Never in Git.
- R2: list and export every object from the Sites storage, including any not referenced by a database row, or explain exactly why that is impossible.

5. Domain and email (taksh.store is at Namecheap, with Namecheap email forwarding)
- Before changing anything, get the complete current zone from Namecheap (all records, TTLs, URL redirects, email forwarding rules), and save it privately.
- Namecheap email forwarding stops working when nameservers move away from Namecheap. Replace it with Cloudflare Email Routing (free) using exactly the same forwarding addresses, and recreate any redirects as Cloudflare redirect rules (free). Keep every verification record (Google Search Console, Meta, Google Analytics or others).
- Lower TTLs a day ahead. Add the zone to Cloudflare Free, compare every record, then wait for my go before changing nameservers. Both taksh.store and www must work, with the same redirect behaviour as today.
- After the switch, verify website, TLS, www, email forwarding (send a real test to each forwarding address) and verification records.

6. Staging verification (synthetic data only)
- Every existing URL (compare full sitemap and link crawl with live), 404 page, robots.txt, sitemap, meta and social preview images, favicon, every image.
- Availability request on phone and desktop: success message, no duplicates on refresh/retry/double-click, record in owner dashboard, row in the Sheet, email if any.
- Owner sign-in, CSV export, support form with a 5 MB photo, Google Analytics events, internal-traffic exclusion.
- Speed: mobile and desktop, compared with live taksh.store under the same conditions. No regression allowed.
- Send me the staging URL with a 10-minute phone checklist.

7. Cutover (only after my go)
- Written runbook with times. Fresh final export from Sites, import, reconcile counts and content. Switch. Immediately run the smoke tests. Then export from Sites again and import any request that arrived during the switch (idempotent, no duplicates).
- Rollback plan written and tested on staging before the switch.

8. After cutover
- Watch errors, CPU, requests and Sheet sync for 72 hours; report daily in MIGRATION-STATUS.md.
- Keep Sites as rollback for 14 days, then ask me before retiring it, with a final export first.
- Write docs/RUNBOOK.md for both agents: deploy, preview, rollback, restore a backup, rotate a secret, add a new product page, add a database change, check monthly costs.

9. Things only I can do
- One numbered list in OWNER-STEPS.md, in the order needed, with exact clicks: connect Cloudflare to GitHub (this repo only), set the admin password and Sheet key privately, Namecheap zone export and nameserver change, two-step login on Cloudflare and GitHub. Never ask me to paste a secret into chat.

10. Final check and report
- Tell me when a test pull request can be opened so Claude can confirm its preview works exactly like yours.
- Finish with a short report: done, verified (with evidence), left, monthly cost (should be about $5).