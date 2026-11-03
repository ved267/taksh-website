# Taksh checkout records and measurement

Google Analytics account, property and web stream: Taksh, https://taksh.store. Measurement ID: G-NHQFYHTNLP. Stream ID: 16104950538. The owner has administrator access. Optional Google emails are disabled for this property.

Owner update (15 October 2026): analytics is enabled by default until a visitor chooses Essential only or switches Analytics off. Existing dated opt-outs and legacy `deny` preferences remain off. A compact notice offers Essential only and OK; Cookie choices in the footer opens a small settings dialog. Essential cart/checkout storage stays on and advertising stays disabled. Dated preferences use purpose version 1; merely visiting does not fabricate a saved decision. Other open tabs reload when the preference changes. Withdrawal clears Analytics cookies and reloads without the tag. Google signals, advertising personalization and Meta Pixel remain disabled.

Measured events:
- page_view: one per route change; only known page paths, no query strings or fragments.
- view_item: catalogue item on a product page, deduplicated per page view.
- add_to_cart: actual quantity added and catalogue price, subject to the existing quantity limit.
- begin_checkout: once the checkout draft is successfully persisted, including catalogue items.
- generate_lead: only after the completed request is persisted. Selection value uses selection_value, not purchase revenue. This is a stock-update request, not a paid purchase. Reopening confirmation does not resend it.

Analytics event data excludes names, contact details, addresses, order references and arbitrary client-provided properties. Customer records remain in D1 behind existing owner authentication. Referrer is limited to its origin. No abandoned form-field collection or session recording is implemented. Draft checkout persists the cart; contact details are saved on submission, not every keystroke.

Owner access: /admin, using the previously configured owner password. Submitted requests, draft carts, customer-supplied details, selected items, quantities, selection value, time and campaign fields are visible after sign-in. Download CSV uses the authenticated existing /api/admin/export?kind=orders endpoint. No public navigation link is added. The admin route is marked noindex and is excluded from Analytics. No password was changed.

Validation: tests/tracking.test.mjs checks catalogue pricing, items schema, removal of contact data, query stripping, consent gating, dropped pre-consent actions and duplicate prevention. Existing order/bag tests cover server-side item resolution, optional contact validation and CSV formula neutralization. Check live receipt separately in Google Analytics Realtime after publication; unit tests do not prove Google received events.

Live verification (11 October 2026): Google confirms the website tag is installed. The browser loads the tag and queues the expected commands, but neither the live site nor a separate minimal standard-tag diagnostic produced received events in this browser. Analytics Realtime remains empty; event delivery is unresolved, and installation alone is not completion.

The generate_lead event is marked as a key event, with no default monetary value. A clearly labelled live test request, TK-261011-68F64C41, persisted its test contact details, Ram Mandir quantity 1 and total Rs 7,499 in D1; the bag cleared after submission. It is test data, not a customer order.

Meta is signed in, but Web tracking is disabled for the existing personal ad account and no Taksh business portfolio exists yet. The portfolio form is prepared with the name Taksh. The owner must supply their contact information and complete creation, including Meta's Commercial Terms, before a Taksh dataset/Pixel can be created. No Meta Pixel ID has been assigned, no Meta script is loaded, and no unrelated personal account was renamed.

Remaining setup: resolve and verify actual Google event receipt; finish the Taksh Meta business portfolio and website dataset; verify the authenticated owner dashboard with the existing owner password. Full privacy legal/business fields and email confirmations remain separate configuration work. Full funnel measurement does not require sending customer contact details or weakening owner authentication.

Audit update (15 October 2026): Google Analytics Home for Taksh showed 3 active users, 11 events, 3 views and 0 key events over its last-seven-days window. Historical receipt is now verified; the complete lead funnel is not yet proven received. The audit browser loaded the script and queued commands but created no Analytics cookies or collect resources during observation. Do not equate script installation with live delivery from every browser. Customer Sheet status was freshly synced on 15 October 2026. The initial audit release used opt-in analytics; the later owner update above changes the default and shrinks the panel. Business/legal placeholders remain unresolved and need owner-supplied details.
