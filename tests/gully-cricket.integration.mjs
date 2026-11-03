// Isolated local Worker only. Never sends a request to the customer database.
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:5174';
const cookies=new Map();
async function post(path,body){const r=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; ')},body:JSON.stringify(body)});for(const s of r.headers.getSetCookie()){const [k,v]=s.split(';')[0].split('=');cookies.set(k,v)}const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));return data;}
await post('/api/cart',{items:[{slug:'gully-cricket',quantity:2,price:1}],attribution:{utmSource:'local-gully-qa'}});
const draft=await post('/api/checkout',{action:'begin',step:1,items:[{slug:'gully-cricket',quantity:2,price:1}],details:{}});
assert.equal(draft.order.status,'draft');assert.equal(draft.order.total,5998);
assert.equal(cookies.get('taksh_checkout'),cookies.get('taksh_cart'));
assert.equal(draft.order.items[0].name,'Gully Cricket');assert.equal(draft.order.items[0].quantity,2);assert.equal(draft.order.items[0].price,2999);
console.log('Gully Cricket local cart → checkout passed: quantity 2, server unit price Rs 2,999, total Rs 5,998; supplied price ignored.');
