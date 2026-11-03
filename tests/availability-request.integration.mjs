// Local Worker only: no production customer records or notifications.
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:5174';
for(const contact of [{email:'availability@example.test'},{mobile:'9876543210'}]){
 const cookies=new Map();
 async function post(body,status=200){const response=await fetch(origin+'/api/checkout',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')},body:JSON.stringify(body)});for(const s of response.headers.getSetCookie()){const [k,v]=s.split(';')[0].split('=');cookies.set(k,v)}const result=await response.json();assert.equal(response.status,status,JSON.stringify(result));return result;}
 const base={step:1,items:[{slug:'nonsense',quantity:1,price:1}]};
 const draft=await post({...base,action:'begin',details:{}});
 assert.equal(draft.order.status,'draft');
 const submit={...base,action:'place',reference:draft.order.reference,version:draft.order.version};
 const rejected=await post({...submit,details:{}},400);
 assert.match(rejected.error,/email address or mobile/);
 const placed=await post({...submit,details:contact});
 assert.equal(placed.order.status,'placed');assert.equal(placed.order.items[0].name,'Ulta Chashma');assert.equal(placed.order.total,1999);
 for(const key of ['house','street','city','pincode','state'])assert.equal(placed.order.details[key],'');
 const repeated=await post({...submit,details:contact});assert.equal(repeated.order.reference,placed.order.reference);assert.equal(repeated.order.version,placed.order.version);
}
console.log('Email-only and mobile-only requests pass; contactless submission rejected; no address required; rename/price and duplicate-submit recovery verified.');
