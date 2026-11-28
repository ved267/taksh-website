import test from 'node:test';import assert from 'node:assert/strict';
import {recommend,companions} from '../lib/recommend.mjs';
import catalogue from '../lib/catalogue.json' with {type:'json'};
const sets=catalogue.products,slugs=sets.map(p=>p.slug);
test('every set has three real companions, none of them itself',()=>{for(const s of slugs){assert.equal(companions[s]?.length,3,s);for(const c of companions[s]){assert.ok(slugs.includes(c),c);assert.notEqual(c,s)}}});
test('suggestions never repeat what is in the bag and follow the pairings',()=>{assert.deepEqual(recommend(['gully-cricket'],sets).map(p=>p.slug),['1983-trophy','yellow-taxi','map-of-india']);const two=recommend(['padma','surajmukhi'],sets).map(p=>p.slug);assert.ok(!two.includes('padma')&&!two.includes('surajmukhi'));assert.equal(two[0],'kamdhenu');assert.equal(recommend(slugs,sets).length,0)});
