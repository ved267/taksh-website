import test from'node:test';import assert from'node:assert/strict';
import{previousDeployment}from'../lib/cloudflare/rollback.mjs';
test('rollback chooses the previous distinct complete version, regardless of API ordering',()=>{
 const row=(day,id,percentage=100)=>({created_on:`2026-11-${day}T00:00:00Z`,versions:[{version_id:id,percentage}]});
 assert.deepEqual(previousDeployment([row('03','old'),row('05','new'),row('04','old')]),{current:'new',previous:'old'});
 assert.throws(()=>previousDeployment([row('05','new')]),/previous/);
 assert.throws(()=>previousDeployment([row('04','old'),row('05','new',50)]),/gradual/);
});
