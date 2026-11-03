# Consequential audit fixes — verification

Implemented 16 October 2026 for the existing public Taksh Site.

## Shipped scope
- Shared compact phone buying layout for all five products; original brand, images, prose and Roman Hindi retained. Lifestyle previews live in galleries rather than adding an extra row above buying controls.
- Earlier Chandrayaan movement and Taxi features; optional long numbered guides. Shared size/delivery/returns disclosure, explicitly noting provisional size/time guidance.
- Contact-first mobile checkout with collapsed selection, explicit Enter-to-next handling, retained local draft on network failures, visible request reference and accurate no-payment confirmation.
- Decode-before-swap galleries with obsolete-request cancellation, retained current photo on failure and retry by reselecting. Modern photo variants with older-format error fallback.
- Phone-menu Escape/state label; cookie focus return; 58px phone cookie notice; stronger input boundaries; keyboard Map tabs, native quiz answer control and manual Next; keyboard stamp coordinates without changing India’s design.
- Catalogue level/budget/age filters, sorting, visible count and URL persistence; normal catalogue cards, curated home. Generic future-product detail fallback supports optional gallery and existing story data.
- Cart view/removal analytics. No personal form data or stock-request purchase revenue; local previews excluded from Analytics.
- Removed obsolete styles from redirected legacy pages. No public policy identity or unverified box-content facts added.

## Verified
- 43 unit/domain tests pass; lint and TypeScript pass; production build and image/cache-key/performance budgets pass.
- Isolated local Worker integration: server catalogue prices; cart → draft → placed identity and details preserved; later cart cannot overwrite saved request.
- 20 measured product openings: all five × 360×800, 375×812, 390×844, 1440×900. Actual viewport dimensions recorded, full buying buttons visible, image before buying controls, no horizontal overflow.
- All 36 gallery photos loaded; all five viewers closed with Escape and returned focus. Offline gallery retained old photo and counter; retry loaded requested image. Offline checkout retained data and recovered to saved request with reference.
- Full-name Enter focuses mobile without placing a request. All checkout inputs remain optional and have appropriate keyboard/autofill hints.
- Menu Escape returns focus; cookie Escape returns to Cookie choices. Fresh local preference test: cookie notice y778–836, buying button y650–700 at 390×844, no overlap; original local preference restored.
- Catalogue Craft + budget persists after reload. Map arrow-key tabs, native answer control, manual Next, and keyboard Boat stamp at row60/column60 tested. India colours remained fixed; source map data preserved exactly.
- Home phone/laptop visually inspected. Hero 900px variant reduced from 131,074 to 85,228 bytes (35%); 600px from 62,966 to 44,998. Shared CSS reduced from 108,909 to 105,030 bytes; gzip20,032. These are byte measurements, not a claimed 35% LCP improvement.

Evidence: outputs/consequential-fixes-2026-10-16 (ignored local artifacts), including final 20-case opening matrix, gallery checks and phone/laptop screenshots.

## Limits / deferred at owner request
- Legal/trading identity, postal address, public support email and public privacy-policy identity remain unchanged; owner explicitly deferred them.
- Age, build time, size, box contents and functional/safety claims still need owner validation. No invented verified facts.
- Browser device/network emulation used, not physical iPhone/Android keyboard testing. No new customer request was sent to production. External email/Sheet delivery not reconfigured or claimed freshly verified in this UI release.
- No field p75 or real-device INP claim. The source helper will verify/package the final source and publish through Sites.
