// Cloudflare Workers Builds runs this for EVERY non-production branch, independent of agent.
// It explicitly applies committed migrations before deploying; never runs inside a request.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {previewIdentity,isolatedPreviewConfig} from '../lib/cloudflare/preview-config.mjs';
import {cloudflareRequest} from './cloudflare-api.mjs';
const root=process.cwd();
const branch=process.env.WORKERS_CI_BRANCH||process.env.CF_PAGES_BRANCH||execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();
const identity=previewIdentity(branch);
const builtPath=resolve(root,'dist/server/wrangler.json'),base=JSON.parse(await readFile(builtPath,'utf8'));
const account=base.account_id;
if(!/^[a-f0-9]{32}$/.test(account||''))throw new Error('Cloudflare account is not configured.');
const dbs=(await cloudflareRequest(`accounts/${account}/d1/database?per_page=100`)).result;
let db=dbs.find(db=>db.name===identity.databaseName);
if(!db)db=(await cloudflareRequest(`accounts/${account}/d1/database`,{method:'POST',body:{name:identity.databaseName,primary_location_hint:'apac'}})).result;
const buckets=(await cloudflareRequest(`accounts/${account}/r2/buckets`)).result.buckets;
if(!buckets.some(bucket=>bucket.name===identity.bucketName))await cloudflareRequest(`accounts/${account}/r2/buckets`,{method:'POST',body:{name:identity.bucketName,locationHint:'apac',storageClass:'Standard'}});
const config=isolatedPreviewConfig(base,branch,db.uuid);
config.main=resolve(dirname(builtPath),base.main);
config.assets.directory=resolve(dirname(builtPath),base.assets.directory);
config.d1_databases.forEach(binding=>binding.migrations_dir=resolve(root,'drizzle'));
config.previews.d1_databases.forEach(binding=>binding.migrations_dir=resolve(root,'drizzle'));
await mkdir(resolve(root,'.local'),{recursive:true});
const configPath=resolve(root,'.local/wrangler-preview.json');
await writeFile(configPath,JSON.stringify(config,null,2));
const wrangler=resolve(root,'node_modules/wrangler/bin/wrangler.js');
function run(args){execFileSync(process.execPath,[wrangler,...args],{stdio:'inherit'});}
console.log(`Isolated synthetic preview: ${branch}; ${identity.databaseName}`);
run(['d1','migrations','apply','DB','--remote','--preview','--config',configPath]);
run(['preview','--name',branch,'--config',configPath,...(process.env.TAKSH_PREVIEW_SECRETS_FILE?['--secrets-file',resolve(process.env.TAKSH_PREVIEW_SECRETS_FILE)]:[])]);
