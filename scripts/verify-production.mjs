// Server-side GitHub evidence, rather than trusting a branch-supplied success flag.
import {readFile}from'node:fs/promises';import{productionDeploymentAllowed,validatedMainRun}from'../lib/cloudflare/deployment-policy.mjs';
const repository='ved267/taksh-website';
if(process.env.GITHUB_REPOSITORY!==repository||!['workflow_run','workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME))throw new Error('Production requires the completed Validate workflow.');
const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8'));
if(process.env.GITHUB_EVENT_NAME==='workflow_dispatch'&&process.env.GITHUB_REF!=='refs/heads/main')throw new Error('Manual production must use main.');
const currentMain=await get('git/ref/heads/main');
const id=process.env.GITHUB_EVENT_NAME==='workflow_run'?event.workflow_run?.id:validatedMainRun((await get('actions/workflows/validate.yml/runs?branch=main&event=push&status=success&per_page=100')).workflow_runs,currentMain.object.sha)?.id;
if(!Number.isSafeInteger(id))throw new Error('Current main has no successful Validate push evidence.');
async function get(path){const r=await fetch(`https://api.github.com/repos/${repository}/${path}`,{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},redirect:'error'});if(!r.ok)throw new Error('GitHub validation evidence unavailable.');return r.json();}
const [run,main,jobs]=await Promise.all([get(`actions/runs/${id}`),get('git/ref/heads/main'),get(`actions/runs/${id}/jobs?per_page=100`)]);
const checks=jobs.jobs.find(job=>job.name==='Locked build, tests and performance');
const required=['Locked install','Build','Unit tests','Type check','Lint','Request flows and page weights','Compare with main baseline'];
const checksComplete=checks?.conclusion==='success'&&required.every(name=>checks.steps.some(step=>step.name===name&&step.conclusion==='success'));

if(!productionDeploymentAllowed({checksComplete,repository:run.repository.full_name,event:run.event,branch:run.head_branch,conclusion:run.conclusion,workflowPath:run.path,validatedSha:run.head_sha,currentMainSha:main.object.sha}))throw new Error('Production blocked: main is not this successfully validated commit.');
if(process.env.GITHUB_SHA!==run.head_sha)throw new Error('Workflow and checkout revision must be the validated main revision.');
console.log('Current main commit has successful Validate evidence; production deployment allowed.');
