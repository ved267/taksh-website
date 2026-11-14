import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,levelForPieces} from '../lib/levels.mjs';
import catalogue from '../lib/catalogue.json' with {type:'json'};
test('eight sets use two levels',()=>{
 assert.deepEqual(levels.map(l=>l.name),['Master','Craft']);
 assert.deepEqual(catalogue.products.map(p=>p.slug),['chandrayaan-3','ram-mandir','map-of-india','gully-cricket','yellow-taxi','nonsense','padma','1983-trophy']);
 assert.deepEqual(catalogue.products.map(p=>[p.level,p.age,p.pieces,p.price]),[['Master',12,1250,6249],['Master',12,1500,7499],['Master',8,4470,8999],['Craft',8,600,2999],['Craft',9,350,1749],['Craft',8,200,1999],['Craft',8,240,1499],['Craft',12,520,2999]]);
 for(const p of catalogue.products)assert.equal(p.level,levelForPieces(p.pieces));
});
