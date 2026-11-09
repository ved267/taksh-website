export function performanceRegressions(base,current,{workerAllowance=0,tracking=false,owner=null}={}){
 if(owner&&(owner.js>600||owner.css>300||owner.worker>1000))throw new Error('Owner allowance above the 9 Nov caps.');
 const js=tracking?1000:owner?.js||0,css=owner?.css||0,worker=tracking?1200:Math.max(workerAllowance,owner?.worker||0);
 if(![0,256].includes(workerAllowance))throw new Error('Unsupported Worker allowance.');
 const failures=[];
 for(const key of ['jsGzip','cssGzip','workerGzip']){if(!Number.isFinite(base.totals?.[key])||!Number.isFinite(current.totals?.[key]))failures.push(`Missing ${key}`);else if(current.totals[key]>base.totals[key]+(key==='workerGzip'?worker:key==='jsGzip'?js:css))failures.push(`${key}: ${base.totals[key]} -> ${current.totals[key]} bytes`);}
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
 {name:'clarity copy (in the box, sizes, checkout result)',baseSha:'08fd6d5566b8415a4270d06ae725f842ce046ed8',js:600,css:0,worker:1000,files:['components/taksh/bharat.tsx','components/taksh/chandrayaan.tsx','components/taksh/checkout.tsx','components/taksh/gully-cricket.tsx','components/taksh/home-hero.tsx','components/taksh/nonsense.tsx','components/taksh/ram-mandir.tsx','components/taksh/set-buy-box.tsx','components/taksh/shell.tsx','components/taksh/yellow-taxi.tsx','lib/catalogue.json','lib/cloudflare/performance-regression.mjs','lib/shop.ts','public/bharat-make-it-yours.html','public/bharat-map.html','scripts/copy-baseline.json','scripts/lint-copy.mjs','scripts/token-baseline.json','tests/standards.test.mjs']},
 {name:'bot-proof counting',baseSha:'956424019d4ede18df165b20239319a2c7dfa37d',js:600,css:0,worker:1000,files:['app/api/cart/route.ts','app/api/checkout/route.ts','lib/bot-domain.mjs','lib/demand-domain.mjs','lib/tracking.ts','scripts/google-report.mjs','tests/bot-domain.test.mjs','tests/demand.integration.mjs','tests/staging-robots.test.mjs','workers/app.ts','lib/cloudflare/performance-regression.mjs']},
 {name:'auto-merge pipeline (Worker build quirk only)',baseSha:'5e4ee3456b8ea05a9d7ca3e908022bac9fc7b64b',js:0,css:0,worker:50,files:['.github/workflows/auto-merge.yml','AGENTS.md','docs/OPERATIONS.md','scripts/auto-merge.mjs','scripts/check-links.mjs','tests/auto-merge.test.mjs','lib/cloudflare/performance-regression.mjs','scripts/check-main-performance.mjs','scripts/compare-performance.mjs','tests/performance-regression.test.mjs']},
];
export function ownerAllowance(baseSha,files,list=OWNER_ALLOWANCES){
 const a=list.find(x=>x.baseSha===baseSha&&files.length>0&&files.every(f=>x.files.includes(f)));
 return a?{name:a.name,js:a.js,css:a.css,worker:a.worker}:null;
}
