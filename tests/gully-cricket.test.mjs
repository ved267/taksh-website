import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gullyGallery,gullyScenes} from '../lib/gully-cricket.mjs';
import {eventPayload,safePage} from '../lib/tracking-domain.mjs';
import {normaliseBag,addBagItem} from '../lib/bag-domain.mjs';
import catalogue from '../lib/catalogue.json' with {type:'json'};
import {resolveItems} from '../lib/order-domain.mjs';
const product=catalogue.products.find(p=>p.slug==='gully-cricket');
test('Gully Cricket is a single Craft product with the approved selling facts and valid cart behaviour',()=>{
 assert.deepEqual([product.price,product.age,product.pieces,product.approximate,product.level],[2999,8,600,true,'Craft']);
 assert.equal(catalogue.products.filter(p=>p.slug==='gully-cricket').length,1);
 const [item]=resolveItems([{slug:'gully-cricket',quantity:2,price:1}]);assert.equal(item.price,2999);assert.equal(item.quantity,2);assert.equal(item.name,'Gully Cricket');
 assert.equal(catalogue.products.filter(p=>p.level==='Craft')[0].slug,'gully-cricket');
 assert.deepEqual(normaliseBag([{slug:'gully-cricket',quantity:2}]),[{slug:'gully-cricket',quantity:2}]);
 assert.deepEqual(addBagItem([{slug:'gully-cricket',quantity:2}],'gully-cricket',2),[{slug:'gully-cricket',quantity:3}]);
 for(const scene of gullyScenes)assert.deepEqual(normaliseBag([{slug:scene.id,quantity:1}]),[]);
});
test('all nine gallery images and all six builds retain the approved order',()=>{
 assert.equal(gullyGallery.length,9);
 assert.deepEqual(gullyGallery.map(p=>p.image.match(/gallery-(\d+)/)[1]),['01','02','03','04','05','06','07','08','09']);
 assert.deepEqual(gullyScenes.map(s=>s.label),['Terrace House','Open Gully','Chai Corner','Family Courtyard','Match-Day Pavilion','Yours']);
 for(const p of [...gullyGallery,...gullyScenes]){assert.ok(fs.existsSync('public'+p.image));assert.ok(p.alt.length>30)}
});
test('Gully cart events report approved prices, quantities and product ID without arbitrary customer data',()=>{
 const result=eventPayload('AddToCart',{content_ids:['GULLY-CRICKET'],num_items:2,email:'private@example.test'},catalogue.products);
 assert.equal(result.data.value,5998);assert.equal(result.data.items[0].item_id,'GULLY-CRICKET');assert.equal(result.data.items[0].quantity,2);
 assert.equal(JSON.stringify(result).includes('private@example.test'),false);
 assert.equal(safePage('https://taksh.store/sets/gully-cricket?email=private@example.test',catalogue.products),'https://taksh.store/sets/gully-cricket');
});
test('the 17 delivered image masters match the approved source hashes',()=>{
 const approved=JSON.parse(fs.readFileSync('tests/fixtures/gully-image-hashes.json','utf8'));
 assert.equal(Object.keys(approved).length,17);
 for(const [file,hash] of Object.entries(approved))assert.equal(createHash('sha256').update(fs.readFileSync('public/gully-cricket/'+file)).digest('hex'),hash,file);
});

test('the product explorer starts with the five-build overview without changing catalogue or gallery identity',async()=>{
 const {gullyExplorer}=await import('../lib/gully-cricket.mjs');
 assert.ok(gullyExplorer,'explorer choices are exported');
 assert.equal(gullyExplorer[0].image,gullyGallery[1].image);
 assert.equal(gullyExplorer[0].line,'Build. Imagine. Create.');
 assert.deepEqual(gullyExplorer.slice(1).map(s=>s.id),gullyScenes.map(s=>s.id));
 assert.equal(gullyGallery[0].image,'/gully-cricket/gallery-01-hero.png');
 assert.equal(product.image,gullyGallery[0].image);
});
