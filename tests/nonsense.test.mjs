import test from 'node:test';
import assert from 'node:assert/strict';
import {addBagItem,normaliseBag} from '../lib/bag-domain.mjs';
import {resolveItems} from '../lib/order-domain.mjs';

test('Ulta Chashma keeps its existing product identity, can be added to the bag and resolves to the catalogue price at checkout',()=>{
 const bag=addBagItem([], 'nonsense', 2);
 assert.deepEqual(normaliseBag(bag),[{slug:'nonsense',quantity:2}]);
 const [item]=resolveItems([{slug:'nonsense',quantity:2,price:1}]);
 assert.equal(item.name,'Ulta Chashma');
 assert.equal(item.price,1999);
 assert.equal(item.quantity,2);
});
