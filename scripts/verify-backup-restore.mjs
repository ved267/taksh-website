// First-run restore into a fresh private database, never staging or production.
import{readFile,writeFile,mkdir}from'node:fs/promises';import{resolve}from'node:path';import{execFileSync}from'node:child_process';import{randomBytes,createHash}from'node:crypto';import{cloudflareRequest}from'./cloudflare-api.mjs';
const sqlPath=process.argv[2],manifestPath=process.argv[3];
if(!sqlPath?.startsWith('/Users/devanshsmac/Desktop/Taksh Website Export/')||!manifestPath?.startsWith('/Users/devanshsmac/Desktop/Taksh Website Export/'))throw new Error('Use the owner-only offsite backup paths.');
const manifest=JSON.parse(await readFile(manifestPath,'utf8')),sql=await readFile(sqlPath);
if(sql.length!==manifest.bytes||createHash('sha256').update(sql).digest('hex')!==manifest.sha256)throw new Error('Backup integrity check failed.');
const production=JSON.parse(await readFile('wrangler.json','utf8')),account=production.account_id,source=production.d1_databases[0].database_id;
const name='taksh-restore-check-'+new Date().toISOString().slice(0,10)+'-'+randomBytes(4).toString('hex');
const restored=(await cloudflareRequest(`accounts/${account}/d1/database`,{method:'POST',body:{name,primary_location_hint:'apac'}})).result;
if(restored.uuid===source||!name.startsWith('taksh-restore-check-'))throw new Error('Restore destination must be disposable and distinct.');
await mkdir('.local',{recursive:true});const config=resolve('.local/wrangler-restore-check.json');
await writeFile(config,JSON.stringify({account_id:account,name:'taksh-restore-check',d1_databases:[{binding:'RESTORE_DB',database_id:restored.uuid,database_name:name}]}));
try{execFileSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'d1','execute','RESTORE_DB','--remote','--config',config,'--file',resolve(sqlPath),'--yes'],{stdio:['ignore','pipe','pipe']});}catch{throw new Error('Remote restore import failed; inspect the private database operation. No SQL is printed.');}
async function query(id,sql){const r=await cloudflareRequest(`accounts/${account}/d1/database/${id}/query`,{method:'POST',body:{sql}});return r.result[0].results;}
const tables=(await query(source,"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name!='sqlite_sequence' ORDER BY name")).map(row=>row.name);
const restoredTables=(await query(restored.uuid,"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name!='sqlite_sequence' ORDER BY name")).map(row=>row.name);
if(JSON.stringify(tables)!==JSON.stringify(restoredTables))throw new Error('Backup restore table list differs.');
const counts={};for(const table of tables){if(!/^[a-z_][a-z0-9_]*$/i.test(table))throw new Error('Unexpected table name.');const [a,b]=await Promise.all([query(source,`SELECT * FROM "${table}"`),query(restored.uuid,`SELECT * FROM "${table}"`)]);const keys=Object.keys(a[0]||b[0]||{}).sort();const canonical=rows=>rows.map(row=>JSON.stringify(keys.map(key=>row[key]))).sort();if(JSON.stringify(canonical(a))!==JSON.stringify(canonical(b)))throw new Error('Backup restore content differs for '+table);counts[table]=a.length;}
const evidence={asOf:new Date().toISOString(),sourceDatabaseId:source,restoreDatabaseId:restored.uuid,restoreDatabaseName:name,backupKey:manifest.key||'private-manifest',checksumVerified:true,exactContentMatched:true,counts};
await writeFile('.local/remote-backup-verified.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
// Keep the private restore database until the evidence is reviewed; no public Worker binds it.
