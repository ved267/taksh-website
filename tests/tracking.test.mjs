import test from 'node:test';
import assert from 'node:assert/strict';
import {eventPayload,safePage,createTracker} from '../lib/tracking-domain.mjs';
const products=[{slug:'ram-mandir',setNumber:'RAM',name:'Ram Mandir',price:7499,level:'Master'}];
test('cart events use catalogue facts and ignore customer details',()=>{
 const e=eventPayload('AddToCart',{items:[{slug:'ram-mandir',quantity:2,price:1}],email:'private@example.com',fullName:'Private',value:1},products);
 assert.equal(e.name,'add_to_cart');assert.equal(e.data.value,14998);assert.deepEqual(e.data.items,[{item_id:'RAM',item_name:'Ram Mandir',item_brand:'Taksh',item_category:'Master',price:7499,quantity:2}]);assert.ok(!JSON.stringify(e).includes('private@example'));assert.ok(!JSON.stringify(e).includes('Private'));
});
test('legacy product view calls get proper items',()=>{const e=eventPayload('ViewContent',{content_ids:['RAM'],content_name:'private',value:1},products);assert.equal(e.name,'view_item');assert.equal(e.data.items[0].item_name,'Ram Mandir');assert.equal(e.data.value,7499)});
test('saved request is a lead with no revenue or personal/order identifiers',()=>{const e=eventPayload('Lead',{items:[{slug:'ram-mandir',quantity:1}],reference:'TK-secret',email:'private@example.com',value:7499},products);assert.equal(e.name,'generate_lead');assert.equal(e.data.value,undefined);assert.equal(e.data.selection_value,7499);assert.ok(!JSON.stringify(e).includes('TK-secret'))});
test('unknown events and product IDs are rejected',()=>{assert.equal(eventPayload('purchase',{},products),null);assert.equal(eventPayload('ViewContent',{content_ids:['INVALID']},products),null)});
test('page URLs omit queries, hashes and unexpected paths',()=>{assert.equal(safePage('https://taksh.store/checkout?email=private@example.com#phone'),'https://taksh.store/checkout');assert.equal(safePage('https://taksh.store/private@example.com'),'https://taksh.store/');assert.equal(safePage('https://elsewhere.test/person'),'https://elsewhere.test/')});
test('no scripts/events before consent, no retroactive actions; page and item emitted once on consent',()=>{
 const sent=[],loads=[];const tracker=createTracker({products,send:(...e)=>sent.push(e),load:()=>loads.push(1)});
 tracker.page('https://taksh.store/sets/ram-mandir','Title');tracker.event('ViewContent',{content_ids:['RAM']});tracker.event('AddToCart',{items:[{slug:'ram-mandir',quantity:1}]});assert.equal(sent.length,0);assert.equal(loads.length,0);
 tracker.consent(true);assert.equal(loads.length,1);assert.deepEqual(sent.map(e=>e[0]),['page_view','view_item']);tracker.page('https://taksh.store/sets/ram-mandir','Title');assert.equal(sent.length,2);
 tracker.event('AddToCart',{items:[{slug:'ram-mandir',quantity:2}]});assert.equal(sent.at(-1)[1].value,14998);tracker.consent(false);tracker.event('Lead',{items:[{slug:'ram-mandir',quantity:1}]});assert.equal(sent.length,3);
 tracker.consent(true);assert.equal(loads.length,1);assert.equal(sent.filter(e=>e[0]==='generate_lead').length,0);
});
test('new route clears old item view and emits exactly one page view',()=>{const sent=[];const t=createTracker({products,send:(...e)=>sent.push(e),load:()=>{}});t.consent(true);t.page('https://taksh.store/sets/ram-mandir','Ram');t.event('ViewContent',{content_ids:['RAM']});t.event('ViewContent',{content_ids:['RAM']});t.page('https://taksh.store/bag','Bag');assert.deepEqual(sent.map(e=>e[0]),['page_view','view_item','page_view'])});
test('anonymous selections are not counted as contactable leads',()=>{
 const e=eventPayload('Lead',{items:[{slug:'ram-mandir',quantity:1}],contactable:false},products);
 assert.equal(e.name,'selection_saved');assert.equal(e.data.selection_value,7499);assert.equal(e.data.value,undefined);
});
test('failure events contain categories and catalogue items, never typed input',()=>{const e=eventPayload('RequestFailure',{items:[{slug:'ram-mandir',quantity:1}],category:'validation',email:'private@example.test',message:'Typed message'},products);assert.equal(e.name,'availability_request_error');assert.equal(e.data.failure_category,'validation');assert.ok(!JSON.stringify(e).includes('private'));assert.ok(!JSON.stringify(e).includes('Typed'))});
test('saved request event preserves the server price snapshot instead of current catalogue price',()=>{const e=eventPayload('Lead',{items:[{slug:'ram-mandir',quantity:2,price:7000}],saved:true},products);assert.equal(e.data.selection_value,14000);assert.equal(e.data.items[0].price,7000);assert.equal(e.data.value,undefined)});
test('internal, preview and obvious automated traffic is excluded without treating real mobile users as bots',async()=>{const{excludedFromTracking}=await import('../lib/tracking-domain.mjs');assert.equal(excludedFromTracking('taksh.store','Mozilla/5.0',false,false),false);assert.equal(excludedFromTracking('taksh.store','Mozilla/5.0',true,false),true);assert.equal(excludedFromTracking('taksh.store','Googlebot/2.1'),true);assert.equal(excludedFromTracking('taksh.store','Mozilla/5.0',false,true),true);assert.equal(excludedFromTracking('preview.vercel.app','Mozilla/5.0'),true)});
