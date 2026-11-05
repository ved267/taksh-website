// Executes only from trusted main. The branch bundle is data, never imported/executed here.
import{readFile,writeFile,mkdir,appendFile}from'node:fs/promises';import{resolve}from'node:path';import{execFileSync}from'node:child_process';import{previewBranchAllowed}from'../lib/cloudflare/deployment-policy.mjs';
const repository='ved267/taksh-website';if(process.env.GITHUB_REPOSITORY!==repository||process.env.GITHUB_EVENT_NAME!=='workflow_run')throw new Error('Preview deploy needs a completed build workflow.');
const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8')),id=event.workflow_run?.id;if(!Number.isSafeInteger(id))throw new Error('Invalid preview build run.');
async function get(path){const r=await fetch(`https://api.github.com/repos/${repository}/${path}`,{redirect:'error',headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json'}});if(!r.ok)throw new Error('Preview build evidence unavailable.');return r.json();}
const run=await get(`actions/runs/${id}`),branch=run.head_branch;
if(run.repository.full_name!==repository||run.head_repository.full_name!==repository||run.path!=='.github/workflows/preview.yml'||!['push','pull_request','workflow_dispatch'].includes(run.event)||run.conclusion!=='success'||!previewBranchAllowed(branch)||!/^[a-f0-9]{40}$/.test(run.head_sha))throw new Error('Preview build identity was not verified.');
const jobs=await get(`actions/runs/${id}/jobs?per_page=100`),build=jobs.jobs.find(job=>job.name==='Build preview without credentials');
if(build?.conclusion!=='success'||!['Locked install','Build','Package compiled preview','Upload compiled preview'].every(name=>build.steps.some(step=>step.name===name&&step.conclusion==='success')))throw new Error('Actual preview build steps must pass.');
const head=await get('git/ref/heads/'+encodeURIComponent(branch));if(head.object.sha!==run.head_sha)throw new Error('A newer branch commit superseded this preview.');
const artifacts=await get(`actions/runs/${id}/artifacts?per_page=100`),matches=artifacts.artifacts.filter(a=>a.name==='preview-bundle'&&!a.expired);if(matches.length!==1||matches[0].size_in_bytes>250*1024*1024)throw new Error('Expected one bounded compiled preview artifact.');
const directory=resolve('.local','preview-build-'+id+'-'+run.run_attempt);await mkdir(directory,{recursive:true});
const download=await fetch(`https://api.github.com/repos/${repository}/actions/artifacts/${matches[0].id}/zip`,{redirect:'manual',headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN}});
const location=download.headers.get('location');if(download.status!==302||!location||new URL(location).protocol!=='https:')throw new Error('Artifact download URL unavailable.');
// Never forward GitHub authorization to the signed storage URL.
const response=await fetch(location,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!response.ok||!response.body)throw new Error('Artifact download failed.');
const parts=[];let size=0;for await(const bytes of response.body){size+=bytes.length;if(size>250*1024*1024)throw new Error('Artifact download exceeded its bound.');parts.push(bytes);}
const outer=resolve(directory,'artifact.zip');await writeFile(outer,Buffer.concat(parts));
const wrapper=resolve(directory,'wrapper'),bundle=resolve(directory,'bundle');execFileSync('python3',['scripts/extract-preview.py',outer,wrapper],{stdio:'inherit'});execFileSync('python3',['scripts/extract-preview.py',resolve(wrapper,'preview-bundle.zip'),bundle],{stdio:'inherit'});
const metadata=JSON.parse(await readFile(resolve(bundle,'metadata.json'),'utf8'));if(metadata.sha!==run.head_sha||metadata.branch!==branch)throw new Error('Compiled preview metadata mismatch.');
await readFile(resolve(bundle,'dist/server/index.js'));await readFile(resolve(bundle,'dist/client/robots.txt'));
await appendFile(process.env.GITHUB_ENV,`TAKSH_PREVIEW_BRANCH=${branch}\nTAKSH_PREVIEW_BUNDLE_ROOT=${bundle}\n`);
console.log('Verified current branch build and safely extracted compiled preview.');
