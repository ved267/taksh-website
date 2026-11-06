// A baseline is numeric evidence from successful Validate on the exact main SHA.
// ZIP members are read in memory; never extract paths or execute artifact code.
import {unzipSync} from 'fflate';
import {createHash} from 'node:crypto';
const repository='ved267/taksh-website',maxArchive=256*1024,maxReport=512*1024;
const required=['Locked install','Build','Unit tests','Type check','Lint','Request flows and page weights','Compare with main baseline','Keep numeric performance evidence'];
const numeric=value=>Number.isSafeInteger(value)&&value>=0&&value<=50*1024*1024;
export function readPerformanceArchive(bytes){
 if(bytes.length>maxArchive)throw new Error('Performance archive exceeds its size bound.');
 let selected=0,files;
 try{files=unzipSync(bytes,{filter(file){if(file.name!=='performance-current.json')return false;if(++selected>1||file.originalSize>maxReport)throw new Error('Performance report size bound.');return true;}});}catch{throw new Error('Invalid or oversized performance report archive.');}
 if(selected!==1||!files['performance-current.json'])throw new Error('Expected one numeric performance report.');
 let report;try{report=JSON.parse(new TextDecoder().decode(files['performance-current.json']));}catch{throw new Error('Invalid numeric performance report.');}
 if(report.schema!==1||!Number.isFinite(Date.parse(report.measuredAt))||Object.keys(report).some(k=>!['schema','measuredAt','totals','pages'].includes(k)))throw new Error('Unexpected numeric report schema.');
 if(!report.totals||Object.keys(report.totals).length!==3||!['jsGzip','cssGzip','workerGzip'].every(k=>numeric(report.totals[k]))||report.totals.workerGzip>=3*1024*1024)throw new Error('Invalid numeric report totals.');
 if(!report.pages||!report.pages['/'])throw new Error('Numeric report has no home page.');
 for(const[route,metrics]of Object.entries(report.pages))if(!/^\/[a-z0-9/_-]*$/i.test(route)||route.length>128||Object.keys(metrics).some(k=>!['htmlGzip','jsGzip','cssGzip','pageBytes'].includes(k))||!['htmlGzip','jsGzip','cssGzip','pageBytes'].every(k=>numeric(metrics[k])))throw new Error('Invalid numeric page report.');
 return report;
}
export async function fetchMainBaseline(sha,{token=process.env.GITHUB_TOKEN,fetcher=fetch}={}){
 if(!/^[a-f0-9]{40}$/.test(sha))throw new Error('Baseline commit is not a full SHA.');
 if(!token)return null;
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json'};
 async function api(path){const r=await fetcher(`https://api.github.com/repos/${repository}/${path}`,{headers,redirect:'error'});if(!r.ok)throw new Error('Trusted main evidence could not be read from GitHub.');return r.json();}
 const runs=await api(`actions/workflows/validate.yml/runs?branch=main&head_sha=${sha}&status=success&per_page=30`);
 const run=runs.workflow_runs.find(r=>r.head_sha===sha&&r.head_branch==='main'&&['push','workflow_dispatch'].includes(r.event)&&r.status==='completed'&&r.conclusion==='success'&&r.path==='.github/workflows/validate.yml'&&r.repository?.full_name===repository&&r.head_repository?.full_name===repository);
 if(!run)return null;
 const evidence=await Promise.allSettled([api(`actions/runs/${run.id}/jobs?per_page=100`),api(`actions/runs/${run.id}/artifacts?per_page=100`)]);
 if(evidence.some(r=>r.status!=='fulfilled'))throw new Error('Trusted main job/artifact evidence is unavailable.');
 const[jobs,artifacts]=evidence.map(r=>r.value);
 if(!jobs.jobs.some(j=>j.conclusion==='success'&&required.every(name=>j.steps?.some(s=>s.name===name&&s.conclusion==='success'))))throw new Error('Actual main validation steps did not pass.');
 const matches=artifacts.artifacts.filter(a=>a.name==='performance'&&!a.expired);if(matches.length!==1)return null;
 const artifact=matches[0];if(!Number.isSafeInteger(artifact.size_in_bytes)||artifact.size_in_bytes>maxArchive)throw new Error('Main performance artifact exceeds its bound.');
 const redirect=await fetcher(`https://api.github.com/repos/${repository}/actions/artifacts/${artifact.id}/zip`,{headers,redirect:'manual'});
 const location=redirect.headers.get('location');if(redirect.status!==302||!location||new URL(location).protocol!=='https:')throw new Error('Main artifact download is unavailable.');
 // Signed storage URLs never receive GitHub authentication.
 const response=await fetcher(location,{redirect:'error',signal:AbortSignal.timeout(30000)});
 if(!response.ok||!response.body||Number(response.headers.get('content-length'))>maxArchive)throw new Error('Main artifact download failed its bound.');
 const parts=[];let size=0;for await(const part of response.body){size+=part.length;if(size>maxArchive)throw new Error('Main artifact download exceeds its bound.');parts.push(part);}
 const bytes=Buffer.concat(parts);if(artifact.digest&&artifact.digest!=='sha256:'+createHash('sha256').update(bytes).digest('hex'))throw new Error('Main artifact integrity check failed.');
 return{report:readPerformanceArchive(bytes),runId:run.id};
}
