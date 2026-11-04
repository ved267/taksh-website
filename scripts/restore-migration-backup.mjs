// Explicit, fresh-target restore. Customer values never appear in normal output.
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createDatabase,databaseConfig} from '../db/portable-database.mjs';
const args=process.argv.slice(2),option=name=>args[args.indexOf(name)+1];
if(!args.includes('--backup'))throw new Error('Pass --backup with an owner-only Sites JSON export.');
const raw=await readFile(option('--backup'),'utf8'),backup=JSON.parse(raw);
const business=['orders','enquiries','subscriptions','support','reporting_state'];
const known=[...business,'admin_sessions','rate_limits'];
for(const name of known){
 const table=backup.tables?.[name];if(!table||table.has_more||!Array.isArray(table.rows)||!Array.isArray(table.columns))throw new Error('Backup table is missing or incomplete: '+name);
 const projection=table.model_projection||{};
 if(projection.truncated||projection.truncated_values||projection.omitted_rows||projection.omitted_columns)throw new Error('Backup table was truncated: '+name);
 if(table.columns.some(column=>!/^\w+$/.test(column)))throw new Error('Invalid backup columns.');
 for(const row of table.rows)assert.deepEqual(Object.keys(row).sort(),[...table.columns].sort(),'Row columns do not match backup metadata.');
}
const summary={businessRows:Object.fromEntries(business.map(name=>[name,backup.tables[name].rows.length])),excluded:{admin_sessions:backup.tables.admin_sessions.rows.length,rate_limits:backup.tables.rate_limits.rows.length},sha256:createHash('sha256').update(raw).digest('hex')};
if(!args.includes('--apply')){console.log(JSON.stringify({dryRun:true,...summary},null,2));process.exit(0)}
const config=databaseConfig(process.env);
if(!args.includes('--target')||option('--target')!==config.url)throw new Error('An exact --target matching TURSO_DATABASE_URL is required.');
const db=createDatabase(config);
try{
 const existing=(await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'libsql_%'").all()).results;
 if(existing.length)throw new Error('Restore requires a fresh empty database; existing tables will not be changed.');
 const statements=[];
 for(const name of (await readdir('drizzle')).filter(name=>name.endsWith('.sql')).sort()){
  for(const sql of (await readFile('drizzle/'+name,'utf8')).split('--> statement-breakpoint').map(sql=>sql.trim()).filter(Boolean))statements.push(db.prepare(sql));
 }
 for(const name of business){
  const table=backup.tables[name];
  if(!table.rows.length)continue;
  const columns=table.columns.map(column=>'"'+column+'"').join(','),placeholders=table.columns.map(()=>'?').join(',');
  for(const row of table.rows)statements.push(db.prepare(`INSERT INTO ${name} (${columns}) VALUES (${placeholders})`).bind(...table.columns.map(column=>row[column])));
 }
 statements.push(db.prepare('CREATE TABLE _taksh_migration_receipt(backup_sha256 TEXT NOT NULL,restored_at TEXT NOT NULL)'));
 statements.push(db.prepare('INSERT INTO _taksh_migration_receipt VALUES (?,?)').bind(summary.sha256,new Date().toISOString()));
 await db.batch(statements);
 // Compare every copied column/value, not just row counts. Preserve stored prices and exclusions.
 for(const name of business){
  const table=backup.tables[name],rows=(await db.prepare('SELECT * FROM '+name).all()).results;
  const normalise=row=>JSON.stringify(table.columns.map(column=>row[column]));
  assert.deepEqual(rows.map(normalise).sort(),table.rows.map(normalise).sort(),'Restored values differ for '+name);
 }
 console.log(JSON.stringify({restored:true,verifiedEveryCopiedValue:true,...summary},null,2));
}finally{db.close()}
