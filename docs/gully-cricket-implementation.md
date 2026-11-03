# Gully Cricket product page

Implemented from the owner's final brief, 25 October 2026.

- Route: `/sets/gully-cricket`; price Rs 2,999; ages 8+; about 600 pieces; Craft.
- All 17 original PNGs come from the top level of `/Users/devanshsmac/Desktop/Gully Cricket/page-images/final/`. No subfolder assets are included. SHA-256 source fingerprints are in `tests/fixtures/gully-image-hashes.json`.
- The existing gallery/viewer, buy box, quantity/cart button, shipping/returns disclosure, WhatsApp link, size block, header and footer are reused without editing those shared components.
- The six build choices stay in the approved order, with Terrace House initially selected, no autoplay, arrow/Home/End keyboard control, decoded image changes and stable image/caption space. They are scenes of one SKU, not individual products.
- The four story parts remain separate and in the requested order. Both full-width banners are retained. On phone the entire banner precedes its copy; desktop copy sits in the supplied empty wall area.
- Design additions: a chalk-like underline on Yours, a brief image fade that respects reduced motion, and a scoped two-column phone facts layout. The existing sticky bar yields when it would overlap the phone tab row.
- No approved words, numbers, story parts or images were cut or replaced. Line breaks and the three rule lines are presentation only.
- The existing catalogue supplies the two requested new cards; Gully Cricket is first in Craft. The existing five product records and the home featured slider are unchanged.
- The product uses normal catalogue/cart/checkout analytics. The earlier unpublished concept/enquiry implementation was retired.
- Image delivery intentionally bypasses resizing/recompression for these 17 images, including thumbnails, as explicitly required. Content-hashed URLs preserve exact original bytes. Existing product image budgets remain enforced; Gully Cricket has an explicit identity/full-resolution check instead. Responsive thumbnail derivatives would be the next improvement only with owner permission.

Validation evidence and screenshots are saved in `outputs/gully-cricket-2026-10-25/`. Browser viewport testing is not a physical iPhone or Android test.

## Self-audit, 27 October 2026

- Compared the live hero's SHA-256 with the approved master: identical. Its misleading intrinsic width came from advertising the same full PNG under multiple responsive width descriptors. Gully originals now use their single original URL without a fictitious srcset. Other products' candidate lists are regression-tested unchanged.
- Observed build switching under 1,200 ms latency and 250,000 bytes/sec download: the existing loading status occupied only 1 × 1 px. Gully now gives the requested tab a dashed busy border and displays the shared loading/error status over the retained image, without changing the panel height. Clicking the already-selected, idle scene avoids a redundant request.
- Gully story images now start loading 800 px before entering view, at low priority. The hero retains priority. This improves download lead time without changing any image bytes or shared components; it does not reduce the full-resolution payload.
- Browser verification: six widths (320, 390, 768, 820, 1024, 1440), nine gallery images, both banners, all six builds at phone/laptop widths, keyboard navigation, slow-network feedback, blocked-image preservation and successful retry. No production cart or customer details were changed.
- Approved words, order, facts, images, shared components and existing products remain unchanged. Evidence: `outputs/gully-cricket-self-audit/`.

## Approved simplification, 27 October 2026

This revision supersedes the original four-part story layout above, following the owner's subsequent comments and execution approval.

- Opening: five-build overview selected by default, six build choices beside the existing buy box on desktop. Phone order is title, explorer, facts, price/quantity, cart. “See all five” restores the overview; “View all photos” opens the original nine-photo viewer at the overview. Individual builds open a single-image enlargement.
- Removed the golden-hour banner, window story, standalone rules and duplicate lower-page explorer. The window remains in the nine-photo gallery. No image files were edited or removed.
- Retained the dusk banner, exact size/legal copy, shared buying controls and closing brand band. The home and /sets cards remain first in Craft and retain the Terrace House hero. Bag and social preview also retain that single-build image.
- New overview line: “Build. Imagine. Create.” Kept “One set. Build one at a time.”
- Yours caption changed from “Every piece, every player, and no instructions. What will you build?” to “The next build is yours to imagine.”
- Dusk text changed from “The light is going, someone's mother is calling, and the score is level. One more over.” to the approved dialogue: Maa: “Andar aa jao. Andhera ho gaya.” Bachche: “Bas ek over aur.”
- The buy-box description, facts, prices, scene captions other than Yours, and disclaimer were not reworded.
- Shared viewer exported for reuse; optional initial image index defaults to zero for existing galleries. Single-image viewers now announce “Press Escape or Close to return.” rather than describing unavailable arrow navigation. No other product layout changed.

### Validation

