// Setup/operations helper only. Normal Claude/Codex contributions need GitHub access, not this credential.
import {readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
let refreshed=false;
async function token(){
 if(process.env.CLOUDFLARE_API_TOKEN)return process.env.CLOUDFLARE_API_TOKEN;
 if(!refreshed&&!process.env.WRANGLER_AUTH_FILE){
  // Wrangler refreshes its authorised OAuth session; no new scopes are requested.
  try{execFileSync(process.execPath,[fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url)),'whoami'],{stdio:'ignore'});}catch{throw new Error('Wrangler sign-in could not be refreshed. Run wrangler whoami privately.');}
  refreshed=true;
 }
 const file=process.env.WRANGLER_AUTH_FILE||join(homedir(),process.platform==='darwin'?'Library/Preferences/.wrangler/config/default.toml':'.config/.wrangler/config/default.toml');
 const source=await readFile(file,'utf8'),match=source.match(/^oauth_token\s*=\s*("[^\r\n]+")/m);
 if(!match)throw new Error('Cloudflare setup authentication is unavailable. Use wrangler login.');
 return JSON.parse(match[1]);
}
export async function cloudflareRequest(path,{method='GET',body}={}){
 if(!/^(accounts\/|zones(?:\/|\?)|graphql$)/.test(path))throw new Error('Unsupported Cloudflare account operation.');
 const response=await fetch('https://api.cloudflare.com/client/v4/'+path,{method,redirect:'error',headers:{Authorization:'Bearer '+await token(),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const data=await response.json();
 if(!response.ok||data.success===false)throw new Error(`Cloudflare operation failed (HTTP ${response.status}, codes ${(data.errors||[]).map(error=>error.code).join(',')}).`);
 return data;
}
