export async function verifyBackupCredential(token,config,{fetcher=fetch,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 if(!/^[a-f0-9]{32}$/.test(config.account_id||'')||!/^[-a-f0-9]{36}$/.test(config.vars?.D1_DATABASE_ID||''))throw new Error('Unexpected backup destination.');
 const api=`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/d1/database/${config.vars.D1_DATABASE_ID}/export`;let bookmark;
 for(let n=0;n<120;n++){
  const response=await fetcher(api,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({output_format:'polling',...(bookmark?{current_bookmark:bookmark}:{}),dump_options:{compatibility:'d1'}})});
  if(!response.ok)throw new Error('Backup credential cannot export this D1 database.');
  const data=await response.json();if(!data.success||!data.result||data.result.status==='error'||data.result.error)throw new Error('Backup credential export verification failed.');
  if(data.result.status==='complete'&&data.result.result?.signed_url)return{asOf:new Date().toISOString(),sourceDatabaseId:config.vars.D1_DATABASE_ID,exportPermissionVerified:true};
  bookmark=data.result.at_bookmark||data.result.current_bookmark;if(!bookmark)throw new Error('Backup credential export verification has no polling bookmark.');await wait(1000);
 }
 throw new Error('Backup credential export verification timed out.');
}
