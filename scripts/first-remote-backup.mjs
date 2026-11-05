// Owner-operated first-run proof. Uses existing Wrangler OAuth in memory only;
// this is not the permanent scheduled credential and never enables a schedule.
import {getPlatformProxy} from 'wrangler';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cloudflareRequest} from './cloudflare-api.mjs';
import {runDailyBackup} from '../lib/cloudflare/daily-backup.mjs';
const config=JSON.parse(await readFile('wrangler.backup.json','utf8'));
await mkdir('.local',{recursive:true});
const path=resolve('.local/wrangler-backup-proof.json');
await writeFile(path,JSON.stringify({...config,main:resolve('workers/backup.mjs'),triggers:{crons:[]},r2_buckets:config.r2_buckets.map(bucket=>({...bucket,remote:true}))}));
// Refresh and prove the already-authorised account before opening remote storage.
await cloudflareRequest(`accounts/${config.account_id}/d1/database/${config.vars.D1_DATABASE_ID}`);
const proxy=await getPlatformProxy({configPath:path,envFiles:[],persist:false,remoteBindings:true});
try{
 const api=`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/d1/database/${config.vars.D1_DATABASE_ID}/export`;
 const fetcher=async(url,options)=>{
  if(url===api){const data=await cloudflareRequest(url.split('/client/v4/')[1],{method:'POST',body:JSON.parse(options.body)});return Response.json(data);}
  return fetch(url,options);
 };
 const result=await runDailyBackup({...config.vars,BACKUPS:proxy.env.BACKUPS,D1_BACKUP_TOKEN:'owner-session-in-memory'},{fetcher});
 await proxy.env.BACKUPS.put('health/latest.json',JSON.stringify({status:'success',at:new Date().toISOString(),key:result.key,bytes:result.bytes,skipped:result.skipped===true,method:'owner-operated-first-run'}));
 await writeFile('.local/first-remote-backup.json',JSON.stringify({...result,authentication:'existing-owner-Wrangler-OAuth',permanentCredentialVerified:false,scheduleEnabled:false},null,2),{mode:0o600});
 console.log(JSON.stringify({key:result.key,bytes:result.bytes,checksum:result.sha256,skipped:result.skipped===true,scheduleEnabled:false}));
}finally{await proxy.dispose();}
