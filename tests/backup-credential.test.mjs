import test from'node:test';import assert from'node:assert/strict';import{verifyBackupCredential}from'../lib/cloudflare/backup-credential.mjs';
test('backup credential must complete a real export authorization before schedule enablement',async()=>{
 const config={account_id:'a'.repeat(32),vars:{D1_DATABASE_ID:'00000000-0000-0000-0000-000000000001'}};let calls=0;
 const result=await verifyBackupCredential('synthetic-token',config,{wait:async()=>{},fetcher:async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer synthetic-token');assert.equal(new URL(url).host,'api.cloudflare.com');calls++;return Response.json({success:true,result:calls===1?{status:'active',at_bookmark:'test'}:{status:'complete',result:{signed_url:'https://example.com/private-test.sql'}}});}});
 assert.equal(calls,2);assert.equal(result.exportPermissionVerified,true);assert.equal(JSON.stringify(result).includes('private-test.sql'),false);assert.equal(JSON.stringify(result).includes('synthetic-token'),false);
 await assert.rejects(()=>verifyBackupCredential('bad',config,{fetcher:async()=>new Response('',{status:403})}),/credential/);
 await assert.rejects(()=>verifyBackupCredential('bad',config,{fetcher:async()=>Response.json({success:false})}),/credential/);
});
