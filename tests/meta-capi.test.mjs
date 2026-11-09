import test from 'node:test';import assert from 'node:assert/strict';
import {metaLeadBody,metaContactHashes,sendMetaLead} from '../lib/meta-capi.mjs';
const headers=new Headers({'user-agent':'Mozilla/5.0 iPhone','cf-connecting-ip':'203.0.113.9',cookie:'_fbp=fb.1.1.2; _fbc=fb.1.1.abc; taksh_checkout=SECRET'});
const body=metaLeadBody({reference:'TK-1',items:[{setNumber:'01',quantity:2,name:'Set'}],headers,now:1700000000000});
test('server Lead uses the request reference as the shared event id and carries no value or raw contact details',()=>{const e=body.data[0];assert.equal(e.event_name,'Lead');assert.equal(e.event_id,'TK-1');assert.equal(e.event_time,1700000000);assert.equal('value' in e.custom_data,false);assert.deepEqual(e.custom_data.content_ids,['01']);const text=JSON.stringify(body);assert.equal(text.includes('SECRET'),false);assert.equal(/mobile|phone|fullName/i.test(Object.keys(e.user_data).join(' ')),false);assert.equal(e.user_data.fbp,'fb.1.1.2');assert.equal(e.user_data.client_ip_address,'203.0.113.9')});
test('test event code is added only when set',()=>{assert.equal('test_event_code' in body,false);assert.equal(metaLeadBody({reference:'TK-1',items:[],headers,testCode:'TEST1'}).test_event_code,'TEST1')});
test('sending reports status, keeps the token out of the URL and never throws',async()=>{let seen;const ok=await sendMetaLead({pixelId:'123',token:'tok',body,fetchImpl:async(url,init)=>{seen={url,init};return {ok:true}}});assert.equal(ok,'sent');assert.equal(seen.url.includes('tok'),false);assert.equal(seen.init.headers.Authorization,'Bearer tok');assert.equal(await sendMetaLead({pixelId:'123',token:'tok',body,fetchImpl:async()=>({ok:false,status:400})}),'failed_400');assert.equal(await sendMetaLead({pixelId:'123',token:'tok',body,fetchImpl:async()=>{throw new Error('x')}}),'failed_network');assert.equal(await sendMetaLead({pixelId:'123',token:'',body}),'not_configured')});

test('contact details are normalised then hashed; raw values never appear',async()=>{
  const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('');
  const c=await metaContactHashes({fullName:'Asha  Devi Rao',mobile:'098765 43210',email:' Asha@Example.COM ',city:'New Delhi',state:'Delhi',pincode:'110 001'.replace(' ','')});
  assert.deepEqual(c.em,[await sha('asha@example.com')]);assert.deepEqual(c.ph,[await sha('919876543210')]);assert.deepEqual(c.fn,[await sha('asha')]);assert.deepEqual(c.ln,[await sha('rao')]);assert.deepEqual(c.ct,[await sha('newdelhi')]);assert.deepEqual(c.zp,[await sha('110001')]);assert.deepEqual(c.country,[await sha('in')]);
  const text=JSON.stringify(metaLeadBody({reference:'TK-2',items:[],headers,contact:c}));assert.equal(/asha@example|9876543210/i.test(text),false);
  assert.deepEqual(Object.keys(await metaContactHashes({mobile:'123',email:'bad'})),['country']);
});
