import test from 'node:test';
import assert from 'node:assert/strict';
import * as consent from '../lib/consent-domain.mjs';
import {readConsent,writeConsent} from '../lib/consent-domain.mjs';
const now=Date.parse('2026-10-15T10:00:00.000Z');
test('missing, legacy or malformed choices do not fabricate a dated preference',()=>{
 for(const raw of [null,'allow','deny','{}','broken',JSON.stringify({version:1,analytics:'yes',updatedAt:'2026-10-15T09:00:00Z'})])assert.equal(readConsent(raw,now),null);
});
test('explicit choices round trip with a real date and purpose version',()=>{
 for(const analytics of [true,false]){
  const raw=writeConsent(analytics,now);
  assert.deepEqual(readConsent(raw,now),{version:1,analytics,updatedAt:'2026-10-15T10:00:00.000Z'});
 }
});
test('an unknown purpose version or future date requires a new choice',()=>{
 assert.equal(readConsent(JSON.stringify({version:2,analytics:true,updatedAt:'2026-10-15T09:00:00Z'}),now),null);
 assert.equal(readConsent(JSON.stringify({version:1,analytics:true,updatedAt:'2027-10-15T09:00:00Z'}),now),null);
});
test('unrecognised fields cannot grant advertising or carry personal data',()=>{
 const raw=JSON.stringify({version:1,analytics:true,updatedAt:'2026-10-15T09:00:00.000Z',advertising:true,email:'private@example.test'});
 assert.deepEqual(readConsent(raw,now),{version:1,analytics:true,updatedAt:'2026-10-15T09:00:00.000Z'});
});

test('analytics defaults on, but an explicit essential-only choice always wins',()=>{
 assert.equal(consent.analyticsEnabled?.(null,now),true);
 assert.equal(consent.analyticsEnabled?.(writeConsent(false,now),now),false);
 assert.equal(consent.analyticsEnabled?.(writeConsent(true,now),now),true);
 assert.equal(consent.analyticsEnabled?.('deny',now),false);
});
