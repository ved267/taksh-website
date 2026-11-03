import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseBag,addBagItem} from '../lib/bag-domain.mjs';
test('restored bags discard retired sets and combine duplicate lines within the limit',()=>{assert.deepEqual(normaliseBag([{slug:'yellow-taxi',quantity:2},{slug:'yellow-taxi',quantity:2},{slug:'diya',quantity:1},null]),[{slug:'yellow-taxi',quantity:3}]);assert.deepEqual(normaliseBag({}),[])});
test('adding produces the complete bag snapshot and rejects invalid quantities',()=>{const bag=[{slug:'yellow-taxi',quantity:2}];assert.deepEqual(addBagItem(bag,'yellow-taxi',2),[{slug:'yellow-taxi',quantity:3}]);assert.deepEqual(addBagItem(bag,'nonsense',1),[...bag,{slug:'nonsense',quantity:1}]);assert.throws(()=>addBagItem(bag,'yellow-taxi',0));assert.throws(()=>addBagItem(bag,'yellow-taxi',1.5))});
