# Taksh website standards

One page that keeps taksh.store consistent. Every rule here is either checked by a script or listed in the pull request checklist. Written 9 November 2026 from the live site (audit job `2026-11-09-03`). Nothing below changes the current site; it describes it and guards it.

## Design tokens (from `app/globals.css` `:root`)

| Token | Value | Use |
|---|---|---|
| `--beige` | `#fdf8ec` | Page background |
| `--cream` | `#fff9ec` | Text on cobalt, cards in the collector band |
| `--tint` | `#eee8da` | Bands, hover. Product images on this colour sit on exactly this colour |
| `--ink` | `#14182b` | Text |
| `--muted` | `#636357` | Secondary text |
| `--line` | `#d8d3c6` | Borders and dividers |
| `--cobalt` | `#0041c1` | Header, footer, links, focus ring |
| `--saffron` | `#fbb72a` | Primary button, price tag |

- **Type:** headings Bricolage Grotesque 700, letter-spacing −0.045em, line-height 1.06. Body Figtree 16 px, line-height 1.5. h1 `clamp(3rem, 5.7vw, 5.5rem)`, h2 `clamp(2.25rem, 4vw, 3.75rem)` (36 px on phones), h3 1.65 rem. Smallest text 12 px.
- **Spacing and layout:** `.wrap` 1440 px max, 56 px side padding (20 px under 640 px). Breakpoints in use: 640, 760, 800, 900, 1100, 1150 px. Corner radius 0.75 rem for cards, 999 px for buttons.
- **Rule:** new CSS uses `var(--token)`. `scripts/check-tokens.mjs` fails on any new loose colour or font. Today's 115 loose values are frozen in `scripts/token-baseline.json`. Lower the counts when you touch a file; never raise them.

## Components

- **Buttons:** `.button` is 52 px tall, pill-shaped and 16 px semibold. `.primary` is saffron with ink text, and there is one per screen. `.outline` is the secondary. Text links are underlined. Every tap target is at least 44 × 44 px.
- **Product card:** image, name, the facts line `Ages N+ · About N pieces`, price, then Add to bag. The facts come from the catalogue, never from typed text.
- **Set page:** gallery, buy box (name, facts line, price, Add to bag), story sections, "Size and space", then the disclaimer. Every set page has all five. A new set reuses the shared gallery and buy box; give a reason in the PR if it doesn't.
- **Forms:** a visible label above every field, a 52 px field height, errors under the field in plain words, and optional fields marked "(optional)".
- **Fixed bars:** nothing fixed may cover a primary button. Check the analytics notice, the sticky buy bar and floating WhatsApp together at 390 × 844.

## Page templates

| Template | Pages | Must have |
|---|---|---|
| Home | `/` | What Taksh is, in the first screen; one primary action |
| Set page | `/sets/<slug>` | The five set-page parts above; canonical; share image under 300 KB |
| Content page | `/quality`, `/returns`, `/privacy`, `/help/*` | One h1, a breadcrumb that starts at Home, a contact route |
| Form page | `/bag`, `/checkout`, help forms | Primary button visible without scrolling on a 390 × 844 phone; noindex where private |

## Copy rules (checked by `scripts/lint-copy.mjs`)

- Never "Lego" or any brick brand, and never "toy". "Play" appears only on Gully Cricket.
- Never use "official", "approved", "certified", "exact replica", "scale model", "iconic", "legendary", "stunning", "ultimate" or "nostalgia".
- Put "about" before every piece count, size and build time.
- Use at most one "!", and only in "Taxi!" or "Uncle, ball de do!".
- Write headings in sentence case, and use short, calm sentences.
- Never name neighbouring countries or disputed lines on Map of India copy.
- Known issues on main are listed in `scripts/copy-baseline.json`. Fix them and delete each line as you do; never add a new one.

## Product data: one source

- `lib/catalogue.json` is the site's only source for name, slug, price, pieces, age and level. Pages read from it and never type a price or count.
- The copy lint fails on any price or piece count that is not in the catalogue.
- `catalogue.json` must match `Namo Products/System/products.json`. A change goes to both in the same task.

## Analytics event catalogue

| Step | GA4 | Meta | When |
|---|---|---|---|
| Any page | `page_view` | `PageView` | Once per route, after idle |
| Set page | `view_item` | `ViewContent` | Once per page view |
| Add to bag | `add_to_cart` / `remove_from_cart` | `AddToCart` | On the tap |
| Bag | `view_cart` | — | On open |
| Checkout | `begin_checkout` | `InitiateCheckout` | When the draft is saved |
| Go to payment | `pay_tapped` | `AddPaymentInfo` | On the tap |
| Request saved | `generate_lead` | `Lead` (no value) | After it is saved |

- **Rules:** no names, contact details or order references in events or URLs, and item names come from the catalogue. Scripts load after idle and never on staging, previews, `/admin` or automated browsers. Delivery is proven in GA Realtime and Meta Events Manager, not by unit tests.

## Performance budget

- The existing gate stays as it is: `scripts/check-performance.mjs` and `check-main-performance.mjs` cover page weight, JS and CSS gzip size and a Worker under 3 MiB.
- **Phone targets (Lighthouse mobile):** LCP at most 2.5 s, CLS at most 0.1 and a score of 90 or more.
- **Images:** a hero image of 150 KB or less at the size it is shown, and a share image of 300 KB or less as JPEG.
- `Nightly Lighthouse` reports the trend each night. It is informational and never blocks.

## Accessibility baseline

- axe finds 0 WCAG 2.1 A/AA violations.
- Every image has alt text, every field has a label, and focus is visible.
- Visible labels match accessible names, and headings run in order.
- Text is at least 12 px and tap targets at least 44 px.
- Motion respects `prefers-reduced-motion`, and pages work at 200% zoom.

## Definition of Done (also in the PR template)

1. Validate passes. That includes the copy lint, the token check and the link check.
2. There are phone (390 × 844) and desktop (1440 × 900) screenshots for any visual change, and nothing fixed covers a primary button.
3. Product numbers come from `lib/catalogue.json`, and `products.json` is updated in the same task.
4. New or changed pages are in `public/sitemap.xml` with a canonical, title, description and share image.
5. Events follow the catalogue above, and no personal data appears in events or URLs.
6. No secrets, customer data or media are in Git.
