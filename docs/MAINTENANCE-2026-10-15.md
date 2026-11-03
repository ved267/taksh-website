# Maintenance release — 15 October 2026

## Scope and decisions

Repair the audit's code-maintenance findings and upgrade affected dependencies while preserving the existing five products, prices, checkout and customer-request storage. The owner explicitly chose analytics ON by default, with visitor opt-out. The cookie interface is compact; essential cart storage remains on and advertising remains disabled. Existing dated opt-outs and the legacy `deny` preference remain off. No saved choice is invented just because someone visits.

## Repairs

- Added explicit database, checkout response, item and contact-detail types; removed explicit `any` annotations from application code and caught errors as `unknown`.
- Changed bag hydration to a shared browser-storage subscription. Same-tab and cross-tab changes update React from one snapshot; rapid additions read the latest snapshot and do not rely on stale component state. Blocked storage still permits an in-memory bag.
- Initial owner-dashboard loading uses an abortable request; closed/unmounted pages do not receive its updates. Checkout effect dependencies and image fallback cleanup are explicit.
- Native image components use the existing build-generated responsive image loader. Next's alternative image-service suggestion is disabled only for these components; other accessibility and lint rules remain enabled. Alt text is now an explicit required ProductPhoto prop.
- Google tag bootstrap retains its required Arguments queue, with one documented rule exception. The queue and all analytics payloads remain typed; no contact details enter Analytics.
- Updated Next/React/RSC, Vite/Vinext, Cloudflare tooling/types, Sharp and affected transitive packages. The old esbuild utility receives a compatible patched esbuild override; fflate uses the patched 0.8.3 API.
- New Vite configuration import syntax avoids the deprecated native-loader warning.

## Remaining upstream advisory — explicitly retained

The final full npm scan reports **8 high package flags**, all tracing to **one underlying advisory**, GHSA-vfj7-8cjw-p6xm, in braces 3.0.3. There is no published patched braces release as of this check. The production-only npm dependency scan reports zero flags; that classification is not an independent security audit of the deployed bundle.

A repeatable local mitigation is applied by `scripts/harden-build-dependencies.mjs` after every clean installation. It validates the expected upstream version/source and rejects parser or AST nesting beyond 128 levels before recursive walkers run. It also bounds AST node count and rejects cyclic/repeated nodes. Tests first reproduced stack overflow in the unpatched library, then passed with the mitigation while ordinary nested globs still expanded correctly. Reinstallation re-applied the mitigation successfully.

The npm advisory is deliberately not suppressed. Upgrade and remove the temporary mitigation once upstream publishes a compatible fix. Do not use npm audit's suggested downgrade to an obsolete framework solely to erase the report.

Primary advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

## Verification record

- 39 automated tests pass, including analytics default/opt-out and build-pattern safety regressions.
- Full lint: zero errors, zero warnings (`--max-warnings 0`).
- Type checking passes.
- Production build and image/CSS budgets pass. CSS is approximately 109 KB uncompressed, 20.5 KB gzipped; product thumbnail rows remain below 80 KB.
- Final phone/laptop browser and local checkout checks are recorded with the release artifacts in outputs/maintenance-2026-10-15.
- No production test request, customer message, payment or database migration is needed for these changes.

This maintenance release does not resolve the separate roadmap items: reusable 12-product detail template, actual business/privacy details, mirrored-record deletion, end-to-end Analytics receipt, and email notification delivery.

Final browser checks passed: repeated additions survived reload, invalid supplied email was rejected, blank optional contact/address fields submitted successfully, the bag cleared, and another tab reflected both addition and removal. Sixteen width checks (eight pages at 375 and 1440 pixels) had no sideways overflow. The fresh-visit notice measured 84.8 pixels tall on a 375×812 viewport. Default-on loaded one Google tag; Essential only saved a dated false preference and reloaded with zero Google tags; re-enabling restored one tag. These checks establish local behavior, not GA server receipt. Two isolated local test requests were created across API and UI integration; none were created in production.
