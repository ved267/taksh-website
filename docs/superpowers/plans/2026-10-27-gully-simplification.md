# Gully Cricket simplification implementation plan

**Goal:** Execute the approved shorter product page: overview/build explorer and buy box, dusk dialogue, size/disclaimer.
**Architecture:** Gully-specific explorer uses the existing decoded image selection and shared image viewer. An optional initial viewer index defaults to the existing behaviour for other products. Catalogue image and commerce identity stay unchanged.
**Tech stack:** Existing React, TypeScript, CSS, Sites deployment.
**Spec:** User's approved chat decisions of 27 October 2026, superseding the original four-part story brief.

## Constraints
- Original unedited images; Rs 2,999; Ages 8+; About 600 pieces; Craft; single product SKU.
- Default product-page image is gallery-02-five-builds. Home, /sets, bag and social preview retain gallery-01-hero.
- Six build choices in existing order, separate See all five control, all nine original gallery photos accessible.
- Build. Imagine. Create. / One set. Build one at a time.
- Remove golden-hour, window and rules sections. Keep window photo in gallery.
- Maa: “Andar aa jao. Andhera ho gaya.” / Bachche: “Bas ek over aur.”
- Shared buying components and legal disclaimer unchanged.

## Tasks and checks
- [x] Add tested explorer data: overview first; six builds ordered; original gallery and catalogue retain their images.
- [x] Implement responsive explorer in opening, modal access to existing viewer, clean unused CSS, and approved dusk dialogue. Phone title → explorer → facts/price/cart. No autoplay.
- [ ] Verify 390/1440 plus narrow/intermediate widths, image/keyboard/failure/rapid selection, viewer nine photos and focus return, sticky/cart and catalogue integrations. Run npm test, TypeScript and production build; publish with Sites helper.

## Review focus
- Overview is a presentation choice, never another SKU.
- Failed/racing image requests preserve a coherent scene and caption.
- Modal opens the intended image and returns focus to its trigger.
- Mobile purchase action is not displaced by large duplicate sections.
- Other products keep default initial image and shared buying behaviour.

## Execution notes
Existing authorized Sites checkout reused; Sites helper owns commit/push/package. User explicitly requested execution, so no additional approval gate. Final review will use an independent reviewer as required by executing-plans.

Validation completed: 50 tests, TypeScript, production build, image identity, browser QA and independent review pass. Publication pending packaging. Detailed evidence is in docs/gully-cricket-implementation.md and outputs/gully-cricket-simplified/.
