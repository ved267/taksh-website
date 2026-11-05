// Explicit data restore/delta command, not request-time schema work. Default is a dry run.
import{readFile,writeFile,mkdir}from'node:fs/promises';import{resolve}from'node:path';import{businessTables,businessUpsertSql}from'../lib/cloudflare/delta-import.mjs';import{cloudflareRequest}from'./cloudflare-api.mjs';
const path=process.argv[2],apply=process.argv.includes('--apply');
if(!path?.startsWith('/Users/devanshsmac/Desktop/Taksh Website Export/'))throw new Error('Use the private owner Sites export path.');
const exported=JSON.parse(await readFile(path,'utf8')),config=JSON.parse(await readFile('wrangler.json','utf8')),database=config.d1_databases[0].database_id;
if(config.name!=='taksh-store'||database!=='d110db81-9cb7-4b8d-90e5-3787ffd01517')throw new Error('Unexpected production restore destination.');
const rows={};for(const table of businessTables){const pages=exported.tables?.[table];if(!Array.isArray(pages)||!pages.length)throw new Error('Incomplete Sites table export.');rows[table]=[];for(let i=0;i<pages.length;i++){const page=pages[i],p=page.model_projection;if(!p||!Object.prototype.hasOwnProperty.call(p,'next_offset')||p.truncated||p.truncated_values||p.omitted_columns||p.omitted_rows||(p.next_offset!==null&&pages[i+1]?.offset!==p.next_offset))throw new Error('Truncated or incomplete Sites table export.');rows[table].push(...page.rows);}}
const photoKeys=rows.support.map(row=>row.photo_key).filter(Boolean);if(photoKeys.length){const storage=JSON.parse(await readFile('.local/sites-r2-export-verified.json','utf8'));if(photoKeys.some(key=>!storage.keys?.includes(key)))throw new Error('Copy and verify all referenced support photos before importing their references.');}
const statements=businessTables.flatMap(table=>rows[table].map(row=>businessUpsertSql(table,row))),counts=Object.fromEntries(businessTables.map(table=>[table,rows[table].length]));
const evidence={asOf:new Date().toISOString(),mode:apply?'apply':'dry-run',sourceExport:path,sourceCounts:counts,sourceSessionsRestored:false};
if(apply){let batch='';async function flush(){if(!batch)return;await cloudflareRequest(`accounts/${config.account_id}/d1/database/${database}/query`,{method:'POST',body:{sql:batch}});batch='';}for(const statement of statements){if(Buffer.byteLength(statement)>70000)throw new Error('A business record exceeds the safe import batch size.');if(Buffer.byteLength(batch+statement)>70000)await flush();batch+=statement+'\n';}await flush();
 evidence.destinationCounts={};evidence.exactSourceMatches=0;evidence.newerTargetPreserved=0;evidence.conflicts=0;
 for(const table of businessTables){const result=await cloudflareRequest(`accounts/${config.account_id}/d1/database/${database}/query`,{method:'POST',body:{sql:`SELECT * FROM "${table}"`}}),destination=result.result[0].results,key=table==='reporting_state'?'key':'id',byKey=new Map(destination.map(row=>[row[key],row]));evidence.destinationCounts[table]=destination.length;
  for(const source of rows[table]){const target=byKey.get(source[key]);if(!target){evidence.conflicts++;continue;}const columns=Object.keys(source).sort();if(JSON.stringify(columns.map(c=>source[c]))===JSON.stringify(columns.map(c=>target[c]))){evidence.exactSourceMatches++;continue;}
   const material=['details','items','total','currency'].filter(c=>c in source);
   if(table==='orders'&&target.status==='placed'&&source.status==='placed'&&material.some(c=>source[c]!==target[c])){evidence.conflicts++;continue;}
   if((table==='orders'&&target.status==='placed')||(target.updated_at&&target.updated_at>=source.updated_at)){evidence.newerTargetPreserved++;continue;}evidence.conflicts++;
  }
 }
 evidence.allSourceRecordsReconciled=evidence.conflicts===0;if(evidence.conflicts)process.exitCode=1;
}
await mkdir('.local',{recursive:true});await writeFile(resolve('.local','sites-import-evidence.json'),JSON.stringify(evidence,null,2),{mode:0o600});console.log(JSON.stringify({...evidence,sourceExport:'private owner export'}));
