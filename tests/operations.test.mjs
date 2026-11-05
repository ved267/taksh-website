import test from 'node:test';import assert from 'node:assert/strict';import{DatabaseSync}from'node:sqlite';
import*as operations from'../lib/cloudflare/operations.mjs';
test('manual operations refuse untrusted refs and production stays separately locked',()=>{
 const context={repository:'ved267/taksh-website',ref:'refs/heads/main',deploymentReady:true,productionReady:false};
 for(const operation of ['backup','restore-staging','migrate-staging','rollback-staging','deploy-staging','usage'])assert.doesNotThrow(()=>operations.authorizeOperation(operation,context));
 for(const operation of ['production','migrate-production','rollback-production'])assert.throws(()=>operations.authorizeOperation(operation,context),/production/i);
 assert.doesNotThrow(()=>operations.authorizeOperation('production',{...context,productionReady:true}));
 for(const change of [{ref:'refs/heads/claude/task'},{repository:'other/repo'},{deploymentReady:false}])assert.throws(()=>operations.authorizeOperation('backup',{...context,...change}));
 assert.throws(()=>operations.authorizeOperation('unknown',context));
});
test('restore selects only the fixed staging database and validates native backup integrity',()=>{
 const prod={account_id:'a'.repeat(32),d1_databases:[{database_id:'production'}]},stage={account_id:'a'.repeat(32),d1_databases:[{database_id:'staging'}]};
 assert.equal(operations.restoreDestination(prod,stage),'staging');
 assert.throws(()=>operations.restoreDestination(prod,{...stage,d1_databases:prod.d1_databases}),/staging/i);
 const sql=Buffer.from('CREATE TABLE requests(id TEXT PRIMARY KEY,total INTEGER);INSERT INTO requests VALUES (\'synthetic\',123);');
 const manifest={databaseId:'production',key:'d1/2026-11-05/taksh-production.sql',bytes:sql.length,sha256:operations.sha256(sql)};
 assert.doesNotThrow(()=>operations.verifySqlBackup(sql,manifest,'production'));
 assert.doesNotThrow(()=>operations.verifySqlBackup(sql,{...manifest,key:'d1/2026-11-05/00000000-0000-4000-8000-000000000001/taksh-production.sql'},'production'));
 assert.equal(operations.validDailyBackupKey('d1/pre-restore/123/staging.sql'),false);
 assert.throws(()=>operations.verifySqlBackup(Buffer.concat([sql,Buffer.from('x')]),manifest,'production'),/integrity/i);
 assert.throws(()=>operations.verifySqlBackup(sql,manifest,'other'),/source/i);
 const one=new DatabaseSync(':memory:');one.exec(sql.toString());const two=new DatabaseSync(':memory:');two.exec(sql.toString());
 try{const a=operations.databaseSummary(one),b=operations.databaseSummary(two);assert.deepEqual(a,b);two.exec('UPDATE requests SET total=124');assert.notDeepEqual(operations.databaseSummary(two),a);}finally{one.close();two.close();}
});
test('cutover watch is bounded to 72 hours and retirement review starts after 14 days',()=>{
 const start='2026-11-05T10:00:00.000Z';assert.equal(operations.migrationWindow('',new Date(start)).phase,'inactive');assert.equal(operations.migrationWindow(start,new Date('2026-11-06T10:00:00Z')).phase,'watch');assert.equal(operations.migrationWindow(start,new Date('2026-11-08T10:00:00Z')).phase,'summary');assert.equal(operations.migrationWindow(start,new Date('2026-11-19T10:00:00Z')).retirementDue,true);
});

test('72-hour milestone remains due when checks fail and is written only once',()=>{
 const text='# Status\n\nExisting evidence.\n';
 const result=operations.appendWatchMilestone(text,{cutover:'2026-11-05T10:00:00Z',checkedAt:'2026-11-08T10:00:00Z',failures:['Sheet stale'],metrics:{requests:42,errors:0}});
 assert.match(result,/72-hour milestone/);assert.match(result,/Sheet stale/);
 assert.equal(operations.appendWatchMilestone(result,{failures:[]}),result);
});
