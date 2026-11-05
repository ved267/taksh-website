// Rolls code back only; never reverses database migrations or touches DNS.
import{execFileSync}from'node:child_process';import{resolve}from'node:path';import{mkdir,writeFile}from'node:fs/promises';import{previousDeployment}from'../lib/cloudflare/rollback.mjs';
const environment=process.argv[2];
if(!['staging','production'].includes(environment))throw new Error('Choose staging or production explicitly.');
const worker=environment==='staging'?'taksh-staging':'taksh-store',config=environment==='staging'?'wrangler.staging.json':'wrangler.json';
const wrangler=resolve('node_modules/wrangler/bin/wrangler.js');
function list(){return JSON.parse(execFileSync(process.execPath,[wrangler,'deployments','list','--name',worker,'--config',config,'--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}
const {current,previous}=previousDeployment(list());
const expectedCurrent=process.argv.find(v=>v.startsWith('--expected-current='))?.split('=')[1],target=process.argv.find(v=>v.startsWith('--target='))?.split('=')[1];
if((expectedCurrent&&current!==expectedCurrent)||(target&&previous!==target))throw new Error('Deployment changed since recovery planning; no rollback performed.');
console.log(JSON.stringify({environment,currentVersion:current,rollbackVersion:previous}));
if(!process.argv.includes('--apply')){console.log('Inspection only. Add --apply for the explicit rollback.');process.exit(0);}
const start=Date.now();
execFileSync(process.execPath,[wrangler,'rollback',previous,'--name',worker,'--config',config,'--yes','--message','Owner-authorised previous-version recovery'],{stdio:['ignore','pipe','pipe']});
const actual=list().sort((a,b)=>Date.parse(b.created_on)-Date.parse(a.created_on))[0];
if(actual.versions.length!==1||actual.versions[0].version_id!==previous||actual.versions[0].percentage!==100)throw new Error('Rollback command returned without the expected active version.');
const origin=environment==='staging'?'https://taksh-staging.taksh-ved267.workers.dev':'https://taksh.store';
for(const path of ['/','/sets/gully-cricket']){const response=await fetch(origin+path,{redirect:'error'});if(response.status!==200)throw new Error('Rollback health check failed for '+path);await response.body.cancel();}
const evidence={asOf:new Date().toISOString(),environment,fromVersion:current,toVersion:previous,elapsedMs:Date.now()-start,healthPassed:true};
await mkdir('.local',{recursive:true});await writeFile(`.local/${environment}-rollback-verified.json`,JSON.stringify(evidence,null,2));
console.log(JSON.stringify(evidence));
if(evidence.elapsedMs>=120000)throw new Error('Rollback succeeded but exceeded the two-minute target.');
