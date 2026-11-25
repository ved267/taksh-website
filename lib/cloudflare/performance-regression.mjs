export function performanceRegressions(base,current,{workerAllowance=0,tracking=false,owner=null}={}){
 if(owner&&!owner.aboveCaps&&(owner.js>600||owner.css>300||owner.worker>1000))throw new Error('Owner allowance above the 9 Nov caps.');
 const js=tracking?1000:owner?.js||0,css=owner?.css||0,worker=tracking?1200:Math.max(workerAllowance,owner?.worker||0);
 if(![0,256].includes(workerAllowance))throw new Error('Unsupported Worker allowance.');
 const failures=[];
 const routeJs=owner?.aboveCaps?owner.routeJs||0:0,routeCss=owner?.aboveCaps?owner.routeCss||0:0;
 for(const key of ['jsGzip','cssGzip','workerGzip']){if(!Number.isFinite(base.totals?.[key])||!Number.isFinite(current.totals?.[key]))failures.push(`Missing ${key}`);else if(current.totals[key]>base.totals[key]+(key==='workerGzip'?worker:key==='jsGzip'?js+routeJs:css+routeCss))failures.push(`${key}: ${base.totals[key]} -> ${current.totals[key]} bytes`);}
 for(const [route,metrics]of Object.entries(base.pages||{}))for(const [key,value]of Object.entries(metrics).filter(([key])=>['jsGzip','cssGzip','pageBytes'].includes(key))){const next=current.pages?.[route]?.[key];if(!Number.isFinite(next))failures.push(`Missing ${route} ${key}`);else if(next>value+(key==='cssGzip'?css:js))failures.push(`${route} ${key}: ${value} -> ${next} bytes`);}
 return failures;
}

// One requested backend-security addition, not a general performance tolerance.
// It expires automatically once main advances beyond this exact baseline.
export function adminSecurityAllowance(baseSha,files){
 const allowed=new Set(['app/api/admin/login/route.ts','lib/admin-access.mjs','lib/server.ts','scripts/set-private-setting.mjs','scripts/test-local.mjs','tests/admin-access.test.mjs','tests/admin-lockout.integration.mjs','docs/ARCHITECTURE.md','docs/OPERATIONS.md','lib/cloudflare/performance-regression.mjs','scripts/check-main-performance.mjs','scripts/compare-performance.mjs','tests/performance-regression.test.mjs','lib/cloudflare/main-baseline.mjs','tests/main-baseline.test.mjs','.github/workflows/validate.yml']);
 return baseSha==='171ff74380e4cc41aa145ff4766b1e2ba4f9621b'&&files.length>0&&files.every(file=>allowed.has(file))?256:0;
}

// Approved by the owner on 7 November 2026: Meta Pixel, Clarity and server-side Meta events add about 0.5 KB gzip of
// public JavaScript. This is one exact baseline and one exact file set, capped at 1,000 bytes per page (CSS stays strict)
// and 1,200 compressed Worker bytes. It expires as soon as main advances past this commit.
export function trackingAllowance(baseSha,files){
 const allowed=new Set(['.env.example','app/[info]/page.tsx','app/api/checkout/route.ts','cloudflare-env.d.ts','components/taksh/analytics-consent.tsx','components/taksh/checkout.tsx','lib/shop.ts','lib/tracking-domain.mjs','lib/tracking.ts','lib/meta-capi.mjs','tests/meta-capi.test.mjs','tests/tracking-lifecycle.test.mjs','tests/performance-regression.test.mjs','lib/cloudflare/performance-regression.mjs','scripts/check-main-performance.mjs','scripts/compare-performance.mjs']);
 return baseSha==='a75391e5bcb8a626ca15993491d54eb6dda562fa'&&files.length>0&&files.every(file=>allowed.has(file));
}

