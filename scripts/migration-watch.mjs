// Cloud-hosted checks; notify only a new failure, once at 72h, and retirement review at 14d.
import{execFileSync}from'node:child_process';import{cloudflareRequest}from'./cloudflare-api.mjs';import{migrationWindow,appendWatchMilestone}from'../lib/cloudflare/operations.mjs';
const repository='ved267/taksh-website',mode=process.argv[2]||'watch',cutover=process.env.TAKSH_CUTOVER_AT,now=new Date(),window=migrationWindow(cutover,now);
if(process.env.GITHUB_REPOSITORY!==repository||process.env.GITHUB_REF!=='refs/heads/main')throw new Error('Migration watch requires trusted main.');
async function github(path,method='GET',body){const r=await fetch(`https://api.github.com/repos/${repository}/${path}`,{method,redirect:'error',headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw new Error('GitHub notification operation failed.');return r.status===204?null:r.json();}
async function notify(title,body){const issues=await github('issues?state=open&per_page=100');if(issues.some(i=>i.title===title))return;await github('issues','POST',{title,body:'@ved267\n\n'+body,assignees:['ved267']});}
async function recordMilestone(body){
 const branch='codex/migration-72h-milestone';
 const main=await github('git/ref/heads/main');
 const existing=await github('pulls?state=all&head=ved267:'+branch);
 if(existing.length)return 'Existing milestone pull request: '+existing[0].html_url;
 const file=await github('contents/MIGRATION-STATUS.md?ref=main');
 const previous=Buffer.from(file.content,'base64').toString('utf8');
 const content=appendWatchMilestone(previous,{cutover,checkedAt:now.toISOString(),failures,metrics});
 if(content===previous)return 'Milestone already recorded on main.';
 try{await github('git/refs','POST',{ref:'refs/heads/'+branch,sha:main.object.sha});}catch{await github('git/ref/heads/'+branch);}
 await github('contents/MIGRATION-STATUS.md','PUT',{message:'Record the 72-hour migration milestone',branch,sha:file.sha,content:Buffer.from(content).toString('base64')});
 const pr=await github('pulls','POST',{title:'Record the 72-hour migration milestone',head:branch,base:'main',body:'What: append the scheduled 72-hour status milestone. Why: retain actual cloud checks without daily reports. Tested: hosted migration watch; no application files changed.\n\n'+body});
 return 'Milestone pull request: '+pr.html_url;
}
async function stop(name){await github(`actions/workflows/${name}/disable`,'PUT');}
if(window.phase==='inactive'){console.log('No active cutover window.');process.exit(0);}
if(mode==='retirement'){if(window.retirementDue){await notify('[Taksh migration] 14-day Sites retirement decision','The 14-day rollback window has elapsed. Keep Sites intact until the owner approves retirement. Take a final Sites export first; do not retire automatically. New-platform backup/restore operations are in docs/OPERATIONS.md.');await stop('retirement.yml');}process.exit(0);}
const failures=[],account='60742c7f90408058b71f1065a6815ddd';
for(const path of ['/','/sets/gully-cricket','/robots.txt']){try{const r=await fetch('https://taksh.store'+path,{redirect:'error',signal:AbortSignal.timeout(15000)});if(r.status!==200)failures.push(path+' HTTP '+r.status);await r.body?.cancel();}catch{failures.push(path+' network/TLS failure');}}
let metrics,reporting;
try{const query=`{viewer{accounts(filter:{accountTag:"${account}"}){workersInvocationsAdaptive(limit:10,filter:{datetime_geq:"${cutover}",datetime_lt:"${now.toISOString()}",scriptName:"taksh-store"}){sum{requests errors cpuTimeUs}}}}}`;const result=await cloudflareRequest('graphql',{method:'POST',body:{query}});if(result.errors?.length)throw new Error('Analytics unavailable');metrics=result.data.viewer.accounts[0].workersInvocationsAdaptive[0]?.sum||{requests:0,errors:0,cpuTimeUs:0};const result2=await cloudflareRequest(`accounts/${account}/d1/database/d110db81-9cb7-4b8d-90e5-3787ffd01517/query`,{method:'POST',body:{sql:"SELECT payload FROM reporting_state WHERE key='customer-sheet'"}});reporting=JSON.parse(result2.result[0].results[0]?.payload||'{}');if(!reporting.lastSuccess||now-Date.parse(reporting.lastSuccess)>20*60000)failures.push('Customer Sheet has no recent successful acknowledgement');}catch{failures.push('Cloudflare analytics/Sheet-health check unavailable');}
if(failures.length){let rollback='Not attempted: integration/monitoring warning only.';if(failures.some(x=>/HTTP|network\/TLS/.test(x))&&process.env.TAKSH_PRODUCTION_READY==='true'){try{execFileSync(process.execPath,['scripts/rollback.mjs','production','--apply'],{stdio:['ignore','pipe','pipe']});rollback='Previous production version restored and health checked.';}catch{rollback='Automatic rollback attempted but failed; owner attention required.';}}
 await notify('[Taksh migration] Attention required',`Detected ${now.toISOString()}\n\n${failures.map(x=>'- '+x).join('\n')}\n\n${rollback}\n\nWorkflow: https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`);}
if(window.phase==='summary'){
 const body=`Cutover: ${cutover}\nChecked: ${now.toISOString()}\n\n${failures.length?'Needs attention: '+failures.join('; '):'Website/TLS paths healthy; Customer Sheet acknowledgement recent.'} Cloudflare counts since cutover (delayed/sampled): ${JSON.stringify(metrics||{})}. Keep Sites until the separate 14-day retirement decision.\n\nWorkflow: https://github.com/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;
 let status;try{status=await recordMilestone(body);}catch{status='Status pull request could not be created. This workflow summary contains the milestone; GitHub Actions may need permission to create pull requests.';}
 await notify('[Taksh migration] 72-hour summary',body+'\n\n'+status);
 await stop('migration-watch.yml');
}
if(failures.length)throw new Error('Migration check needs attention; private issue posted.');
console.log(window.phase==='summary'?'72-hour summary posted; watch disabled.':'Healthy; no notification.');
