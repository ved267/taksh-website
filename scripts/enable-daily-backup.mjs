import{readFile}from'node:fs/promises';import{execFileSync}from'node:child_process';import{resolve}from'node:path';
const proof=JSON.parse(await readFile('.local/remote-backup-verified.json','utf8')),config=JSON.parse(await readFile('wrangler.backup.json','utf8'));
const credential=JSON.parse(await readFile('.local/backup-credential-verified.json','utf8'));
if(!credential.exportPermissionVerified||credential.sourceDatabaseId!==config.vars.D1_DATABASE_ID||credential.storedWorker!=='taksh-daily-backup'||credential.storedSecret!=='D1_BACKUP_TOKEN'||Date.now()-Date.parse(credential.asOf)>24*60*60*1000)throw new Error('Verify and store the dedicated backup credential privately before enabling the schedule.');
if(!proof.checksumVerified||!proof.exactContentMatched||proof.sourceDatabaseId!==config.vars.D1_DATABASE_ID||Date.now()-Date.parse(proof.asOf)>24*60*60*1000)throw new Error('A matching remote backup/restore from the last24hours is required before enabling the daily schedule.');
const wrangler=resolve('node_modules/wrangler/bin/wrangler.js');const secrets=JSON.parse(execFileSync(process.execPath,[wrangler,'secret','list','--config','wrangler.backup.json'],{encoding:'utf8'}));
if(!secrets.some(secret=>secret.name==='D1_BACKUP_TOKEN'))throw new Error('Dedicated backup credential is not configured.');
execFileSync(process.execPath,[wrangler,'deploy','--config','wrangler.backup.json'],{stdio:'inherit'});
console.log('Daily backup schedule enabled after a verified independent remote restore.');
