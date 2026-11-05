import test from'node:test';import assert from'node:assert/strict';import*as watch from'../lib/cloudflare/operations.mjs';
test('automated recovery persists the failed version before one attempt and never rolls back into it',async()=>{
 let state={},calls=0;const run=versions=>watch.recoverOnce({versions,read:async()=>state,save:async next=>{state=next},rollback:async()=>{calls++;assert.ok(state.failedVersions.includes(versions.current))}});
 assert.equal((await run({current:'bad',previous:'good'})).attempted,true);
 assert.equal((await run({current:'good',previous:'bad'})).attempted,false);
 assert.equal((await run({current:'bad',previous:'good'})).attempted,false);
 assert.equal(calls,1);
});
test('new failure severity notifies while unchanged failures stay quiet',()=>{
 const initial=watch.failureSignature(['Sheet stale'],'No rollback');
 assert.equal(initial,watch.failureSignature(['Sheet stale'],'No rollback'));
 assert.notEqual(initial,watch.failureSignature(['Sheet stale','/ HTTP 500'],'Rollback failed'));
});
test('analytics failure cannot prevent independent Sheet-health verification',async()=>{
 let checked=false;const result=await watch.checkWatchIntegrations({metrics:async()=>{throw Error('permission')},sheet:async()=>{checked=true;return{lastSuccess:'2026-11-05T12:00:00Z'}},now:new Date('2026-11-05T12:01:00Z')});
 assert.equal(checked,true);assert.deepEqual(result.failures,['Cloudflare analytics check unavailable']);
});
test('restore public result allows counts but never private content hashes',()=>{
 const proof={at:'now',backupKey:'key',backupSha256:'private-content-hash',targetDatabaseId:'staging',counts:{orders:13},exactContentMatched:true,githubRun:'123',secret:'unexpected'};
 const result=watch.publicRestoreProof(proof);assert.deepEqual(result,{at:'now',backupKey:'key',targetDatabaseId:'staging',counts:{orders:13},exactContentMatched:true,githubRun:'123'});
 assert.equal(JSON.stringify(result).includes('private-content-hash'),false);
});
