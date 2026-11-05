import assert from'node:assert/strict';
const origin=process.env.TAKSH_TEST_ORIGIN||'http://127.0.0.1:3000';
const login=(password,ip)=>fetch(origin+'/api/admin/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':ip},body:JSON.stringify({password})});
for(let i=0;i<5;i++)assert.equal((await login('synthetic-wrong-password','198.51.100.199')).status,401);
assert.equal((await login(process.env.TAKSH_TEST_PASSWORD||'taksh-local-demand-qa','198.51.100.199')).status,429);
assert.equal((await login(process.env.TAKSH_TEST_PASSWORD||'taksh-local-demand-qa','198.51.100.200')).status,200);
console.log('Five incorrect logins lock that client; the correct fixture remains blocked there and works for a separate client.');
