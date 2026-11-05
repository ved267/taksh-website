// Fresh, local-only synthetic D1/R2 per invocation. No Cloudflare credentials are needed.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
const root=resolve(process.env.TAKSH_APP_ROOT||process.cwd());
const temp=resolve(root,`.local/ci-${Date.now()}`);await mkdir(temp,{recursive:true});
const configFile=resolve(root,'dist/server/wrangler.json'),config=JSON.parse(await readFile(configFile,'utf8'));
config.main=resolve(dirname(configFile),config.main);
config.assets.directory=resolve(dirname(configFile),config.assets.directory);
config.vars={APP_ENV:'preview'};delete config.previews;
config.d1_databases=[{binding:'DB',database_name:'taksh-local-synthetic',database_id:'00000000-0000-0000-0000-000000000001',migrations_dir:resolve(root,'drizzle'),remote:false}];
config.r2_buckets=[{binding:'BUCKET',bucket_name:'taksh-local-synthetic',remote:false}];
delete config.routes;delete config.triggers;
const localConfig=resolve(temp,'wrangler.json');await writeFile(localConfig,JSON.stringify(config));
await writeFile(resolve(temp,'.dev.vars'),`ADMIN_PASSWORD_HASH=${createHash('sha256').update('taksh-local-demand-qa').digest('hex')}\nCUSTOMER_SHEET_SYNC_KEY=${'a'.repeat(64)}\nRESEND_API_KEY=\nFROM_EMAIL=\n`,{mode:0o600});
const wrangler=resolve(root,'node_modules/wrangler/bin/wrangler.js'),persist=resolve(temp,'state');
execFileSync(process.execPath,[wrangler,'d1','migrations','apply','DB','--local','--config',localConfig,'--persist-to',persist],{cwd:root,stdio:'inherit'});
const {startLocalWorker}=await import('./local-worker.mjs');
config.vars={APP_ENV:'preview',ADMIN_PASSWORD_HASH:createHash('sha256').update('taksh-local-demand-qa').digest('hex'),CUSTOMER_SHEET_SYNC_KEY:'a'.repeat(64),RESEND_API_KEY:'',FROM_EMAIL:''};
const worker=await startLocalWorker(root,config,persist);
const origin=worker.origin;
try{
 if(!process.argv.includes('--performance-only'))for(const test of ['cart-lifecycle','availability-request','gully-cricket','demand','support-upload'])await new Promise((ok,bad)=>{
  const run=spawn(process.execPath,[resolve(import.meta.dirname,'../tests',test+'.integration.mjs')],{cwd:root,stdio:'inherit',env:{...process.env,TAKSH_TEST_ORIGIN:origin}});
  run.on('error',bad);run.on('exit',code=>code===0?ok():bad(new Error(`Local ${test} failed (${code}). See ${temp}/worker.log`)));
 });
 const {measurePerformance}=await import('./measure-performance.mjs');
 const report=await measurePerformance(root,origin);
 const output=process.env.TAKSH_PERFORMANCE_OUTPUT||resolve(temp,'performance.json');await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log(`Performance evidence: ${output}`);
}finally{await worker.close();}
