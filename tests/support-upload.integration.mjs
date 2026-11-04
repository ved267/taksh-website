// Isolated local production preview; no live customer writes or messages.
import assert from 'node:assert/strict';
import {submitSupport} from '../lib/support-submit.mjs';
const origin=process.env.TAKSH_TEST_ORIGIN||'http://127.0.0.1:5274';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))throw new Error('Local test origin required.');
const request=globalThis.fetch;
globalThis.fetch=(url,options={})=>request(new URL(url,origin),{...options,headers:{...options.headers,Origin:origin}});
try{
 const bytes=new Uint8Array(5*1024*1024);bytes.set([255,216,255]);bytes[bytes.length-1]=71;
 const form=new FormData();form.set('set','nonsense');form.set('description','Synthetic local photo transport check.');form.set('mobile','9876543210');form.set('photo',new File([bytes],'local-qa.jpg',{type:'image/jpeg'}));
 const submitted=await submitSupport(form),saved=await submitted.json();assert.equal(submitted.status,200,JSON.stringify(saved));
 const login=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'taksh-local-demand-qa'})});assert.equal(login.status,200);
 const cookie=login.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
 const dashboard=await (await fetch('/api/admin/orders',{headers:{Cookie:cookie}})).json();
 const row=dashboard.support.find(item=>item.id.slice(0,8).toUpperCase()===saved.reference);assert.ok(row);
 const denied=await fetch('/api/admin/photo/'+row.id);assert.equal(denied.status,401);
 const photo=await fetch('/api/admin/photo/'+row.id,{headers:{Cookie:cookie}});assert.equal(photo.status,200);assert.match(photo.headers.get('Cache-Control'),/private.*no-store/);assert.deepEqual(new Uint8Array(await photo.arrayBuffer()),bytes);
 console.log('5MB photo uploaded via bounded requests, restored byte-for-byte and protected by owner sign-in.');
}finally{globalThis.fetch=request}