// Owner approval, 9 November 2026 (job 2026-11-09-04): "Do the rest. For the rest, I approve everything you say."
// Each entry is one exact main commit and one exact file set, capped at 600 gzip JS bytes per page, 300 CSS
// and 1,000 Worker bytes. An entry expires as soon as main advances past its commit. Never a general tolerance.
// PR builds measure the Worker up to about 50 gzip bytes larger than main builds of the same source (known quirk).
export const OWNER_ALLOWANCES=[
 {name:'phone speed (AVIF manifest entries, photo warming, early Add to bag); images about 500 KB lighter',baseSha:'0d84bf168599bf0ce2071404d407bd7e39c20a36',js:600,css:0,worker:1000,files:['components/taksh/chandrayaan.tsx','components/taksh/home-hero.tsx','components/taksh/nonsense.tsx','components/taksh/product-photo.tsx','components/taksh/set-buy-box.tsx','components/taksh/set-gallery.tsx','lib/cloudflare/performance-regression.mjs','lib/early-interaction.mjs','lib/image-assets.json','scripts/prepare-assets.mjs']},
 {name:'clarity copy (in the box, sizes, checkout result)',baseSha:'08fd6d5566b8415a4270d06ae725f842ce046ed8',js:600,css:0,worker:1000,files:['components/taksh/bharat.tsx','components/taksh/chandrayaan.tsx','components/taksh/checkout.tsx','components/taksh/gully-cricket.tsx','components/taksh/home-hero.tsx','components/taksh/nonsense.tsx','components/taksh/ram-mandir.tsx','components/taksh/set-buy-box.tsx','components/taksh/shell.tsx','components/taksh/yellow-taxi.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/shop.ts','public/bharat-make-it-yours.html','public/bharat-map.html','scripts/copy-baseline.json','scripts/lint-copy.mjs','scripts/token-baseline.json','tests/standards.test.mjs']},
 {name:'bot-proof counting',baseSha:'956424019d4ede18df165b20239319a2c7dfa37d',js:600,css:0,worker:1000,files:['app/api/cart/route.ts','app/api/checkout/route.ts','lib/bot-domain.mjs','lib/demand-domain.mjs','lib/tracking.ts','scripts/google-report.mjs','tests/bot-domain.test.mjs','tests/demand.integration.mjs','tests/staging-robots.test.mjs','workers/app.ts','lib/cloudflare/performance-regression.mjs']},
 {name:'auto-merge pipeline (Worker build quirk only)',baseSha:'5e4ee3456b8ea05a9d7ca3e908022bac9fc7b64b',js:0,css:0,worker:50,files:['.github/workflows/auto-merge.yml','AGENTS.md','docs/OPERATIONS.md','scripts/auto-merge.mjs','scripts/check-links.mjs','tests/auto-merge.test.mjs','lib/cloudflare/performance-regression.mjs','scripts/check-main-performance.mjs','scripts/compare-performance.mjs','tests/performance-regression.test.mjs']},
 // Owner approval, 13 November 2026 (Taksh chat, "approve and go on"): a one-off allowance above the 9 Nov caps for the
 // Padma page, the first new product since the gate. One exact base commit and file set; it expires when main advances.
 // js/css apply to every page; routeJs/routeCss are the Padma page's own code and styles, loaded only on /sets/padma, and count in the totals only.
 {name:'Padma lotus set page (new product: catalogue entry, image list, page colour tokens, page code)',baseSha:'9da21d61fb2192a7ff2a79af0b6fcb73bf7265fd',js:1700,css:150,routeJs:2100,routeCss:1100,worker:8000,aboveCaps:'Owner approval, 13 Nov 2026 (Taksh chat): approve and go on',files:['app/globals.css','app/page.tsx','app/sets/[slug]/page.tsx','components/taksh/padma.css','components/taksh/padma.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/image-assets.json','public/padma/banner-born-of-mud.webp','public/padma/day-1.webp','public/padma/day-2.webp','public/padma/day-3.webp','public/padma/day-4.webp','public/padma/day-yours.webp','public/padma/gallery-01-hero.webp','public/padma/gallery-02-heart.webp','public/padma/gallery-03-gold-seat.webp','public/padma/gallery-04-at-home.webp','public/padma/gallery-05-gift.webp','public/padma/gallery-06-size.webp','public/sitemap.xml','scripts/prepare-assets.mjs','tests/levels.test.mjs','tests/performance-regression.test.mjs']},
 // Owner approval, 13 Nov 2026 (Taksh chat, "approve 400"): Padma self-audit. Client JS and CSS shrink and the server files shrink (local build: Worker 412.17 -> 412.00 KiB),
 // but the PR build measures the Worker 297 B larger than main (the known quirk above). Worker-only, JS and CSS stay strict; expires when main advances.
 {name:'Padma page sharper (smaller JS, CSS and catalogue; Worker build quirk only)',baseSha:'82e42b5135fe6e8a0387e0ed21bbac7fea44b5bb',js:0,css:0,worker:400,files:['components/taksh/padma.css','components/taksh/padma.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs']},
 // Owner approval, 14 November 2026 17:47 IST (Taksh chat, "publish to live", after the numbers were shown): Padma review round.
 // Measured on the PR: total JS +38 B and CSS +91 B gzip (buy buttons at the Yours step and after the verse, square phone gallery); no page grows. Expires when main advances.
 {name:'Padma review round (bonding copy, Gita 5.10 verse, gift photo removed, buy buttons)',baseSha:'a1a4e6a13d86d8d95b5b1f83acc40966833d40d6',js:100,css:150,worker:400,files:['components/taksh/padma.css','components/taksh/padma.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/image-assets.json','public/padma/gallery-05-gift.webp']},
 // Owner approval, 14 November 2026 17:47 IST (Taksh chat, "publish to live", after the numbers were shown): 1983 Trophy, a new product page.
 // Measured on the PR against main 9965d87: totals JS +2649, CSS +1059, Worker +3686 gzip; every page about +642 B JS (catalogue entry, page bytes up to +823 on /sets).
 // Worker raised from 3500 to 3800 on owner approval, 14 November 2026 (Taksh chat: "Approve 3,800", after the +3,686 B measurement was shown).
 // routeJs/routeCss are the 1983 page's own code and styles, loaded only on /sets/1983-trophy, and count in the totals only. Expires when main advances.
 {name:'1983 Trophy set page (new product: catalogue entry, image list, page code and styles)',baseSha:'9965d87ec9f09d81810f2f3289012d514b2fc957',js:900,css:0,routeJs:1900,routeCss:1200,worker:3800,aboveCaps:'Owner approval, 14 Nov 2026 (Taksh chat): publish to live; Worker 3,800 approved after measurement',files:['app/page.tsx','app/sets/[slug]/page.tsx','components/taksh/trophy-1983.css','components/taksh/trophy-1983.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/image-assets.json','public/1983-trophy/banner-thank-you.webp','public/1983-trophy/gallery-01-hero.webp','public/1983-trophy/gallery-02-plaque.webp','public/1983-trophy/gallery-03-on-desk.webp','public/sitemap.xml','scripts/prepare-assets.mjs','tests/levels.test.mjs']},
 // Owner approval, 19 Nov 2026 (Taksh chat, "go"): Surajmukhi set page, PR #28, measured against 772beee: every page at most +772 B JS
 // (+935 page bytes; catalogue entry and image list), totals JS +2,983, CSS +1,161, Worker +3,482. routeJs/routeCss are the page's own
 // code and styles, loaded only on /sets/surajmukhi, and count in the totals only. Expires when main advances.
 {name:'Surajmukhi set page (new product: catalogue entry, image list, page code and styles)',baseSha:'772beee831b22f8223c98c288cfb73bfc44401bf',js:1000,css:0,routeJs:2100,routeCss:1200,worker:3600,aboveCaps:'Owner approval, 19 Nov 2026 (Taksh chat): go on the measured numbers; Worker 3,600 after the re-measure',files:['app/page.tsx','app/sets/[slug]/page.tsx','components/taksh/surajmukhi.css','components/taksh/surajmukhi.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/image-assets.json','public/sitemap.xml','public/surajmukhi/banner-at-home.webp','public/surajmukhi/day.webp','public/surajmukhi/gallery-01-hero.webp','public/surajmukhi/gallery-02-heads.webp','public/surajmukhi/gallery-03-at-home.webp','public/surajmukhi/night.webp','scripts/prepare-assets.mjs','tests/levels.test.mjs']},
 // Owner approval, 20 Nov 2026 16:45 IST (Taksh chat, "Please publish it", after seeing the measured numbers): Surajmukhi gallery 3 -> 6
 // and copy, PR #29, measured against a20fc18: every page at most +238 B JS (+242 page bytes; three image-list entries), totals JS +429,
 // Worker +583, CSS unchanged. Within the 9 Nov caps. Expires when main advances.
 {name:'Surajmukhi gallery and copy (three image-list entries)',baseSha:'a20fc18e2c88d67499c51d424c9ae5e729e4dfb2',js:500,css:0,worker:700,files:['components/taksh/surajmukhi.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/image-assets.json','public/surajmukhi/gallery-04-back.webp','public/surajmukhi/gallery-05-joining.webp','public/surajmukhi/gallery-06-building.webp']},
 // Owner approval, 24 Nov 2026 09:28 IST (Taksh chat, "approve the Kamdhenu speed numbers"): Kamdhenu set page, PR #33, measured
 // against 9b008b4 at 23e8408: every page at most +912 B JS and +40 B CSS (three colour tokens), +1,114 page bytes on /sets (new card),
 // totals JS +2,876, CSS +1,238, Worker +3,809 (quoted to the owner as about 3.6 KB before the last text and photo changes; told after).
 // routeJs/routeCss are the page's own code and styles, loaded only on /sets/kamdhenu, and count in the totals only. Expires when main advances.
 {name:'Kamdhenu set page (new product: catalogue entry, image list, colour tokens, page code and styles)',baseSha:'9b008b4e3d0f9bea6d041a3ea4651e590c2c9694',js:1150,css:60,routeJs:1800,routeCss:1200,worker:3850,aboveCaps:'Owner approval, 24 Nov 2026 (Taksh chat): approve the Kamdhenu speed numbers',files:['app/globals.css','app/sets/[slug]/page.tsx','components/taksh/kamdhenu.css','components/taksh/kamdhenu.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/image-assets.json','public/kamdhenu/banner-pichwai.webp','public/kamdhenu/gallery-02-mandir.webp','public/kamdhenu/gallery-03-new-home.webp','public/kamdhenu/gallery-04-childs-room.webp','public/kamdhenu/gallery-05-head.webp','public/kamdhenu/gallery-06-size.webp','public/kamdhenu/gallery-07-festive.webp','public/sitemap.xml','scripts/prepare-assets.mjs','tests/levels.test.mjs']},
 // Owner approval, 25 Nov 2026 (Taksh chat, on the measured number): the prefetch/missing-language fix,
 // PR #38. Measured against main 834b561: Worker +10 gzip bytes, JS, CSS and every page byte-identical
 // (the Worker is the only bundle lib/bot-domain.mjs reaches). Approved up to 60 Worker bytes for this PR
 // only; it expires as soon as main advances past this commit.
 {name:'prefetch and missing Accept-Language never mark a visitor as a bot (server-side only)',baseSha:'834b56179095f31fd4cc76804d65fc0432fea610',js:0,css:0,worker:60,files:['docs/ARCHITECTURE.md','docs/OPERATIONS.md','lib/bot-domain.mjs','lib/cloudflare/performance-regression.mjs','tests/bot-domain.test.mjs','tests/staging-robots.test.mjs','workers/app.ts']},
 // Owner approval, 25 Nov 2026 (Taksh chat, on the measured number: "Yes, make it live"): Surajmukhi phone layout, PR #34.
 // Measured against main d445d65: CSS +22 gzip bytes, JS +3, Worker +10, page bytes +6 to +9 on every page (one CSS
 // line puts the buy column back into the shared phone grid). Approved up to 30 CSS, 10 JS/page and 60 Worker bytes for
 // this PR only; it expires as soon as main advances past this commit.
 {name:'Surajmukhi phone layout (buy column joins the phone grid)',baseSha:'d445d65fa0db829ed9f7806fd0dc98e964f2327e',js:10,css:30,worker:60,files:['components/taksh/surajmukhi.css','lib/cloudflare/performance-regression.mjs']},
 // Owner approval, 25 Nov 2026 (Taksh chat, "approve all go ahead"): site-wide polish, PR #43 (₹ prices, footer Help and
 // Privacy links, Privacy page without placeholders, shorter added-to-bag pop-up, WhatsApp text). Measured against main
 // b4dabf9: Worker +286 gzip bytes (server-rendered text only); JS, CSS and every page unchanged or lighter. Approved up to
 // 350 Worker bytes for this PR only; it expires as soon as main advances past this commit.
 {name:'site-wide polish (₹, footer links, Privacy without placeholders, bag pop-up)',baseSha:'13137b60d287d16832312157cf71f85208b9e142',js:0,css:0,worker:350,files:['app/[info]/page.tsx','components/taksh/catalogue.tsx','components/taksh/shell.tsx','components/taksh/store.tsx','lib/shop.ts','lib/cloudflare/performance-regression.mjs']},
 // Owner approval, 25 Nov 2026 (Taksh chat: "Approve" on the homepage numbers, "Approve both" on server size, then
 // "approve all go ahead"): homepage update, PR #41 (brand-line headline, hero moving through all 10 sets with progress bars
 // and pause, promise strip, Why Taksh, every set in the grid with sideways rows on phones, card line + pieces).
 // Measured against main d445d65 before the card line: home +1,383 JS gzip and +4,284 page bytes; other pages about +310 JS
 // and +493 CSS gzip; Worker +2,007. Approved: home up to +1.6 KB JS and +5 KB page bytes, other pages up to +0.4 KB JS and
 // +0.6 KB CSS, Worker up to +2.3 KB. The page-byte check shares the JS cap, so js is set to the 5 KB home download figure.
 // routeJs 0: the home code counts in the per-page cap. Expires as soon as main advances past this commit.
 {name:'homepage update (brand line, moving hero, promise strip, Why Taksh, every set)',baseSha:'a507f2dade3ec163ae094f3d19e988d5d8cbf777',js:5000,css:600,routeJs:0,routeCss:0,worker:2300,aboveCaps:'Owner approval, 25 Nov 2026 (Taksh chat): approve the homepage speed numbers',files:['app/home-storefront.css','app/page.tsx','components/taksh/cards.tsx','components/taksh/home-hero.tsx','scripts/token-baseline.json','lib/cloudflare/performance-regression.mjs']},
 // Owner approval, 25 Nov 2026 (Taksh chat: "Approve" on the set-page numbers, "Approve both" on server size, "Approve" on
 // +3.3 KB for the five pages that gain Size and space): set-page endings, PR #42 (Size and space on five pages, closing
 // line + Add to bag, "Build another." with three sets, server-rendered). Measured against main d445d65: set pages +368 JS
 // gzip (+602 Ulta Chashma), +612 CSS, +2.1 KB page bytes (+3.2 KB on pages with the Size block); other pages +75 JS;
 // Worker +2,478. Approved: up to +0.6 KB JS, +0.62 KB CSS, +3.3 KB page bytes, Worker +2.8 KB. The page-byte check shares
 // the JS cap, so js is set to 3,300. Expires as soon as main advances past this commit.
 {name:'set-page endings (Size and space, closing line, Build another)',baseSha:'53060740f571cc40c0922a4d94a26211cd1a0c37',js:3300,css:620,routeJs:0,routeCss:0,worker:2800,aboveCaps:'Owner approval, 25 Nov 2026 (Taksh chat): approve the set-page ending speed numbers',files:['app/sets/[slug]/page.tsx','app/sets/gully-cricket/page.tsx','components/taksh/nonsense.tsx','components/taksh/set-ending-button.tsx','components/taksh/set-ending.css','components/taksh/set-ending.tsx','lib/cloudflare/performance-regression.mjs']},
];
export function ownerAllowance(baseSha,files,list=OWNER_ALLOWANCES){
 const a=list.find(x=>x.baseSha===baseSha&&files.length>0&&files.every(f=>x.files.includes(f)));
 return a?{name:a.name,js:a.js,css:a.css,worker:a.worker,...(a.aboveCaps?{aboveCaps:a.aboveCaps,routeJs:a.routeJs||0,routeCss:a.routeCss||0}:{})}:null;
}
