import test from 'node:test';
import assert from 'node:assert/strict';
const load=()=>import('../lib/customer-sheet-domain.mjs');
test('the private export rejects missing, short and incorrect credentials',async()=>{
 const {validSyncKey}=await load();
 const key='a'.repeat(64);
 assert.equal(await validSyncKey('Bearer '+key,key),true);
 for(const [header,configured] of [['',key],['Bearer wrong',key],['Bearer '+key,''],['Bearer short','short']])assert.equal(await validSyncKey(header,configured),false);
});
test('submitted requests export customer fields without access tokens or payment claims',async()=>{
 const {sheetRequest}=await load();
 const r=sheetRequest({reference:'TK-TEST',placed_at:'2026-10-12T06:00:00.000Z',status:'placed',token_hash:'secret',details:JSON.stringify({fullName:'Test buyer',mobile:'9000000000',email:'test@example.com',house:'1',street:'Test street',city:'Kolkata',state:'West Bengal',pincode:'700001',whatsappConsent:true}),items:JSON.stringify([{name:'Yellow Taxi',quantity:2,price:1749}]),total:3498,utm_source:'test',utm_campaign:'check'});
 assert.ok(r?.values,'A submitted request must produce the customer columns.');assert.equal(r.values.length,15);assert.deepEqual(r.values.slice(0,5),['Test buyer','9000000000','Yellow Taxi × 2',2,3498]);assert.equal(r.reference,'TK-TEST');assert.equal(r.values[12],'TK-TEST');assert.ok(!JSON.stringify(r).includes('secret'));
 assert.throws(()=>sheetRequest({...r,status:'cart'}));
});
test('export cursors retain equal-timestamp identities and reject invalid input',async()=>{
 const {parseSyncCursor}=await load();
 assert.deepEqual(parseSyncCursor(null),{at:'',id:''});
 assert.deepEqual(parseSyncCursor({at:'',id:''}),{at:'',id:''});
 assert.deepEqual(parseSyncCursor({at:'2026-10-12T06:00:00.000Z',id:'request-2'}),{at:'2026-10-12T06:00:00.000Z',id:'request-2'});
 for(const c of [{at:'not a date',id:'x'},{at:'2026-10-12T06:00:00.000Z',id:'x'.repeat(300)}])assert.throws(()=>parseSyncCursor(c));
});
test('customer-supplied text cannot become a spreadsheet formula',async()=>{
 const {sheetRequest}=await load();
 const r=sheetRequest({status:'placed',reference:'TK-TEST',placed_at:'2026-10-12T06:00:00.000Z',details:JSON.stringify({fullName:'=IMPORTDATA("https://example.com")',city:'  +SUM(1,2)'}),items:'[]',total:0});
 assert.ok(r?.values);assert.equal(r.values[0][0],"'");assert.equal(r.values[6][0],"'");
});
