import {mkdtemp,writeFile,readFile,cp,mkdir} from 'node:fs/promises';import {tmpdir}from'node:os';import {join,resolve}from'node:path';import {execFileSync}from'node:child_process';
import {adminSecurityAllowance} from '../lib/cloudflare/performance-regression.mjs';
const root=process.cwd(),sha=process.argv[2]||'origin/main';
if(!/^[a-f0-9]{40}$/.test(sha)&&sha!=='origin/main')throw new Error('Supply the pull request base commit SHA.');
const base=await mkdtemp(join(tmpdir(),'taksh-main-performance-'));
// Export exact base sources, never use PR dependencies for the main build.
const archive=execFileSync('git',['archive',sha],{maxBuffer:128*1024*1024});execFileSync('tar',['-x','-C',base],{input:archive});
// Bootstrap only: old main is a Sites export. Compare the same source using the plain hosting adapter.
// This cannot change main business source, assets, migrations or dependency versions.
const pkg=JSON.parse(await readFile(join(base,'package.json'),'utf8'));
if(!pkg.scripts['db:init']&&process.argv.includes('--adapt-legacy-sites')){
 await mkdir(join(base,'workers'),{recursive:true});
 for(const file of ['vite.config.ts','workers/app.ts','wrangler.json']){await cp(resolve(root,file),join(base,file),{recursive:true});}
 pkg.scripts.build='vinext build';await writeFile(join(base,'package.json'),JSON.stringify(pkg,null,2));
}
function run(file,args,env={}){execFileSync(file,args,{cwd:base,env:{...process.env,...env},stdio:'inherit'});}
const identity='00000000-0000-4000-8000-000000000001';
// v60 predates deterministic performance IDs. Override build metadata only in the temporary base export.
const nextPath=join(base,'next.config.ts'),nextSource=await readFile(nextPath,'utf8');
if(!nextSource.includes('TAKSH_PERFORMANCE_BUILD_ID'))await writeFile(nextPath,nextSource.replace('const nextConfig: NextConfig = {',`const nextConfig: NextConfig = { generateBuildId:async()=>process.env.TAKSH_PERFORMANCE_BUILD_ID!, deploymentId:process.env.TAKSH_PERFORMANCE_BUILD_ID,`));
const vitePath=join(base,'vite.config.ts'),viteSource=await readFile(vitePath,'utf8');
if(!viteSource.includes('TAKSH_PERFORMANCE_BUILD_ID'))await writeFile(vitePath,viteSource.replace('JSON.stringify(String(Date.now()))','JSON.stringify(process.env.TAKSH_PERFORMANCE_BUILD_ID||String(Date.now()))'));
run('npm',['ci','--no-audit','--no-fund']);run('npm',['run','build'],{TAKSH_PERFORMANCE_BUILD_ID:identity});
const output=resolve(root,'.local/performance-main.json');
run(process.execPath,[resolve(root,'scripts/test-local.mjs'),'--performance-only'],{TAKSH_APP_ROOT:base,TAKSH_PERFORMANCE_OUTPUT:output});
const changed=execFileSync('git',['diff','--name-only',sha,'HEAD'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
const allowance=adminSecurityAllowance(sha,changed);
execFileSync(process.execPath,['scripts/compare-performance.mjs',output,resolve(root,'.local/performance-current.json'),String(allowance)],{cwd:root,stdio:'inherit'});
