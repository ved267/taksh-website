import test from 'node:test';
import assert from 'node:assert/strict';
import catalogue from '../lib/catalogue.json' with {type:'json'};
import {resolveItems} from '../lib/order-domain.mjs';
import {normaliseLevel} from '../lib/levels.mjs';

test('Chandrayaan reservation uses its approved price and preserves its own identity',()=>{
 const p=catalogue.products.find(p=>p.slug==='chandrayaan-3');
 assert.equal(p.level,'Master');assert.equal(p.pieces,1250);assert.equal(p.approximate,true);assert.equal(p.age,12);assert.equal(p.maxAge,undefined);
 const [item]=resolveItems([{slug:p.slug,quantity:2,price:1}]);
 assert.equal(item.price,6249);assert.equal(item.name,'Chandrayaan-3');assert.equal(item.quantity,2);
 assert.equal(normaliseLevel('Master'),'Master');
 assert.equal(catalogue.products.filter(x=>x.image?.includes('/chandrayaan/')).length,1);
});
