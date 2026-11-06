import test from'node:test';import assert from'node:assert/strict';
import{previousDeployment,workerDeployments}from'../lib/cloudflare/rollback.mjs';
test('rollback chooses the previous distinct complete version, regardless of API ordering',()=>{
 const row=(day,id,percentage=100)=>({created_on:`2026-11-${day}T00:00:00Z`,versions:[{version_id:id,percentage}]});
 assert.deepEqual(previousDeployment([row('03','old'),row('05','new'),row('04','old')]),{current:'new',previous:'old'});
 assert.throws(()=>previousDeployment([row('05','new')]),/previous/);
 assert.throws(()=>previousDeployment([row('04','old'),row('05','new',50)]),/gradual/);
});

test('recovery reads the deployment API independently of CLI logging and rejects missing history',async()=>{
 const rows=[{created_on:'2026-11-05T00:00:00Z',versions:[{version_id:'old',percentage:100}]},{created_on:'2026-11-06T00:00:00Z',versions:[{version_id:'new',percentage:100}]}];
 let requested;
 const deployments=await workerDeployments(async path=>{requested=path;return{result:{deployments:rows}}},'owner-account','taksh-staging');
 assert.deepEqual(previousDeployment(deployments),{current:'new',previous:'old'});
 assert.equal(requested,'accounts/owner-account/workers/scripts/taksh-staging/deployments');
 await assert.rejects(()=>workerDeployments(async()=>({result:{}}),'owner-account','taksh-staging'),/history is unavailable/);
});
