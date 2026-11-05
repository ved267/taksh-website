import test from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {DatabaseSync} from 'node:sqlite';
import * as backups from '../lib/cloudflare/daily-backup.mjs';
const account='a'.repeat(32),database='00000000-0000-4000-8000-000000000001';
const sql='CREATE TABLE requests(id TEXT PRIMARY KEY,total INTEGER); INSERT INTO requests VALUES (\'synthetic\',123);';
async function fixture(run){const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("not public",{status:404})}}',compatibilityDate:'2026-10-12',r2Buckets:['BACKUPS']}));try{await run(await mf.getR2Bucket('BACKUPS'))}finally{await mf.dispose()}}
test('daily backup polls an export, privately stores exact restorable SQL and avoids overwriting a completed day',async()=>{
 assert.equal(typeof backups.runDailyBackup,'function','scheduled backup is not implemented');
 await fixture(async bucket=>{
  let calls=0;
  const fetcher=async(url,options)=>{
   calls++;
   if(url===`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/export`){
    assert.equal(options.headers.Authorization,'Bearer local-backup-fixture');
    if(calls===1)return Response.json({success:true,result:{at_bookmark:'bookmark-1'}});
    assert.equal(JSON.parse(options.body).current_bookmark,'bookmark-1');
    return Response.json({success:true,result:{status:'complete',result:{signed_url:'https://test.r2.cloudflarestorage.com/export.sql?fixture=only'}}});
   }
   assert.equal(options?.headers?.Authorization,undefined,'export API token must never be forwarded to signed download URL');
   return new Response(sql,{headers:{'Content-Type':'application/sql'}});
  };
  const env={CLOUDFLARE_ACCOUNT_ID:account,D1_DATABASE_ID:database,D1_BACKUP_TOKEN:'local-backup-fixture',BACKUPS:bucket};
  const result=await backups.runDailyBackup(env,{fetcher,wait:async()=>{},now:new Date('2026-11-04T22:00:00Z')});
  const object=await bucket.get(result.key);assert.equal(await object.text(),sql);
  const restored=new DatabaseSync(':memory:');try{restored.exec(sql);assert.equal(restored.prepare('SELECT total FROM requests').get().total,123)}finally{restored.close()}
  assert.equal(result.bytes,new TextEncoder().encode(sql).length);assert.equal(result.sha256.length,64);
  assert.equal((await backups.runDailyBackup(env,{fetcher,wait:async()=>{},now:new Date('2026-11-04T22:01:00Z')})).skipped,true);
  assert.equal(calls,3);
 });
});
test('failed or oversized exports do not produce a successful backup record',async()=>{
 assert.equal(typeof backups.runDailyBackup,'function');
 await fixture(async bucket=>{
  const env={CLOUDFLARE_ACCOUNT_ID:account,D1_DATABASE_ID:database,D1_BACKUP_TOKEN:'local-backup-fixture',BACKUPS:bucket};
  await assert.rejects(backups.runDailyBackup(env,{fetcher:async()=>Response.json({success:false},{status:500}),wait:async()=>{},now:new Date('2026-11-05T22:00:00Z')}),/export/i);
  await assert.rejects(backups.runDailyBackup(env,{fetcher:async url=>url.includes('api.cloudflare.com')?Response.json({success:true,result:{status:'complete',result:{signed_url:'https://test.r2.cloudflarestorage.com/export.sql'}}}):new Response('oversized',{headers:{'Content-Length':String(21*1024*1024)}}),wait:async()=>{},now:new Date('2026-11-05T22:00:00Z')}),/size|larger/i);
  const result=await bucket.list({prefix:'d1/'});assert.equal(result.objects.length,0);
 });
});
test('manual backup forces a fresh authenticated export even if the day already has a valid object',async()=>{
 await fixture(async bucket=>{let exports=0;const env={CLOUDFLARE_ACCOUNT_ID:account,D1_DATABASE_ID:database,D1_BACKUP_TOKEN:'local-backup-fixture',BACKUPS:bucket};const fetcher=async url=>{if(url.includes('api.cloudflare.com')){exports++;return Response.json({success:true,result:{status:'complete',result:{signed_url:'https://test.r2.cloudflarestorage.com/export.sql'}}})}return new Response(sql)};const options={fetcher,wait:async()=>{},now:new Date('2026-11-05T22:00:00Z')};await backups.runDailyBackup(env,options);await backups.runDailyBackup(env,{...options,force:true});assert.equal(exports,2);});
});