- 50 unit tests pass; TypeScript no-emit check passes; production build and performance budgets pass. All 17 original image fingerprints and full-resolution dimensions remain intact.
- Browser widths checked: 320, 390, 768, 1024 and 1440 px, no document overflow. Visual screenshots reviewed at 390 and 1440 px, opening and dusk ending. This is browser emulation, not physical-phone testing.
- Six build choices, stable stage height, Home/arrow keys, overview reset, individual enlargement, all nine gallery photos, next/previous, phone touch swipe, Escape/close and trigger focus return pass.
- Blocked Chai Corner request preserves the previous overview and caption, with visible error. Rapid changes with 800 ms network latency and 1,000,000 bytes/sec bandwidth finish on the last selected Yours scene. Network overrides restored afterward.
- Phone sticky cart visually clear of explorer; local Add to Cart/bag shows GULLY-CRICKET, Rs 2,999, quantity 1 and original Terrace House hero. Test bag item removed. No customer submission or production bag modification.
- Home and /sets show Gully Cricket immediately before Yellow Taxi and Nonsense. Yellow Taxi still defaults to its first photo; its viewer navigation works.
- Independent final review found no release blocker. Minor single-image accessibility wording finding fixed and retested.
- Evidence: `outputs/gully-cricket-simplified/` (screenshots, tests and build logs). Publication follows these checks through the existing Sites project; deployment identity is recorded separately in that evidence directory.

## Featured discovery and explorer refinement — 27 October 2026

Follow-up comments requested a larger explorer, more obvious controls, home featured presence, improved typography, size imagery and a message about creating beyond the five guided builds.

- Added Gully Cricket to the separate home featured selector, immediately before Yellow Taxi. Existing first/default Map of India is retained. Six desktop controls, three tablet columns and wrapping phone controls. Gully's original Terrace House image is contained without cropping.
- Product title and facts now span the opening. The explorer occupies the wide left area, with a compact 250–300px buying column. The explorer's image is contained in a bounded stage; all six numbered choices appear above it under “Build it your way.” / “Choose a build to explore.” Controls use explicit borders, selected colour, arrows and keyboard focus.
- The visible and accessible sixth choice is “Create your own.” Its scene and original viewer label remain Yours. Facts now say “5 guided builds + your own ideas”; “One set. Build one at a time.” remains below the image.
- Approved Hindi dialogue words are unchanged. Georgia italic gives the spoken lines a separate, warmer reading voice; the children's reply is larger and slightly indented. No new font download.
- Added the approved dimensions image beside the size copy (stacked on phone), unedited and uncropped. Legal text and product numbers unchanged.
- Added bounded decoded-image request reuse and preload on hover/focus/touch intent. Failed preloads can retry. Cache identity includes viewport width and pixel density, preventing low-resolution URL reuse after resize in shared responsive galleries.
- Faster display derivatives were requested from the owner because the prior original-only instruction remains active. Approval had not arrived at implementation time. No display derivatives were created. Each switch original remains approximately 1.14–1.41 MiB: cold first-click transfer on slow connections remains a limitation, not a completed performance fix.

Validation: 53 tests and TypeScript pass. Browser widths 320, 390, 768, 1024, 1440 have no document overflow; keyboard/selected state, original photo viewer, home selector price/link/image fit and dimensions image inspected. Independent review issues (responsive cache identity and accessible button label) fixed. Evidence in `outputs/gully-cricket-refinement/`. No physical device testing or live customer submission.

## 27 October — visual correction and approved display optimisation

User rejected the version 55 opening and approved smaller display copies while retaining originals in the viewer. Replaced the full-width title plus boxed controls with a photograph-led 65/35 opening, a cohesive purchase column, and six visual thumbnail choices below the photograph. Removed numbered controls/arrows and excessive caption spacing; kept the five-build overview as default. Copy changed from “Build it your way.” / “Choose a build to explore.” to “Build. Imagine. Create.” / “Explore five builds. Imagine your own.” Product description, facts, price, original disclaimer and approved dialogue stay intact. Home selector and catalogue integration remain intact.

Generated responsive WebP display files for all 17 Gully images without cropping or changing source files. Full-screen Gully gallery and build zoom explicitly select content-addressed original PNGs; initial viewer image and next/previous all preserve original bytes. Display sizes use actual responsive candidates. Six 900px switch images measure 57,968–92,074 bytes versus 1,193,027–1,481,103 bytes originally (about 94–96% less). Six 1200px copies are 90,182–141,118 bytes. Existing image families are unchanged.

Validation: 53 unit tests, TypeScript, production build and performance budgets passed. All 17 source hashes and retained viewer originals passed byte-integrity checks. Browser checks: all nine viewer images loaded original PNGs at natural resolution with no responsive substitution; all six build buttons worked, Home keyboard navigation worked, explorer height stayed identical for all six at 390px. No horizontal overflow at 320, 390, 768, 1024 or 1440px. Desktop and phone screenshots inspected. Cold Chai Corner switch after hydration took 707ms under simulated 1.5Mbps/150ms latency with browser cache disabled; this is an indicative local test, not a real-device field result. Initial development-page throttling delayed hydration and a click did not fire; network was restored and the isolated switch test repeated after hydration. No physical-device or full cold production navigation claim. All temporary network overrides restored.


## 29 October — home slider image correction

At the user's request, the Gully Cricket featured slide now uses gallery-02-five-builds.png, matching the product-page overview. Updated its alt text to describe the five alternative builds and one-at-a-time constraint. Retained responsive display variants and contain fit. Product cards keep the Terrace House hero; other slides and the default featured selection are unchanged.
