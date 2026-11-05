const MAX_BYTES=20*1024*1024;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function boundedBytes(response){
 if(!response.ok||!response.body)throw new Error('D1 export download failed.');
 if(/text\/html/i.test(response.headers.get('Content-Type')||''))throw new Error('D1 export download was not SQL.');
 if(Number(response.headers.get('Content-Length'))>MAX_BYTES)throw new Error('D1 export is larger than the configured backup size limit.');
 const reader=response.body.getReader(),parts=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES){await reader.cancel();throw new Error('D1 export is larger than the configured backup size limit.')}parts.push(value)}}finally{reader.releaseLock()}
 if(!size)throw new Error('D1 export was empty.');
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length}return bytes;
}
export async function runDailyBackup(env,{fetcher=fetch,wait=delay,now=new Date(),force=false}={}){
 if(!/^[a-f0-9]{32}$/.test(env.CLOUDFLARE_ACCOUNT_ID||'')||!/^[-a-f0-9]{36}$/.test(env.D1_DATABASE_ID||'')||!env.D1_BACKUP_TOKEN||!env.BACKUPS)throw new Error('Daily D1 backup configuration is incomplete.');
 const prefix='d1/'+now.toISOString().slice(0,10)+'/',snapshot=prefix+crypto.randomUUID()+'/',key=snapshot+'taksh-production.sql',manifestKey=snapshot+'manifest.json',pointer=prefix+'latest.json';
 const previous=await env.BACKUPS.get(pointer);
 if(previous&&!force){const manifest=await previous.json(),object=await env.BACKUPS.head(manifest.key);if(object?.size===manifest.bytes&&object.customMetadata?.sha256===manifest.sha256)return {...manifest,skipped:true};throw new Error('Existing D1 backup failed its integrity metadata check.');}
 const api=`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.D1_DATABASE_ID}/export`;
 let bookmark,signed;
 for(let attempt=0;attempt<120;attempt++){
  const response=await fetcher(api,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+env.D1_BACKUP_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({output_format:'polling',...(bookmark?{current_bookmark:bookmark}:{}),dump_options:{compatibility:'d1'}})});
  if(!response.ok)throw new Error('D1 export API request failed.');
  const data=await response.json(),result=data.result;
  if(!data.success||!result||result.status==='error'||result.error)throw new Error('D1 export failed.');
  if(result.status==='complete'){signed=result.result?.signed_url;break}
  bookmark=result.at_bookmark||result.current_bookmark;if(!bookmark)throw new Error('D1 export polling bookmark is missing.');
  await wait(1000);
 }
 if(!signed||new URL(signed).protocol!=='https:')throw new Error('D1 export did not complete within the polling limit.');
 // The export's signed download URL needs no API authorization header.
 const bytes=await boundedBytes(await fetcher(signed,{redirect:'error'}));
 const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 const manifest={key,bytes:bytes.length,sha256,createdAt:now.toISOString(),databaseId:env.D1_DATABASE_ID,format:'d1-sql'};
 await env.BACKUPS.put(key,bytes,{httpMetadata:{contentType:'application/sql'},customMetadata:{sha256}});
 // Publish completion only after the private SQL object is fully written.
 await env.BACKUPS.put(manifestKey,JSON.stringify(manifest),{httpMetadata:{contentType:'application/json'}});
 // Never overwrite completed SQL: publish the daily pointer only after immutable objects exist.
 await env.BACKUPS.put(pointer,JSON.stringify(manifest),{httpMetadata:{contentType:'application/json'}});
 return manifest;
}
