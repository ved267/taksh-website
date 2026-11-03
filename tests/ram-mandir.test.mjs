import test from 'node:test';
import assert from 'node:assert/strict';
import catalogue from '../lib/catalogue.json' with {type:'json'};
import {resolveItems} from '../lib/order-domain.mjs';
import {addBagItem} from '../lib/bag-domain.mjs';
import {levelForPieces} from '../lib/levels.mjs';
test('Ram Mandir is a Master set and uses the existing bag and server price calculation',()=>{
 const p=catalogue.products.find(p=>p.slug==='ram-mandir');assert.ok(p);
 assert.equal(p.price,7499);assert.equal(p.pieces,1500);assert.equal(p.approximate,true);assert.equal(p.level,levelForPieces(p.pieces));assert.equal(p.age,12);
 assert.deepEqual(addBagItem([],p.slug,2),[{slug:'ram-mandir',quantity:2}]);
 const [item]=resolveItems([{slug:p.slug,quantity:2,price:1}]);assert.equal(item.price,7499);assert.equal(item.name,'Ram Mandir');assert.equal(item.quantity,2);
 assert.equal(p.image,'/ram-mandir/gallery-01-hero-front.webp');
});
