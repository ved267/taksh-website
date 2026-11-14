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
];
export function ownerAllowance(baseSha,files,list=OWNER_ALLOWANCES){
 const a=list.find(x=>x.baseSha===baseSha&&files.length>0&&files.every(f=>x.files.includes(f)));
 return a?{name:a.name,js:a.js,css:a.css,worker:a.worker,...(a.aboveCaps?{aboveCaps:a.aboveCaps,routeJs:a.routeJs||0,routeCss:a.routeCss||0}:{})}:null;
}
