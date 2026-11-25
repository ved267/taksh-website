# Taksh architecture

The migration preserves the published Sites v60 application. Vinext/React builds into a Cloudflare Worker plus static assets. Sites-specific authentication/hosting bindings are replaced with owner Cloudflare Wrangler bindings. The application keeps the v60 design, availability request flow and GA4 tag.

## Request paths

Cloudflare serves static files from ASSETS. workers/app.ts wraps the Vinext server, applying anonymous public-page caching. Application APIs bind directly to D1 DB and private R2 BUCKET. Production, dedicated staging and branch previews use distinct bindings.

Public routes: /, /sets, /sets/gully-cricket, /sets/map-of-india, /sets/ram-mandir, /sets/yellow-taxi, /sets/chandrayaan-3, /sets/nonsense, /our-story, /quality, /levels, /community, /building-instructions, /help, /help/contact, /help/missing-piece, /returns, /privacy, /bag, /checkout. /admin is the owner interface. Existing not-found handling, robots.txt, sitemap and asset paths are preserved. Parameterised informational pages use app/[info]; catalogue product pages use app/sets/[slug].

| API | Purpose / boundary |
|---|---|
| /api/cart | Anonymous selection session; price snapshots and optimistic version checks |
| /api/checkout | Availability request, consent/contact validation; no payment taken |
| /api/contact | Enquiry and reference |
| /api/subscriptions | Consented mobile interest registration |
| /api/support | Missing-piece/support request and optional private photo up to5MiB |
| /api/admin/login and /logout | Owner password/session creation and revocation |
| /api/admin/orders | Authenticated reporting |
| /api/admin/export | Authenticated private CSV |
| /api/admin/photo/[id] | Authenticated private R2 download; no-store |
| /api/integrations/customer-sheet | Key-authenticated paginated Sheet feed plus acknowledgement/failure status |

R2 has no public customer-photo URL. Workers accepts the direct5MiB support upload; the prior Sites upload-chunk workaround is unnecessary. Static catalogue images are committed public assets/manifest responsive variants, not customer uploads. Cloudflare Images/Stream is unused and untouched.

## D1 schema

Committed Drizzle SQL under drizzle/ is authoritative; migration metadata remains intact. Migrations are explicit operator Actions jobs, never request-time DDL.

| Table | Columns |
|---|---|
| admin_sessions | token_hash, expires_at |
| orders | id, token_hash, reference, created_at, updated_at, placed_at, status, last_step, items, total, details, device_type, arrival_page, utm_source, utm_medium, utm_campaign, email_status, version, traffic_type, referrer, currency |
| rate_limits | key, window_start, attempts |
| subscriptions | id, created_at, mobile, consent |
| support | id, created_at, set_slug, description, mobile, photo_key, photo_type |
| enquiries | id, reference, created_at, name, mobile, email, topic, message |
| reporting_state | key, updated_at, payload |
| d1_migrations | id, name, applied_at (Wrangler bookkeeping) |

Orders persist server-side item/price/currency snapshots, progress, CAS version, attribution and traffic classification. A saved request does not establish payment. Preserve source identifiers/timestamps and idempotency during import. Business-data reconciliation does not reuse source admin sessions/rate limits. Internal and automated rows remain excluded from real demand reporting.

## Storage and schedules

Production: taksh-production D1 and taksh-production-support R2. Dedicated staging: taksh-preview D1 and taksh-preview-support R2. Native branch previews derive separate D1/bucket names from branch+hash, use APP_ENV=preview and synthetic secrets; production storage is never mounted there. Dedicated staging is APP_ENV=staging and can receive the authorised private restore test.

Private taksh-private-backups holds native SQL plus integrity manifests under d1/YYYY-MM-DD/<snapshot UUID>/ with a completed-day pointer, pre-restore snapshots under d1/pre-restore/, and numeric health records under health/. Lifecycle deletes d1/ objects after30days. GitHub backup schedule is22:00UTC daily after proof/readiness. D1 Paid Time Travel is an independent30-day layer. The monthly Mac copy automation is paused. Legacy taksh-daily-backup has no active cron and is not used; no separate backup token.

The Apps Script sync trigger runs every5minutes. The hosted Actions watch runs hourly only through the72-hour cutover window and sends one summary, and a daily hosted retirement check asks at day14 then disables. The app Worker has no cron handler; Sheet health is checked by the hosted Actions watch. No migration, backup export or DDL executes during a customer request.

## Caching, images and performance

Only explicitly allowlisted anonymous public HTML is cached, keyed by deployment/build, for300seconds. Personalised cookie requests, APIs, owner/cart/checkout paths and RSC requests bypass public HTML cache. Private responses use no-store. Static hashed files retain immutable caching; existing responsive image manifest, thumbnails, srcset, fonts and local assets remain. Preview/staging are excluded from indexing and production analytics by existing environment/hostname checks. CI compares compressed JS/CSS/Worker size and key-page weight against main; deployable builds use normal fresh server secrets, distinct from public fixed metadata used only for fair CI benchmarks. Staging comparisons used live v60 as the external baseline. Measured timings and the owner decision are in MIGRATION-STATUS.md.

