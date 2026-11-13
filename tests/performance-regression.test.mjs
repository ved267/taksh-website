import test from 'node:test';import assert from 'node:assert/strict';
import {performanceRegressions} from '../lib/cloudflare/performance-regression.mjs';
test('performance check fails any increase in main JS, CSS, Worker or key page weight',()=>{
 const base={totals:{jsGzip:100,cssGzip:100,workerGzip:100},pages:{'/':{htmlGzip:100,jsGzip:100,cssGzip:100,pageBytes:100}}};
 assert.deepEqual(performanceRegressions(base,base),[]);
 for(const section of ['totals','pages']){const next=structuredClone(base);if(section==='totals')next.totals.jsGzip++;else next.pages['/'].pageBytes++;assert.equal(performanceRegressions(base,next).length,1);}
 const next=structuredClone(base);delete next.pages['/'];assert.match(performanceRegressions(base,next)[0],/missing/i);
});
test('the requested admin security addition has a one-baseline file-scoped Worker allowance only',async()=>{
 const {adminSecurityAllowance}=await import('../lib/cloudflare/performance-regression.mjs');
 const sha='171ff74380e4cc41aa145ff4766b1e2ba4f9621b';
 assert.equal(adminSecurityAllowance(sha,['app/api/admin/login/route.ts','lib/admin-access.mjs']),256);
 assert.equal(adminSecurityAllowance('different-main',['app/api/admin/login/route.ts']),0);
 assert.equal(adminSecurityAllowance(sha,['app/api/admin/login/route.ts','components/new-ui.tsx']),0);
 assert.equal(adminSecurityAllowance(sha,[]),0);
 const base={totals:{jsGzip:100,cssGzip:100,workerGzip:100},pages:{'/':{jsGzip:100,cssGzip:100,pageBytes:100}}};
 const next=structuredClone(base);next.totals.workerGzip+=235;
 assert.equal(performanceRegressions(base,next).length,1);
 assert.deepEqual(performanceRegressions(base,next,{workerAllowance:256}),[]);
 next.totals.jsGzip++;assert.match(performanceRegressions(base,next,{workerAllowance:256})[0],/jsGzip/);
 next.totals.jsGzip--;next.totals.workerGzip=357;assert.match(performanceRegressions(base,next,{workerAllowance:256})[0],/workerGzip/);
});

test('the owner-approved tracking allowance is one baseline, one file set, capped, and CSS stays strict',async()=>{
 const {trackingAllowance}=await import('../lib/cloudflare/performance-regression.mjs');
 const sha='a75391e5bcb8a626ca15993491d54eb6dda562fa';
 assert.equal(trackingAllowance(sha,['lib/tracking.ts','lib/meta-capi.mjs']),true);
 assert.equal(trackingAllowance('other',['lib/tracking.ts']),false);
 assert.equal(trackingAllowance(sha,['lib/tracking.ts','components/taksh/home-hero.tsx']),false);
 const base={totals:{jsGzip:1000,cssGzip:100,workerGzip:1000},pages:{'/':{jsGzip:1000,cssGzip:100,pageBytes:1000}}};
 const ok=structuredClone(base);ok.totals.jsGzip+=600;ok.totals.workerGzip+=800;ok.pages['/'].jsGzip+=600;ok.pages['/'].pageBytes+=600;
 assert.deepEqual(performanceRegressions(base,ok,{tracking:true}),[]);
 assert.ok(performanceRegressions(base,ok).length>0);
 const big=structuredClone(ok);big.totals.jsGzip+=600;assert.ok(performanceRegressions(base,big,{tracking:true}).length>0);
 const css=structuredClone(ok);css.totals.cssGzip+=1;assert.ok(performanceRegressions(base,css,{tracking:true}).length>0);
});

test('owner allowances are exact, capped and expire with main',async()=>{
 const {ownerAllowance,performanceRegressions}=await import('../lib/cloudflare/performance-regression.mjs');
 const list=[{name:'x',baseSha:'a'.repeat(40),js:600,css:0,worker:1000,files:['lib/bot-domain.mjs','workers/app.ts']}];
 assert.deepEqual(ownerAllowance('a'.repeat(40),['workers/app.ts'],list),{name:'x',js:600,css:0,worker:1000});
 assert.equal(ownerAllowance('b'.repeat(40),['workers/app.ts'],list),null);
 assert.equal(ownerAllowance('a'.repeat(40),['workers/app.ts','app/page.tsx'],list),null);
 assert.equal(ownerAllowance('a'.repeat(40),[],list),null);
 const base={totals:{jsGzip:100,cssGzip:10,workerGzip:1000},pages:{'/':{jsGzip:100,cssGzip:10,pageBytes:500}}};
 const ok={totals:{jsGzip:700,cssGzip:10,workerGzip:2000},pages:{'/':{jsGzip:700,cssGzip:10,pageBytes:1100}}};
 assert.deepEqual(performanceRegressions(base,ok,{owner:{js:600,css:0,worker:1000}}),[]);
 const over=structuredClone(ok);over.totals.workerGzip=2001;over.pages['/'].cssGzip=11;
 assert.equal(performanceRegressions(base,over,{owner:{js:600,css:0,worker:1000}}).length,2);
 assert.throws(()=>performanceRegressions(base,ok,{owner:{js:601,css:0,worker:0}}),/caps/);
});
test('an owner allowance marked above the caps is accepted only for its own entry',async()=>{
 const {ownerAllowance,performanceRegressions}=await import('../lib/cloudflare/performance-regression.mjs');
 const list=[{name:'p',baseSha:'c'.repeat(40),js:1600,css:150,worker:8000,aboveCaps:'owner',files:['components/taksh/padma.tsx']}];
 const owner=ownerAllowance('c'.repeat(40),['components/taksh/padma.tsx'],list);
 assert.equal(owner.aboveCaps,'owner');
 const base={totals:{jsGzip:1000,cssGzip:100,workerGzip:1000},pages:{'/':{jsGzip:1000,cssGzip:100,pageBytes:2000}}};
 const next={totals:{jsGzip:2500,cssGzip:240,workerGzip:8900},pages:{'/':{jsGzip:2500,cssGzip:240,pageBytes:3500}}};
 assert.deepEqual(performanceRegressions(base,next,{owner}),[]);
 assert.throws(()=>performanceRegressions(base,next,{owner:{js:1600,css:150,worker:8000}}),/caps/);
 const routed=ownerAllowance('c'.repeat(40),['components/taksh/padma.tsx'],[{...list[0],routeJs:2000,routeCss:900}]);
 const grown={totals:{jsGzip:4400,cssGzip:1100,workerGzip:8900},pages:{'/':{jsGzip:2500,cssGzip:240,pageBytes:3500}}};
 assert.deepEqual(performanceRegressions(base,grown,{owner:routed}),[]);
 assert.deepEqual(performanceRegressions(base,{...grown,pages:{'/':{jsGzip:4400,cssGzip:240,pageBytes:3500}}},{owner:routed}),['/ jsGzip: 1000 -> 4400 bytes']);
 assert.ok(performanceRegressions(base,grown,{owner:{...routed,aboveCaps:undefined,js:600,css:300,worker:1000}}).includes('jsGzip: 1000 -> 4400 bytes'));
});
