import test from 'node:test';
import assert from 'node:assert/strict';
import {lintText,extractCopy,run as runCopy} from '../scripts/lint-copy.mjs';
import {looseValues,run as runTokens} from '../scripts/check-tokens.mjs';
import {routes,run as runLinks} from '../scripts/check-links.mjs';

const catalogue={products:[{price:1749,pieces:350},{price:8999,pieces:4470}]};
const rules=(t,file='components/taksh/yellow-taxi.tsx')=>lintText(t,{file,catalogue}).map(v=>v.rule);

test('copy lint flags banned words and allows clean copy',()=>{
 assert.deepEqual(rules('A calm, simple brick taxi.'),[]);
 assert.ok(rules('An iconic toy car').includes('banned word: iconic'));
 assert.ok(rules('An iconic toy car').includes('banned word: toy'));
 assert.ok(rules('Compatible with Lego bricks').includes('banned word: brick brand'));
 assert.ok(rules('It is not an exact scale replica').includes('banned word: exact replica'));
});

test('copy lint keeps "play" for Gully Cricket only',()=>{
 assert.ok(rules('Khelo bachchon.','components/taksh/nonsense.tsx').includes('"play" outside Gully Cricket'));
 assert.deepEqual(rules('Play a match in the lane.','components/taksh/gully-cricket.tsx'),[]);
});

test('copy lint wants "about" before counts, sizes and times',()=>{
 assert.ok(rules('Build time 2–3 hours').includes('number without "about"'));
 assert.deepEqual(rules('About 350 pieces · about 2–3 hours · about 17 cm wide'),[]);
 assert.deepEqual(rules('Masters · over 1,000 pieces'),[]);
});

test('copy lint checks prices and piece counts against the catalogue',()=>{
 assert.deepEqual(rules('Rs 1,749 · About 350 pieces'),[]);
 assert.ok(rules('Rs 1,799').includes('price not in catalogue'));
 assert.ok(rules('About 360 pieces').includes('piece count not in catalogue'));
 assert.deepEqual(rules('Under Rs 2,500'),[]);
});

test('copy lint allows only the agreed exclamation marks and catches "1 sets"',()=>{
 assert.deepEqual(rules('Taxi!'),[]);
 assert.ok(rules('Build it now!').includes('exclamation mark'));
 assert.ok(rules('1 sets in your selection').includes('singular/plural'));
});

test('copy extraction reads JSX text and prose strings, not code',()=>{
 const src=`<h2>Get in.</h2><p className="x">{a!==b}</p> const t='The yellow taxi of Kolkata'; const c='rm-gallery wide';`;
 const got=extractCopy(src);
 assert.ok(got.includes('Get in.'));
 assert.ok(got.includes('The yellow taxi of Kolkata'));
 assert.ok(!got.some(s=>s.includes('rm-gallery')));
});

test('token check ignores the :root token block and finds loose values',()=>{
 const css=':root{--ink:#14182b}.a{color:#ff0000;background:rgba(0, 0, 0, .5);font-family:Arial}';
 const v=looseValues(css,{isTokenFile:true});
 assert.deepEqual(v.map(x=>x.value),['#ff0000','rgba(0,0,0,.5)','Arial']);
 assert.equal(looseValues('.a{color:var(--ink)}').length,0);
});

test('route discovery finds set pages, info pages and redirects',async()=>{
 const r=await routes();
 assert.ok(r.public.has('/sets/map-of-india'));
 assert.ok(r.public.has('/returns'));
 assert.ok(r.redirects.has('/our-story'));
 assert.ok(!r.public.has('/checkout'));
});

test('all three checks pass on the current code',async()=>{
 const log=console.log;console.log=()=>{};
 try{
  assert.equal(await runCopy(),0);
  assert.equal(await runTokens(),0);
  assert.equal(await runLinks(),0);
 }finally{console.log=log}
});
