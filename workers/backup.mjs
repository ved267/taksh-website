import {runDailyBackup} from '../lib/cloudflare/daily-backup.mjs';
const worker={
 fetch(){return new Response('Not found.',{status:404,headers:{'Cache-Control':'no-store'}})},
 async scheduled(_event,env){
  try{const result=await runDailyBackup(env);await env.BACKUPS.put('health/latest.json',JSON.stringify({status:'success',at:new Date().toISOString(),key:result.key,bytes:result.bytes,skipped:result.skipped===true}));console.log('Daily D1 backup verified.',{bytes:result.bytes,skipped:result.skipped===true})}
  catch(error){await env.BACKUPS.put('health/latest.json',JSON.stringify({status:'failed',at:new Date().toISOString()}));console.error('Daily D1 backup failed. Check account export permissions and backup health.');throw error}
 }
};
export default worker;
