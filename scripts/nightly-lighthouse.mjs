#!/usr/bin/env node
// Nightly Lighthouse (mobile) on four key pages against the performance budget in docs/STANDARDS.md.
// Appends today's numbers to a history file and writes a trend table to the GitHub job summary.
// Informational: it never fails the job. Usage: node scripts/nightly-lighthouse.mjs <history.json>
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,appendFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const ORIGIN='https://taksh.store';
const PAGES=['/','/sets','/sets/map-of-india','/sets/yellow-taxi'];
export const BUDGET={lcpS:2.5,cls:0.1,perf:90};
const HISTORY=process.argv[2]||'lighthouse-history.json';
const BLOCK=['*googletagmanager*','*google-analytics*','*facebook*','*clarity.ms*','*cloudflareinsights*'];

export function verdict(r){const miss=[];if(r.lcpS>BUDGET.lcpS)miss.push(`LCP ${r.lcpS}s`);if(r.cls>BUDGET.cls)miss.push(`CLS ${r.cls}`);if(r.perf<BUDGET.perf)miss.push(`score ${r.perf}`);return miss.length?`over budget: ${miss.join(', ')}`:'ok';}

async function measure(page){
 const dir=await mkdtemp(join(tmpdir(),'lh-'));const out=join(dir,'r.json');
 execFileSync('npx',['--yes','lighthouse@13.6.0',ORIGIN+page,'--quiet','--only-categories=performance','--chrome-flags=--headless=new --no-sandbox','--output=json',`--output-path=${out}`,...BLOCK.map(b=>`--blocked-url-patterns=${b}`)],{stdio:'ignore',timeout:180000});
 const j=JSON.parse(await readFile(out,'utf8'));const a=j.audits;
 return {page,perf:Math.round(j.categories.performance.score*100),lcpS:+(a['largest-contentful-paint'].numericValue/1000).toFixed(2),cls:+a['cumulative-layout-shift'].numericValue.toFixed(3),kb:Math.round(a['total-byte-weight'].numericValue/1024)};
}

if(process.argv[1]?.endsWith('nightly-lighthouse.mjs')){
 let history=[];try{history=JSON.parse(await readFile(HISTORY,'utf8'))}catch{}
 const date=new Date().toISOString().slice(0,10);const today={date,results:[]};
 for(const p of PAGES){try{today.results.push(await measure(p))}catch(e){today.results.push({page:p,error:String(e.message).slice(0,120)})}}
 history=[...history.filter(h=>h.date!==date),today].slice(-30);
 await writeFile(HISTORY,JSON.stringify(history,null,1)+'\n');
 const lines=[`## Nightly Lighthouse (mobile) · ${date}`,'',`Budget: LCP ≤ ${BUDGET.lcpS} s, CLS ≤ ${BUDGET.cls}, score ≥ ${BUDGET.perf}.`,'','| Page | Score | LCP (s) | CLS | Weight (KB) | Verdict | LCP trend (last 7) |','|---|---|---|---|---|---|---|'];
 for(const r of today.results){const trend=history.slice(-7).map(h=>h.results.find(x=>x.page===r.page)?.lcpS??'–').join(' → ');
  lines.push(r.error?`| ${r.page} | – | – | – | – | error: ${r.error} | ${trend} |`:`| ${r.page} | ${r.perf} | ${r.lcpS} | ${r.cls} | ${r.kb} | ${verdict(r)} | ${trend} |`);}
 const md=lines.join('\n')+'\n';console.log(md);if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,md);
}
