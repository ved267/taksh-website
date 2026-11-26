#!/usr/bin/env node
// Design-token check: colours and font families written straight into CSS or TSX instead of the
// tokens in the :root block of app/globals.css. Today's loose values are frozen in
// scripts/token-baseline.json (count per file and value); a NEW value or a higher count fails.
// Usage: node scripts/check-tokens.mjs [--update-baseline]
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(fileURLToPath(new URL('..',import.meta.url)));
const BASELINE=join(ROOT,'scripts/token-baseline.json');
const TOKEN_FILE='app/globals.css';

/** Return loose values in one file's text: [{kind,value}] */
export function looseValues(text,{isTokenFile=false}={}){
 let body=text;
 if(isTokenFile)body=body.replace(/:root\s*\{[^}]*\}/g,''); // token definitions are allowed
 body=body.replace(/\/\*[\s\S]*?\*\//g,'');
 const out=[];
 for(const m of body.matchAll(/#[0-9a-fA-F]{3,8}\b(?![\w-])/g))out.push({kind:'colour',value:m[0].toLowerCase()});
 for(const m of body.matchAll(/\b(?:rgba?|hsla?)\([^)]*\)/g))out.push({kind:'colour',value:m[0].replace(/\s+/g,'')});
 for(const m of body.matchAll(/font-family\s*:\s*([^;}"]+)/g))if(!/^var\(--/.test(m[1].trim()))out.push({kind:'font',value:m[1].trim()}); // var(--token) is a token
 for(const m of body.matchAll(/fontFamily\s*:\s*['"]([^'"]+)['"]/g))out.push({kind:'font',value:m[1].trim()});
 return out;
}

async function walk(dir,acc=[]){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory()){if(!/node_modules|^\./.test(e.name))await walk(p,acc);}else if(/\.(css|tsx)$/.test(e.name))acc.push(p);}return acc;}

export async function run({update=false}={}){
 const counts={};
 for(const f of [...await walk(join(ROOT,'app')),...await walk(join(ROOT,'components'))]){
  const rel=relative(ROOT,f);if(rel.startsWith('components/ui/'))continue; // vendored primitives
  for(const v of looseValues(await readFile(f,'utf8'),{isTokenFile:rel===TOKEN_FILE})){const k=`${rel} | ${v.kind} | ${v.value}`;counts[k]=(counts[k]||0)+1;}
 }
 const total=Object.values(counts).reduce((a,b)=>a+b,0);
 if(update){await writeFile(BASELINE,JSON.stringify({note:'Loose colours and fonts on main when the check was added (2026-11-09 audit). Replace with tokens from app/globals.css and lower the counts; never raise them.',counts:Object.fromEntries(Object.entries(counts).sort())},null,1)+'\n');console.log(`Token baseline written: ${total} loose values.`);return 0;}
 let base={};try{base=JSON.parse(await readFile(BASELINE,'utf8')).counts}catch{}
 const worse=Object.entries(counts).filter(([k,n])=>n>(base[k]||0));
 const better=Object.entries(base).filter(([k,n])=>(counts[k]||0)<n);
 console.log(`Token check: ${total} loose values (${Object.values(base).reduce((a,b)=>a+b,0)} in baseline).`);
 for(const [k] of better)console.log(`  fewer than baseline (lower it): ${k} ${counts[k]||0}/${base[k]}`);
 for(const [k,n] of worse)console.log(`  NEW: ${k} (${n}, baseline ${base[k]||0}) — use a token from ${TOKEN_FILE}`);
 return worse.length?1:0;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=await run({update:process.argv.includes('--update-baseline')});
