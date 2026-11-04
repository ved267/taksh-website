import {isNetlify} from '../lib/hosting.mjs';
import {readFile,readdir} from 'node:fs/promises';
import {createDatabase,databaseConfig} from '../db/portable-database.mjs';
if(process.env.VERCEL||isNetlify(process.env))throw new Error('Initialise hosted databases through a reviewed migration, not this local command.');
const config=databaseConfig(process.env);
if(!config.url.startsWith('file:'))throw new Error('This command only initialises a local database.');
const db=createDatabase(config);
try{
 await db.exec('CREATE TABLE IF NOT EXISTS _taksh_local_migrations(name TEXT PRIMARY KEY)');
 for(const name of (await readdir('drizzle')).filter(n=>n.endsWith('.sql')).sort()){
  if(await db.prepare('SELECT name FROM _taksh_local_migrations WHERE name=?').bind(name).first())continue;
  const statements=(await readFile('drizzle/'+name,'utf8')).split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
  await db.batch([...statements.map(sql=>db.prepare(sql)),db.prepare('INSERT INTO _taksh_local_migrations VALUES (?)').bind(name)]);
 }
 console.log('Local schema ready. No live customer data imported.');
}finally{db.close()}
