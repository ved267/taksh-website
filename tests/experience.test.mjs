import test from 'node:test';
import assert from 'node:assert/strict';
import {createImageSelection,nextCheckoutField,filterCatalogue} from '../lib/experience-domain.mjs';
import {eventPayload} from '../lib/tracking-domain.mjs';
test('gallery retains current image until selected image decodes; stale and failed loads never replace it',async()=>{
 const pending=[],commits=[],states=[];
 const selection=createImageSelection(i=>new Promise((resolve,reject)=>pending[i]={resolve,reject}),i=>commits.push(i),s=>states.push(s));
 const a=selection.select(1),b=selection.select(2);
 pending[1].resolve();await a;assert.deepEqual(commits,[]);
 pending[2].resolve();await b;assert.deepEqual(commits,[2]);
 const c=selection.select(3);pending[3].reject(new Error('offline'));await c;
 assert.deepEqual(commits,[2]);assert.equal(states.at(-1),'error');
 const d=selection.select(4);selection.cancel();pending[4].resolve();await d;assert.deepEqual(commits,[2]);
});
test('checkout Enter moves through contact fields to the request button, never implicitly submits',()=>{
 assert.equal(nextCheckoutField('fullName'),'mobile');assert.equal(nextCheckoutField('email'),'house');assert.equal(nextCheckoutField('request-submit'),null);assert.equal(nextCheckoutField('state'),'pincode');assert.equal(nextCheckoutField('house'),'street');assert.equal(nextCheckoutField('pincode'),'request-submit');assert.equal(nextCheckoutField('unknown'),null);
});
test('catalogue filters intersect, prices use catalogue data, sorting leaves originals untouched',()=>{
 const products=[{name:'B',level:'Master',price:8000,age:12},{name:'A',level:'Craft',price:1700,age:8},{name:'C',level:'Craft',price:2400,age:9}];
 assert.deepEqual(filterCatalogue(products,{level:'Craft',budget:'2500',age:'8',sort:'price-desc'}).map(p=>p.name),['A']);
 assert.deepEqual(filterCatalogue(products,{sort:'price-asc'}).map(p=>p.name),['A','C','B']);assert.equal(products[0].name,'B');
});
test('cart view and removal track catalogue value without personal data',()=>{
 const ps=[{slug:'taxi',name:'Taxi',setNumber:'T',price:1700,level:'Craft'}];
 for(const [name,event] of [['ViewCart','view_cart'],['RemoveFromCart','remove_from_cart']]){
 const p=eventPayload(name,{items:[{slug:'taxi',quantity:2}],email:'private',value:1},ps);assert.equal(p.name,event);assert.equal(p.data.value,3400);assert.ok(!JSON.stringify(p).includes('private'));
 }
});
