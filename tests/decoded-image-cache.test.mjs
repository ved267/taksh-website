import test from 'node:test';
import assert from 'node:assert/strict';
import {createDecodedImageCache} from '../lib/decoded-image-cache.mjs';
test('intent preloading and a subsequent click share one decoded image request',async()=>{
 let count=0;let finish;const load=createDecodedImageCache(()=>{count++;return new Promise(resolve=>{finish=resolve})});
 const request={src:'scene.png',sizes:'700px'};const first=load(request),second=load(request);
 await Promise.resolve();assert.equal(count,1);assert.equal(first,second);finish('decoded.png');
 assert.equal(await second,'decoded.png');assert.equal(await load(request),'decoded.png');assert.equal(count,1);
});
test('failed image preloads can retry and the cache remains bounded',async()=>{
 let count=0;const load=createDecodedImageCache(async({src})=>{count++;if(count===1)throw Error('offline');return src},2);
 await assert.rejects(load({src:'one'}));assert.equal(await load({src:'one'}),'one');
 await load({src:'two'});await load({src:'three'});await load({src:'one'});assert.equal(count,5);
});

test('viewport and pixel-density changes select a fresh responsive image',async()=>{
 let count=0;const load=createDecodedImageCache(async()=>++count);
 const base={src:'scene.png',sizes:'50vw',viewportWidth:390,pixelRatio:1};
 assert.equal(await load(base),1);assert.equal(await load({...base,viewportWidth:1440}),2);assert.equal(await load({...base,pixelRatio:2}),3);assert.equal(await load(base),1);
});
