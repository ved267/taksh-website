import test from 'node:test';
import assert from 'node:assert/strict';
import {publicPageCacheKey,cacheablePageResponse} from '../lib/performance-domain.mjs';
test('only anonymous full public page loads can share a cache',()=>{
 assert.equal(publicPageCacheKey(new Request('https://taksh.store/sets/map-of-india'),'build-1'),'https://taksh.store/sets/map-of-india?__taksh_build=build-1');
 for(const path of ['/api/checkout','/admin','/bag','/checkout','/unknown','/?email=someone'])assert.equal(publicPageCacheKey(new Request('https://taksh.store'+path),'v'),null);
 for(const headers of [{cookie:'taksh_checkout=secret'},{RSC:'1'},{authorization:'Bearer secret'},{'next-router-state-tree':'tree'}])assert.equal(publicPageCacheKey(new Request('https://taksh.store/',{headers}),'v'),null);
 assert.equal(publicPageCacheKey(new Request('https://taksh.store/',{method:'POST'}),'v'),null);
});
test('routine analytics and bot-protection cookies do not bypass the public cache',()=>{
 assert.ok(publicPageCacheKey(new Request('https://taksh.store/',{headers:{cookie:'__cf_bm=bot; _ga=analytics; _ga_NHQFYHTNLP=visit'}}),'v'));
 for(const cookie of ['taksh_cart=private','taksh_owner=private','__cf_bm=bot; taksh_checkout=private','session=unknown','_ga_customer=analytics; personalised=true'])assert.equal(publicPageCacheKey(new Request('https://taksh.store/',{headers:{cookie}}),'v'),null);
});
test('errors, personalised, private and non-HTML responses are never stored',()=>{
 assert.equal(cacheablePageResponse(new Response('<html>',{headers:{'content-type':'text/html'}})),true);
 for(const response of [new Response('error',{status:500}),new Response('{}',{headers:{'content-type':'application/json'}}),new Response('<html>',{headers:{'content-type':'text/html','set-cookie':'session=x'}}),new Response('<html>',{headers:{'content-type':'text/html','cache-control':'private'}})])assert.equal(cacheablePageResponse(response),false);
});
test('restricted or failing cache services cannot prevent a public page rendering',async()=>{
 const {readPublicPageCache}=await import('../lib/performance-domain.mjs');
 for(const service of [{open:async()=>{throw new Error('cache unavailable')}},{open:async()=>({match:async()=>{throw new Error('cache read failed')}})}])assert.deepEqual(await readPublicPageCache(service,'https://taksh.store/'),{cache:null,hit:null});
 const response=new Response('cached page');const result=await readPublicPageCache({open:async name=>{assert.equal(name,'taksh-public-pages');return {match:async()=>response}}},'https://taksh.store/');assert.equal(await result.hit.text(),'cached page');
});

test('Gully shares the public product cache without exposing personalised responses',()=>{
 const url='https://taksh.store/sets/gully-cricket';
 assert.equal(publicPageCacheKey(new Request(url),'release-a'),url+'?__taksh_build=release-a');
 assert.notEqual(publicPageCacheKey(new Request(url),'release-a'),publicPageCacheKey(new Request(url),'release-b'));
 for(const headers of [{cookie:'taksh_cart=private'},{cookie:'taksh_checkout=private'},{authorization:'Bearer private'},{RSC:'1'}])assert.equal(publicPageCacheKey(new Request(url,{headers}),'release-a'),null);
});
