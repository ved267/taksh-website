import{createHash}from'node:crypto';
const operations=new Set(['backup','restore-staging','migrate-staging','migrate-production','rollback-staging','rollback-production','deploy-staging','usage','production']);
export function authorizeOperation(operation,context){
 if(!operations.has(operation))throw new Error('Unknown operation.');
 if(context.repository!=='ved267/taksh-website'||context.ref!=='refs/heads/main'||context.deploymentReady!==true)throw new Error('Operations require trusted main and verified deployment access.');
 if(['production','migrate-production','rollback-production'].includes(operation)&&context.productionReady!==true)throw new Error('Production remains locked pending the owner cutover go.');
}
export function restoreDestination(production,staging){const source=production.d1_databases?.[0]?.database_id,target=staging.d1_databases?.[0]?.database_id;if(!source||!target||source===target||production.account_id!==staging.account_id)throw new Error('Restore must target the distinct staging database in this account.');return target;}
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function verifySqlBackup(bytes,manifest,source){
 if(manifest.databaseId!==source)throw new Error('Backup source database does not match production.');
 if(!validDailyBackupKey(manifest.key)||bytes.length!==manifest.bytes||bytes.length>20*1024*1024||sha256(bytes)!==manifest.sha256)throw new Error('Backup integrity verification failed.');
}
export function quoteTable(name){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))throw new Error('Unsupported database table name.');return '"'+name+'"';}
export const tableListSql="SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' ORDER BY name";
const value=v=>v instanceof Uint8Array||Array.isArray(v)?{bytes:Buffer.from(v).toString('base64')}:v;
export function tableRowsSummary(rows){const canonical=rows.map(row=>JSON.stringify(Object.keys(row).sort().map(key=>[key,value(row[key])]))).sort();return {count:rows.length,sha256:sha256(canonical.join('\n'))};}
export function databaseSummary(database){return Object.fromEntries(database.prepare(tableListSql).all().map(({name})=>[name,tableRowsSummary(database.prepare('SELECT * FROM '+quoteTable(name)).all())]));}
export function migrationWindow(cutover,now=new Date()){const at=Date.parse(cutover),elapsed=now.getTime()-at;if(!Number.isFinite(at)||elapsed<0)return{phase:'inactive',retirementDue:false};return{phase:elapsed<72*3600000?'watch':'summary',retirementDue:elapsed>=14*86400000};}
export function appendWatchMilestone(text,{cutover,checkedAt,failures=[],metrics}={}){
 if(text.includes('<!-- taksh-72h-milestone -->'))return text;
 return text+'\n\n<!-- taksh-72h-milestone -->\n## 72-hour milestone\n\n'+
  `Cutover: ${cutover}. Checked: ${checkedAt}.\n\n`+
  (failures.length?'Needs attention: '+failures.join('; ')+'.':'Website/TLS and Sheet acknowledgement checks passed.')+
  '\n\nCloudflare counters since cutover (delayed/sampled): '+JSON.stringify(metrics||{})+
  '. Counts contain no customer records. Sites remains available until the separate 14-day retirement decision.\n';
}
export async function recoverOnce({versions,read,save,rollback}){
 const state=await read()||{},failed=new Set(state.failedVersions||[]),attempted=new Set(state.attemptedFrom||[]);
 if(attempted.has(versions.current)||failed.has(versions.previous))return{attempted:false,message:'Recovery already attempted or previous version is known failed; owner attention required.'};
 failed.add(versions.current);attempted.add(versions.current);
 // Durable intent precedes the action, including when the process dies mid-rollback.
 await save({failedVersions:[...failed],attemptedFrom:[...attempted]});
 try{await rollback(versions);return{attempted:true,message:'Previous production version restored and health checked.'}}catch{return{attempted:true,message:'Automatic rollback attempted but failed; owner attention required.'}}
}
export const failureSignature=(failures,recovery)=>sha256(JSON.stringify({failures:[...failures].sort(),recovery}));
export async function checkWatchIntegrations({metrics,sheet,now}){
 const failures=[];let counters,reporting;
 try{counters=await metrics()}catch{failures.push('Cloudflare analytics check unavailable')}
 try{reporting=await sheet();if(!reporting.lastSuccess||now-Date.parse(reporting.lastSuccess)>20*60000)failures.push('Customer Sheet has no recent successful acknowledgement')}catch{failures.push('Customer Sheet health check unavailable')}
 return{failures,metrics:counters,reporting};
}
export function publicRestoreProof(proof){const{at,backupKey,targetDatabaseId,counts,exactContentMatched,githubRun}=proof;return{at,backupKey,targetDatabaseId,counts,exactContentMatched,githubRun};}
export const validDailyBackupKey=key=>/^d1\/\d{4}-\d{2}-\d{2}\/(?:[a-f0-9-]{36}\/)?taksh-production\.sql$/.test(key||'');
