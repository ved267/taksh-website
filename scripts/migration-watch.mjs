// Cloud-hosted checks. No customer records, secrets or healthy-state notifications.
import {execFileSync} from 'node:child_process';
import {cloudflareRequest} from './cloudflare-api.mjs';
import {migrationWindow,appendWatchMilestone,recoverOnce,failureSignature,checkWatchIntegrations} from '../lib/cloudflare/operations.mjs';
const repository='ved267/taksh-website',mode=process.argv[2]||'watch',cutover=process.env.TAKSH_CUTOVER_AT,now=new Date(),window=migrationWindow(cutover,now);
if(process.env.GITHUB_REPOSITORY!==repository||process.env.GITHUB_REF!=='refs/heads/main')throw new Error('Migration watch requires trusted main.');
async function github(path,method='GET',body){
 const r=await fetch(`https://api.github.com/repos/${repository}/${path}`,{method,redirect:'error',headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok)throw new Error('GitHub notification operation failed.');return r.status===204?null:r.json();
}
async function findIssue(title){return(await github('issues?state=all&per_page=100')).find(i=>i.title===title);}
const attentionTitle='[Taksh migration] Attention required';
let incident;
const recoveryMarker=state=>'<!-- taksh-recovery:'+Buffer.from(JSON.stringify(state)).toString('base64')+' -->';
async function readRecovery(){incident=await findIssue(attentionTitle);const encoded=incident?.body?.match(/<!-- taksh-recovery:([A-Za-z0-9+/=]+) -->/)?.[1];return encoded?JSON.parse(Buffer.from(encoded,'base64').toString('utf8')):{};}
async function saveRecovery(state){
 const body='Production recovery is in progress. Intent is saved before attempting the rollback.\n\n'+recoveryMarker(state);
 if(incident)incident=await github('issues/'+incident.number,'PATCH',{body,state:'open'});
 else incident=await github('issues','POST',{title:attentionTitle,body,assignees:['ved267']});
}
async function notify(title,body,signature){
 const old=await findIssue(title),marker=signature?'<!-- failure:'+signature+' -->':'';
 if(old&&(signature?old.state==='open'&&old.body?.includes(marker):true))return;
 const recovery=title===attentionTitle?old?.body?.match(/<!-- taksh-recovery:[A-Za-z0-9+/=]+ -->/)?.[0]||'':'';
 const updated='@ved267\n\n'+body+'\n\n'+marker+'\n'+recovery;
 if(old){await github('issues/'+old.number,'PATCH',{body:updated,state:'open'});await github('issues/'+old.number+'/comments','POST',{body:'Migration failure changed.\n\n'+body});}
 else await github('issues','POST',{title,body:updated,assignees:['ved267']});
}
async function recordMilestone(body,failures,metrics){
 const branch='codex/migration-72h-milestone',main=await github('git/ref/heads/main');
 const existing=await github('pulls?state=all&head=ved267:'+branch);
 if(existing.length)return 'Existing milestone pull request: '+existing[0].html_url;
 const file=await github('contents/MIGRATION-STATUS.md?ref=main'),previous=Buffer.from(file.content,'base64').toString('utf8');
 const content=appendWatchMilestone(previous,{cutover,checkedAt:now.toISOString(),failures,metrics});
 if(content===previous)return 'Milestone already recorded on main.';
 try{await github('git/refs','POST',{ref:'refs/heads/'+branch,sha:main.object.sha});}catch{await github('git/ref/heads/'+branch);}
 await github('contents/MIGRATION-STATUS.md','PUT',{message:'Record the 72-hour migration milestone',branch,sha:file.sha,content:Buffer.from(content).toString('base64')});
 const pr=await github('pulls','POST',{title:'Record the 72-hour migration milestone',head:branch,base:'main',body:'What: append the scheduled 72-hour status milestone. Why: retain actual cloud checks without daily reports. Tested: hosted migration watch; no application files changed.\n\n'+body});
 return 'Milestone pull request: '+pr.html_url;
}
async function stop(name){await github(`actions/workflows/${name}/disable`,'PUT');}
if(window.phase==='inactive'){console.log('No active cutover window.');process.exit(0);}
if(mode==='retirement'){
 if(window.retirementDue){await notify('[Taksh migration] 14-day Sites retirement decision','The 14-day rollback window has elapsed. Keep Sites intact until the owner approves retirement. Take a final Sites export first; do not retire automatically. Runbooks: docs/OPERATIONS.md.');await stop('retirement.yml');}process.exit(0);
}
const failures=[],account='60742c7f90408058b71f1065a6815ddd';
for(const path of ['/','/sets/gully-cricket','/robots.txt']){
 try{const r=await fetch('https://taksh.store'+path,{redirect:'error',signal:AbortSignal.timeout(15000)});if(r.status!==200)failures.push(path+' HTTP '+r.status);await r.body?.cancel();}catch{failures.push(path+' network/TLS failure');}
}
const integrations=await checkWatchIntegrations({now,
 metrics:async()=>{
  const query=`{viewer{accounts(filter:{accountTag:"${account}"}){workersInvocationsAdaptive(limit:10,filter:{datetime_geq:"${cutover}",datetime_lt:"${now.toISOString()}",scriptName:"taksh-store"}){sum{requests errors cpuTimeUs}}}}}`;
  const result=await cloudflareRequest('graphql',{method:'POST',body:{query}});if(result.errors?.length)throw new Error('Analytics unavailable');return result.data.viewer.accounts[0].workersInvocationsAdaptive[0]?.sum||{requests:0,errors:0,cpuTimeUs:0};
 },
 sheet:async()=>{
  const result=await cloudflareRequest(`accounts/${account}/d1/database/d110db81-9cb7-4b8d-90e5-3787ffd01517/query`,{method:'POST',body:{sql:"SELECT payload FROM reporting_state WHERE key='customer-sheet'"}});
  return JSON.parse(result.result[0].results[0]?.payload||'{}');
 }
});
failures.push(...integrations.failures);const metrics=integrations.metrics;
if(failures.length){
 let rollback='Not attempted: integration/monitoring warning only.';
 if(failures.some(x=>/HTTP|network\/TLS/.test(x))&&process.env.TAKSH_PRODUCTION_READY==='true'){
  try{
   const inspection=JSON.parse(execFileSync(process.execPath,['scripts/rollback.mjs','production'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).split('\n')[0]);
   const recovery=await recoverOnce({versions:{current:inspection.currentVersion,previous:inspection.rollbackVersion},read:readRecovery,save:saveRecovery,
    rollback:async versions=>{execFileSync(process.execPath,['scripts/rollback.mjs','production','--apply','--expected-current='+versions.current,'--target='+versions.previous],{stdio:['ignore','pipe','pipe']});}});
   rollback=recovery.message;
  }catch{rollback='Recovery could not be planned or persisted safely; owner attention required.';}
 }
 await notify(attentionTitle,`Detected ${now.toISOString()}\n\n${failures.map(x=>'- '+x).join('\n')}\n\n${rollback}\n\nWorkflow: https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`,failureSignature(failures,rollback));
}
if(window.phase==='summary'){
 const body=`Cutover: ${cutover}\nChecked: ${now.toISOString()}\n\n${failures.length?'Needs attention: '+failures.join('; '):'Website/TLS paths healthy; Customer Sheet acknowledgement recent.'} Cloudflare counts since cutover (delayed/sampled): ${JSON.stringify(metrics||{})}. Keep Sites until the separate 14-day retirement decision.\n\nWorkflow: https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;
 let status;try{status=await recordMilestone(body,failures,metrics);}catch{status='Status pull request could not be created. The issue contains the milestone; GitHub Actions may need permission to create pull requests.';}
 await notify('[Taksh migration] 72-hour summary',body+'\n\n'+status);await stop('migration-watch.yml');
}
if(failures.length)throw new Error('Migration check needs attention; private issue posted.');
console.log(window.phase==='summary'?'72-hour summary posted; watch disabled.':'Healthy; no notification.');
