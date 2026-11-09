#!/usr/bin/env node
// Auto-merge for claude/* pull requests once Validate passes (owner decision, 9 Nov 2026:
// "I don't want you to wait to merge it every time. It should always just auto-merge.").
// Runs from .github/workflows/auto-merge.yml on workflow_run (Validate, completed, pull_request).
// It never checks out or runs PR code. Reads use GITHUB_TOKEN; update-branch and merge use
// AUTOMERGE_TOKEN (a fine-grained PAT) so the resulting push starts main Validate and production.

export const HOLD_LABEL='hold';
export const VALIDATE_JOB='Locked build, tests and performance';

/**
 * Pure decision for one Validate run and its pull request.
 * @returns {{action:'skip'|'wait'|'stop'|'update'|'merge', reason:string, comment?:string}}
 */
export function decide({run,pr,jobs,mainSha,mainValidate,repo,hasToken}){
 if(!run||run.event!=='pull_request')return {action:'skip',reason:'not a pull_request Validate run'};
 if(run.conclusion!=='success')return {action:'skip',reason:`Validate concluded ${run.conclusion}`};
 if(!String(run.head_branch||'').startsWith('claude/'))return {action:'skip',reason:`branch ${run.head_branch} is not claude/*`};
 if(!pr)return {action:'skip',reason:'no open pull request for this branch'};
 if(pr.state!=='open')return {action:'skip',reason:'pull request is not open'};
 if(pr.draft)return {action:'skip',reason:'pull request is a draft'};
 if(pr.base?.ref!=='main')return {action:'skip',reason:`base is ${pr.base?.ref}, not main`};
 if(pr.head?.repo?.full_name!==repo)return {action:'skip',reason:'head branch is not in this repository'};
 if((pr.labels||[]).some(l=>l.name===HOLD_LABEL))return {action:'skip',reason:`labelled ${HOLD_LABEL}`};
 if(pr.head?.sha!==run.head_sha)return {action:'skip',reason:'pull request has newer commits than this Validate run'};
 // Validate's job is skipped (and the run still "succeeds") when TAKSH_CI_READY is off: never merge on that.
 const job=(jobs||[]).find(j=>j.name===VALIDATE_JOB);
 if(!job||job.conclusion!=='success')return {action:'skip',reason:`Validate job "${VALIDATE_JOB}" did not run and pass (${job?.conclusion||'missing'})`};
 if(!mainValidate||mainValidate.status!=='completed')return {action:'wait',reason:`main ${String(mainSha).slice(0,7)} Validate not finished`};
 if(mainValidate.conclusion!=='success')return {action:'stop',reason:`main Validate ${mainValidate.conclusion}`,comment:`Auto-merge paused: Validate on main (${String(mainSha).slice(0,7)}) is **${mainValidate.conclusion}**. Fix main first; this PR merges on its next green Validate.`};
 if(!hasToken)return {action:'stop',reason:'AUTOMERGE_TOKEN missing',comment:'auto-merge needs AUTOMERGE_TOKEN (see docs/OPERATIONS.md, Auto-merge).'};
 if(pr.base?.sha!==mainSha)return {action:'update',reason:`base ${String(pr.base?.sha).slice(0,7)} is behind main ${String(mainSha).slice(0,7)}`};
 return {action:'merge',reason:'all checks passed'};
}

async function api(path,{token,method='GET',body}={}){
 const r=await fetch(`https://api.github.com${path}`,{method,headers:{authorization:`Bearer ${token}`,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','user-agent':'taksh-auto-merge'},body:body?JSON.stringify(body):undefined});
 const text=await r.text();const data=text?JSON.parse(text):null;
 if(!r.ok)throw new Error(`${method} ${path}: ${r.status} ${data?.message||''}`);
 return data;
}

async function main(){
 const {GITHUB_REPOSITORY:repo,GITHUB_TOKEN:read,AUTOMERGE_TOKEN:write,RUN_ID}=process.env;
 const run=await api(`/repos/${repo}/actions/runs/${RUN_ID}`,{token:read});
 const owner=repo.split('/')[0];
 const prs=await api(`/repos/${repo}/pulls?state=open&head=${owner}:${encodeURIComponent(run.head_branch)}`,{token:read});
 const pr=prs[0]?await api(`/repos/${repo}/pulls/${prs[0].number}`,{token:read}):null;
 const jobs=(await api(`/repos/${repo}/actions/runs/${RUN_ID}/jobs`,{token:read})).jobs;
 const comment=async text=>{if(pr)await api(`/repos/${repo}/issues/${pr.number}/comments`,{token:read,method:'POST',body:{body:text}});};
 const deadline=Date.now()+20*60*1000;
 for(;;){
  const mainSha=(await api(`/repos/${repo}/commits/main`,{token:read})).sha;
  const runs=(await api(`/repos/${repo}/actions/workflows/validate.yml/runs?branch=main&event=push&head_sha=${mainSha}&per_page=5`,{token:read})).workflow_runs;
  const fresh=pr?await api(`/repos/${repo}/pulls/${pr.number}`,{token:read}):null;
  const d=decide({run,pr:fresh,jobs,mainSha,mainValidate:runs[0],repo,hasToken:Boolean(write)});
  console.log(`PR #${pr?.number??'-'}: ${d.action} (${d.reason})`);
  if(d.action==='wait'){if(Date.now()>deadline){await comment('Auto-merge gave up after 20 minutes waiting for Validate on main. Re-run Validate on this PR to try again.');return;}await new Promise(r=>setTimeout(r,30000));continue;}
  if(d.comment)await comment(d.comment);
  if(d.action==='update')await api(`/repos/${repo}/pulls/${pr.number}/update-branch`,{token:write,method:'PUT',body:{expected_head_sha:fresh.head.sha}});
  if(d.action==='merge'){const m=await api(`/repos/${repo}/pulls/${pr.number}/merge`,{token:write,method:'PUT',body:{merge_method:'squash',sha:fresh.head.sha}});console.log(`Merged #${pr.number} as ${m.sha}`);}
  return;
 }
}

if(process.argv[1]?.endsWith('auto-merge.mjs'))await main();
