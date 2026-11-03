import test from 'node:test';
import assert from 'node:assert/strict';
import {requestJson} from '../lib/request-json.mjs';
import {photoValidationError} from '../lib/support-photo.mjs';
test('JSON requests return HTTP errors for the caller to handle',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response(JSON.stringify({error:'Unavailable'}),{status:503});const result=await requestJson('/test');assert.equal(result.response.status,503);assert.equal(result.data.error,'Unavailable')}finally{globalThis.fetch=original}
});
test('a stalled response body is aborted and is never retried',async()=>{
 const original=globalThis.fetch;let calls=0,aborted=false;
 try{globalThis.fetch=async(url,{signal})=>{calls++;return {json:()=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(new Error('Abort'))}))}};await assert.rejects(requestJson('/test',{},10),/connection took too long/);assert.equal(calls,1);assert.equal(aborted,true)}finally{globalThis.fetch=original}
});
test('successful requests clear their timeout and network errors remain distinguishable',async()=>{
 const original=globalThis.fetch;let signal;
 try{globalThis.fetch=async(url,options)=>{signal=options.signal;return new Response('{}')};await requestJson('/test',{},10);await new Promise(resolve=>setTimeout(resolve,20));assert.equal(signal.aborted,false);globalThis.fetch=async()=>{throw new TypeError('offline')};await assert.rejects(requestJson('/test'),TypeError)}finally{globalThis.fetch=original}
});
test('support photos reject oversize and unsupported files before upload',()=>{
 assert.equal(photoValidationError(null),'');
 for(const type of ['image/jpeg','image/png','image/webp'])assert.equal(photoValidationError({type,size:5*1024*1024}),'');
 assert.match(photoValidationError({type:'image/jpeg',size:5*1024*1024+1}),/5 MB/);
 assert.match(photoValidationError({type:'application/pdf',size:10}),/JPG, PNG or WebP/);
});
