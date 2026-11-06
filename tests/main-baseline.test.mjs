import test from'node:test';import assert from'node:assert/strict';import{zipSync,strToU8}from'fflate';import*as baseline from'../lib/cloudflare/main-baseline.mjs';
const sha='1'.repeat(40),repo='ved267/taksh-website',steps=['Locked install','Build','Unit tests','Type check','Lint','Request flows and page weights','Compare with main baseline','Keep numeric performance evidence'];
const report={schema:1,measuredAt:'2026-11-06T00:00:00Z',totals:{jsGzip:100,cssGzip:50,workerGzip:414782},pages:{'/':{htmlGzip:20,jsGzip:100,cssGzip:50,pageBytes:170}}};
function fixture(change={}){const run={status:'completed',id:1,head_sha:sha,head_branch:'main',event:'push',conclusion:'success',path:'.github/workflows/validate.yml',repository:{full_name:repo},head_repository:{full_name:repo},...change};let signedAuth;
 const fetcher=async(url,opts={})=>{if(url.includes('/workflows/'))return Response.json({workflow_runs:[run]});if(url.includes('/jobs?'))return Response.json({jobs:[{conclusion:'success',steps:steps.map(name=>({name,conclusion:'success'}))}]});if(url.includes('/runs/1/artifacts'))return Response.json({artifacts:[{id:2,name:'performance',expired:false,size_in_bytes:1000}]});if(url.endsWith('/artifacts/2/zip'))return new Response(null,{status:302,headers:{location:'https://artifact.example/report.zip'}});assert.equal(url,'https://artifact.example/report.zip');signedAuth=opts.headers?.Authorization;return new Response(zipSync({'performance-current.json':strToU8(JSON.stringify(report))}));};
 return{fetcher,signedAuth:()=>signedAuth};}
test('baseline uses exact successful main evidence, verifies steps and downloads signed storage without auth',async()=>{const f=fixture();const result=await baseline.fetchMainBaseline(sha,{token:'public-test-token',fetcher:f.fetcher});assert.deepEqual(result.report,report);assert.equal(result.runId,1);assert.equal(f.signedAuth(),undefined);});
test('branch, fork and wrong-commit evidence cannot become the main baseline',async()=>{for(const change of[{head_branch:'claude/task'},{head_sha:'2'.repeat(40)},{event:'pull_request'},{repository:{full_name:'other/repo'}},{conclusion:'failure'}])assert.equal(await baseline.fetchMainBaseline(sha,{token:'public-test-token',fetcher:fixture(change).fetcher}),null);});
test('numeric reports reject unexpected fields and oversized ZIP members',()=>{
 const unexpected=zipSync({'performance-current.json':strToU8(JSON.stringify({...report,unexpected:'not metrics'}))});
 assert.throws(()=>baseline.readPerformanceArchive(unexpected),/numeric|report/i);
 const large=zipSync({'performance-current.json':new Uint8Array(600000)});
 assert.throws(()=>baseline.readPerformanceArchive(large),/size|large|bound/i);
});
