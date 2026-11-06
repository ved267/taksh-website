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
