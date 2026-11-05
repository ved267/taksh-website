// Owner-only offsite copy; SQL never goes into Git, logs or chat.
import{mkdir,readFile,chmod}from'node:fs/promises';import{resolve,join}from'node:path';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';
const root='/Users/devanshsmac/Desktop/Taksh Website Export';
const directory=resolve(root,new Date().toISOString().slice(0,7),'private-data');
await mkdir(directory,{recursive:true,mode:0o700});await chmod(directory,0o700);
const wrangler=resolve('node_modules/wrangler/bin/wrangler.js');
function download(key,file){execFileSync(process.execPath,[wrangler,'r2','object','get','taksh-private-backups/'+key,'--remote','--file',file],{stdio:['ignore','pipe','pipe']});}
const healthFile=join(directory,'backup-health.json');download('health/latest.json',healthFile);await chmod(healthFile,0o600);
const health=JSON.parse(await readFile(healthFile,'utf8'));
if(health.status!=='success'||!/^d1\/\d{4}-\d{2}-\d{2}\/taksh-production\.sql$/.test(health.key||''))throw new Error('Latest remote backup is not a verified success.');
const day=health.key.split('/')[1],sqlFile=join(directory,day+'-taksh-production.sql'),manifestFile=join(directory,day+'-manifest.json');
download(health.key,sqlFile);await chmod(sqlFile,0o600);download(health.key.replace(/taksh-production\.sql$/,'manifest.json'),manifestFile);await chmod(manifestFile,0o600);
const [sql,manifestText]=await Promise.all([readFile(sqlFile),readFile(manifestFile,'utf8')]),manifest=JSON.parse(manifestText);
if(createHash('sha256').update(sql).digest('hex')!==manifest.sha256||sql.length!==manifest.bytes)throw new Error('Offsite copy checksum/size mismatch.');
console.log(JSON.stringify({privateSqlPath:sqlFile,privateManifestPath:manifestFile,bytes:sql.length,checksumVerified:true}));
