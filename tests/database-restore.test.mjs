import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createDatabase} from '../db/portable-database.mjs';
const script=resolve('scripts/restore-migration-backup.mjs');
test('restore preserves historical prices and exclusions, omits sessions, and refuses a nonempty target',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'taksh-restore-'));
 try{
  const backup=join(directory,'backup.json'),target='file:'+join(directory,'target.sqlite3');
  const row={id:'test',token_hash:'test-token-hash',reference:'TK-TEST',created_at:'2026-01-01',updated_at:'2026-01-01',placed_at:'2026-01-01',status:'placed',last_step:1,items:'[{"slug":"nonsense","price":123,"quantity":1}]',total:123,details:'{"email":"owner@example.test"}',device_type:'phone',arrival_page:'/',utm_source:'',utm_medium:'',utm_campaign:'',email_status:'not_configured',version:4,traffic_type:'test',referrer:'',currency:'INR'};
  const tables={};for(const name of ['orders','enquiries','subscriptions','support','reporting_state','admin_sessions','rate_limits'])tables[name]={columns:[],rows:[],has_more:false,model_projection:{truncated:false}};
  tables.orders={...tables.orders,columns:Object.keys(row),rows:[row]};tables.admin_sessions={...tables.admin_sessions,columns:['token_hash','expires_at'],rows:[{token_hash:'old-session',expires_at:9999999999999}]};
  await writeFile(backup,JSON.stringify({tables}));
  const run=()=>spawnSync(process.execPath,[script,'--backup',backup,'--apply','--target',target],{cwd:resolve('.'),env:{...process.env,TURSO_DATABASE_URL:target,TURSO_AUTH_TOKEN:''},encoding:'utf8'});
  const restored=run();assert.equal(restored.status,0,restored.stderr);assert.ok(!restored.stdout.includes('owner@example.test'));
  const db=createDatabase({url:target});try{assert.deepEqual(await db.prepare('SELECT * FROM orders').first(),row);assert.equal((await db.prepare('SELECT * FROM admin_sessions').all()).results.length,0)}finally{db.close()}
  const refused=run();assert.notEqual(refused.status,0);assert.match(refused.stderr,/empty|fresh/i);
 }finally{await rm(directory,{recursive:true,force:true})}
});
