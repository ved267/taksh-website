// Runs against the isolated local Worker, never the customer database.
import assert from 'node:assert/strict';
const origin=process.env.TAKSH_TEST_ORIGIN||'http://127.0.0.1:5374';
assert.ok(new URL(origin).protocol==='http:'&&['127.0.0.1','localhost'].includes(new URL(origin).hostname),'Integration tests require an isolated loopback test server.');const cookies=new Map();
async function post(path,body){const r=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; ')},body:JSON.stringify(body)});for(const s of r.headers.getSetCookie()){const [k,v]=s.split(';')[0].split('=');cookies.set(k,v)}const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));return data;}
await post('/api/cart',{items:[{slug:'ram-mandir',quantity:2,price:1}],details:{email:'must-not-save@example.test'},attribution:{utmSource:'local-integration'}});
assert.ok(cookies.get('taksh_cart'));
const begun=await post('/api/checkout',{action:'begin',step:1,items:[{slug:'ram-mandir',quantity:2}],details:{}});
assert.equal(begun.order.status,'draft');assert.equal(begun.order.total,14998);assert.equal(begun.order.details.email,'');
assert.equal(cookies.get('taksh_checkout'),cookies.get('taksh_cart'));
await post('/api/cart',{items:[{slug:'nonsense',quantity:1}]});
const placed=await post('/api/checkout',{action:'place',step:1,reference:begun.order.reference,version:begun.order.version,items:[{slug:'ram-mandir',quantity:2}],details:{fullName:'Local test',email:'local@example.test'}});
assert.equal(placed.order.status,'placed');assert.equal(placed.order.details.fullName,'Local test');assert.equal(placed.order.reference,begun.order.reference);
await post('/api/cart',{items:[]});
const restored=await fetch(origin+'/api/checkout',{headers:{Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; ')}}).then(r=>r.json());assert.equal(restored.order.status,'placed');assert.equal(restored.order.total,14998);
await post('/api/cart',{items:[{slug:'nonsense',quantity:1}]});assert.notEqual(cookies.get('taksh_cart'),cookies.get('taksh_checkout'));
console.log('Anonymous selection → same checkout record → saved request; cart changes cannot overwrite the request. All local integration checks passed.');
