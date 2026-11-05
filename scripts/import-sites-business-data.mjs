// Explicit reviewed data restore/delta command. Dry-run plans against current target; no writes by default.
import{readFile,writeFile,mkdir}from'node:fs/promises';import{resolve}from'node:path';import{businessTables,businessUpsertSql,reconcileBusinessRow,completeExportRows}from'../lib/cloudflare/delta-import.mjs';import{cloudflareRequest}from'./cloudflare-api.mjs';
const path=process.argv[2],apply=process.argv.includes('--apply');
if(!path?.startsWith('/Users/devanshsmac/Desktop/Taksh Website Export/'))throw new Error('Use the private owner Sites export path.');
const exported=JSON.parse(await readFile(path,'utf8')),config=JSON.parse(await readFile('wrangler.json','utf8')),database=config.d1_databases[0].database_id;
if(config.name!=='taksh-store'||database!=='d110db81-9cb7-4b8d-90e5-3787ffd01517')throw new Error('Unexpected production restore destination.');
const keyFor=table=>table==='reporting_state'?'key':'id',rows={};for(const table of businessTables)rows[table]=completeExportRows(exported.tables?.[table],keyFor(table));
const photoKeys=rows.support.map(row=>row.photo_key).filter(Boolean);if(photoKeys.length){const storage=JSON.parse(await readFile('.local/sites-r2-export-verified.json','utf8'));if(photoKeys.some(key=>!storage.keys?.includes(key)))throw new Error('Copy and verify all referenced support photos before importing their references.');}
async function targetRows(table){const r=await cloudflareRequest(`accounts/${config.account_id}/d1/database/${database}/query`,{method:'POST',body:{sql:`SELECT * FROM "${table}"`}});return r.result[0].results;}
const statements=[],counts=Object.fromEntries(businessTables.map(table=>[table,rows[table].length]));
const evidence={asOf:new Date().toISOString(),mode:apply?'apply':'dry-run',sourceExport:path,sourceCounts:counts,sourceSessionsRestored:false,conflicts:0,plannedWrites:0};
for(const table of businessTables){const destination=await targetRows(table),byKey=new Map(destination.map(row=>[row[keyFor(table)],row]));for(const source of rows[table]){const target=byKey.get(source[keyFor(table)]),decision=reconcileBusinessRow(table,source,target);if(decision.action==='conflict'){evidence.conflicts++;continue;}const sql=businessUpsertSql(table,source,target);if(sql)statements.push(sql);}}
evidence.plannedWrites=statements.length;
if(apply&&!evidence.conflicts){let batch='';async function flush(){if(!batch)return;await cloudflareRequest(`accounts/${config.account_id}/d1/database/${database}/query`,{method:'POST',body:{sql:batch}});batch='';}for(const statement of statements){if(Buffer.byteLength(statement)>70000)throw new Error('A business record exceeds the safe import batch size.');if(Buffer.byteLength(batch+statement)>70000)await flush();batch+=statement+'\n';}await flush();
 evidence.destinationCounts={};evidence.exactSourceMatches=0;evidence.explicitTargetProgressPreserved=0;
 for(const table of businessTables){const destination=await targetRows(table),byKey=new Map(destination.map(row=>[row[keyFor(table)],row]));evidence.destinationCounts[table]=destination.length;
  for(const source of rows[table]){const decision=reconcileBusinessRow(table,source,byKey.get(source[keyFor(table)]));if(decision.action!=='keep'){evidence.conflicts++;continue;}if(decision.reason==='exact')evidence.exactSourceMatches++;else evidence.explicitTargetProgressPreserved++;}
 }
 evidence.allSourceRecordsReconciled=evidence.conflicts===0;
}
if(evidence.conflicts)process.exitCode=1;
await mkdir('.local',{recursive:true});await writeFile(resolve('.local','sites-import-evidence.json'),JSON.stringify(evidence,null,2),{mode:0o600});console.log(JSON.stringify({...evidence,sourceExport:'private owner export'}));
