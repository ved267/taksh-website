# Taksh performance improvement plan

Goal: keep the existing design, content and shopping flow while reducing repeat work, image transfer and rendering overhead.

Baseline: published version 10, source 0d1d2af. Global CSS is 209,948 bytes; Ram Mandir thumbnails use nine 600 px images; its product route also loads the 52,814-byte select-control module just to use a quantity stepper. Browser observation shows max-age=0 revalidation on all static files. Internal navigation uses document loads.

- [x] Add a build-time performance budget; observe its failure against the current output.
- [x] Prepare content-addressed image variants: tiny thumbnails, responsive display images, unchanged full-resolution originals, and the same logo at an appropriate resolution. Self-host the two existing fonts. Cache only fingerprinted static files for a year; do not cache account/order/API responses.
- [x] Restrict generated utility CSS to actual application components; remove verified unused legacy Chandrayaan selectors. Split the plain quantity stepper from the select component so product pages do not download the select implementation.
- [x] Use framework navigation for internal links without eager catalogue-wide prefetching. Keep external links, downloads and final checkout submission behaviour. Key filter state to URL inputs so back/forward navigation restores the correct filters.
- [x] Replace per-scroll layout queries on product pages with a shared intersection observer for the sticky buy bar; retain its header/contact/footer avoidance rules.
- [x] Build and compare page-weight budgets; run existing domain tests, type checking, and browser checks at 375/768/1440. Check navigation/back, gallery, sticky bars, filters, bag persistence and checkout. Obtain one independent read-only review, then publish through Sites.

Rulings: use the Site-owning checkout because the Sites workflow owns source synchronization and publication. No layout, copy, checkout data or order API changes. No speculative infrastructure migration. Treat browser-extension-injected hydration attributes as environmental, not application changes.

Regression focus: cached assets must change URLs when bytes change; thumbnails must not crop models; fonts must keep the current weights; back/forward must preserve filters and bag; sticky controls must not overlap contacts/footer.

## Verification and results

- Global CSS: 209,948 → 92,497 bytes (56% smaller); compressed: 34,248 → 17,302 bytes.
- Chandrayaan thumbnails: 336,122 → 38,636 bytes. Ram Mandir: 323,782 → 44,852 bytes, including its newly requested tenth image.
- Local production responses confirm year-long immutable caching for fingerprinted scripts, styles, media and fonts. Browser reload confirms disk-cache reuse. HTML has no immutable policy; checkout API remains no-store.
- Product route no longer loads the 52 KB filter/select controls chunk. Quantity stepper is separate. Existing fonts are self-hosted with their OFL licenses.
- Catalogue filtering, sorting, header reset and Back navigation verified. Native checkout exits retained; immediate navigation saves draft edits. Bag confirmation and persistence verified without placing an order.
- Both products tested at 375/768/1440 px without horizontal overflow. Sticky bars show after long scroll jumps, hide when returning to purchase controls and avoid the phone footer.
- Existing 11 domain tests, typecheck, production build, CSS/thumbnail budgets and fingerprint-content integrity checks pass.
- Independent review caught shared image CSS, filter state and checkout/scroll edge cases; all corrected and re-reviewed.
- Vinext's bundled next/link failed its production navigation import, so SiteLink uses the public router with native anchor semantics, no speculative prefetch and a download guard.

## Additional Ram Mandir request during this pass

Only Ram Mandir's content/layout changed: cropped guide with real HTML legend; two functional-detail tiles; lifted-spire gallery item 4; removed nameplate banner; requested wording and metadata; phone bar text and bottom safe-area padding. Found the supplied-style lifted-spire photo as `taksh-spire-lifted-sanctum.png` in the user's recent Codex outputs and imported it as gallery-11-spire-lifted. All other page designs, header/footer, palette and typefaces preserved.
