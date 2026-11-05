import test from 'node:test';import assert from 'node:assert/strict';
import {performanceRegressions} from '../lib/cloudflare/performance-regression.mjs';
test('performance check fails any increase in main JS, CSS, Worker or key page weight',()=>{
 const base={totals:{jsGzip:100,cssGzip:100,workerGzip:100},pages:{'/':{htmlGzip:100,jsGzip:100,cssGzip:100,pageBytes:100}}};
 assert.deepEqual(performanceRegressions(base,base),[]);
 for(const section of ['totals','pages']){const next=structuredClone(base);if(section==='totals')next.totals.jsGzip++;else next.pages['/'].pageBytes++;assert.equal(performanceRegressions(base,next).length,1);}
 const next=structuredClone(base);delete next.pages['/'];assert.match(performanceRegressions(base,next)[0],/missing/i);
});