## Security

Owner password is stored as ADMIN_PASSWORD_HASH in Cloudflare only. Owner-selected passwords accept four or more characters. The existing eight-login-attempts per client per15minutes remains; five incorrect passwords within15minutes block that client until the failure window expires, including otherwise correct submissions. Successful login clears only the failure counter. Session secrets use hashed tokens and HttpOnly/Secure cookies; mutation validation, request limits, consent handling and optimistic retry protection remain. Do not enable logging of form payloads, tokens or SQL. Observability samples at1%, redacts query strings, disables invocation logs and traces. Private photo retrieval requires owner authentication. CUSTOMER_SHEET_SYNC_KEY authenticates the integration; all values stay in Cloudflare/Apps Script settings.

The sole persistent Cloudflare deployment token resides only in GitHub Actions. Untrusted PR builds receive no token. A trusted-main workflow checks run/repository/ref/SHA/artifact paths and extracts a restricted compiled bundle before deploying with trusted config. Production releases independently require validated current main plus the owner-controlled production gate. Manual restore targets staging only; staging-first migration and fresh backup precede production DDL. GitHub Free private main protection is unavailable; the agent PR convention is distinct from the release gate.

## Demand tracking and analytics

Existing GA4: G-NHQFYHTNLP. Meta Pixel 29283360584637655 and Clarity (owner approval, 7 November 2026) load when the browser is idle, under the same consent and exclusions; the server sends only Lead through the Conversions API, with event_id equal to the request reference that the browser Lead also uses. Bots (owner decision, 9 November 2026): a request from a data-centre network, a verified bot, a bot user agent, a prefetch or preview, or one without Accept-Language is counted as automated on the server. A page response marks the browser with taksh_auto=1 for 30 days, which stops GA4, Pixel and Clarity there, only on the strong signals (not a missing Accept-Language alone), and prefetch or preview requests never change the mark (24 November 2026, after the Pixel went silent for real visitors). Existing event mapping: ViewContent→view_item, AddToCart→add_to_cart, InitiateCheckout→begin_checkout, ViewCart→view_cart, RemoveFromCart→remove_from_cart, RequestFailure→availability_request_error. Lead maps to generate_lead only for contactable saved interest; anonymous selection uses selection_saved. Events contain public catalogue/item/category/price information, never typed contact/form fields. No purchase or paid-revenue claim. Existing consent and internal/browser/bot/preview/noncanonical-host exclusions remain; GA visitors are browser estimates, not exact unique buyers.

The production migration smoke request is internal:true with utmCampaign taksh-migration-check. Existing server classification excludes it from demand totals; the Script explicitly allows only that marked internal campaign into the Sheet as Test, with an internal-test note and no owner demand alert. All other test rows stay excluded. Reporting PR #2 remains open for Claude.

## Existing Sheet protocol and email

Keep the original private workbook/tab,17 columns and manual follow-up notes. Feed has15 values; P is follow-up status and Q is notes; data begins at row5. Endpoint remains https://taksh.store/api/integrations/customer-sheet. Apps Script TAKSH_SYNC_KEY matches Worker CUSTOMER_SHEET_SYNC_KEY. Preserve CURSOR, SYNC_STATE, INITIAL_IMPORT_DONE, PENDING_ALERT_COUNT and LAST_ALERT_AT when reconnecting; never reset manual history.

Sync pages up to100 rows, at most5 pages per run; cursor uses placed_at/id. References deduplicate writes. A staged plan is persisted before Sheet writes; retry safely, then acknowledge the server only after successful completion. reporting_state records lastAttempt, lastSuccess, status/count and a non-sensitive failure category. Failures preserve previous success time. MailApp owner alerts use the existing15-minute throttle/free quota; internal tests do not alert. No synthetic staging workbook is required.

Optional RESEND_API_KEY and FROM_EMAIL configure transactional mail when present. Namecheap had zero forwarding aliases. The mail MX and SPF records were preserved, so no forwarding test applied.

## Source and rollback boundary

GitHub main contains the reconciled v60 source. The original builder is frozen. The Sites project is owner-only as of 7 November 2026 and remains a cold backup until at least 20 November. The private final D1 export reconciles with production. Zero source support rows reference photos. The Sites integration does not provide an R2 object export, so its bucket stays with the project. [Operations](OPERATIONS.md)

## Owner DNS

Namecheap delegates taksh.store to the active Free Cloudflare zone. The dashboard-managed apex and www routes target taksh-store. GitHub deployments preserve them without DNS permissions. The www redirect uses the existing GA hostname, taksh.store, and preserves path and query.
