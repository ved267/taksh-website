// Synthetic remote verification through a loopback proxy so existing tests retain their local-only guard.
// Hardcoded allowlist: NEVER use this helper for taksh.store or production data.
import {createServer}from'node:http';import{randomBytes,createHash}from'node:crypto';import{writeFile,rm}from'node:fs/promises';import{execFileSync,spawn}from'node:child_process';import{resolve}from'node:path';
const origin='https://codex-cloudflare-free-migration-taksh-store.taksh-ved267.workers.dev';
const password=randomBytes(32).toString('hex'),syncKey=randomBytes(32).toString('hex');
const file=resolve('.local/preview-synthetic-secrets.json');
await writeFile(file,JSON.stringify({ADMIN_PASSWORD_HASH:createHash('sha256').update(password).digest('hex'),CUSTOMER_SHEET_SYNC_KEY:syncKey}),{mode:0o600});
try{execFileSync(process.execPath,['scripts/deploy-preview.mjs'],{stdio:'inherit',env:{...process.env,TAKSH_PREVIEW_SECRETS_FILE:file}});}finally{await rm(file,{force:true});}
const server=createServer(async(req,res)=>{try{
 const started=Date.now();console.log('Preview request',req.method,new URL(req.url,origin).pathname);
 const body=[];for await(const part of req)body.push(part);
 const headers={...req.headers};delete headers.host;delete headers['content-length'];delete headers['accept-encoding'];headers.origin=origin;
 const response=await fetch(origin+req.url,{method:req.method,headers,signal:AbortSignal.timeout(120000),...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(body)})});
 res.statusCode=response.status;for(const [key,value]of response.headers)if(!['set-cookie','content-encoding','content-length','transfer-encoding'].includes(key))res.setHeader(key,value);
 res.setHeader('set-cookie',response.headers.getSetCookie());res.end(Buffer.from(await response.arrayBuffer()));console.log('Preview response',req.method,new URL(req.url,origin).pathname,response.status,Date.now()-started,'ms');
 }catch(error){console.error('Preview request failed',error.name);res.writeHead(502,{'Content-Type':'application/json'});res.end('{"error":"Synthetic preview proxy failed"}');}});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
try{for(const test of ['cart-lifecycle','availability-request','gully-cricket','demand','support-upload'])await new Promise((ok,bad)=>{const child=spawn(process.execPath,[`tests/${test}.integration.mjs`],{stdio:'inherit',env:{...process.env,TAKSH_TEST_ORIGIN:`http://127.0.0.1:${server.address().port}`,TAKSH_TEST_PASSWORD:password,TAKSH_TEST_SYNC_KEY:syncKey}});child.on('exit',code=>code===0?ok():bad(new Error(`Hosted ${test} failed (${code})`)));});console.log('All five synthetic request suites passed on the isolated hosted preview.');}finally{server.closeAllConnections();server.close();}
