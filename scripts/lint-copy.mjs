#!/usr/bin/env node
// Copy lint for Taksh wording rules and product numbers.
// Reads visible text from source (JSX text and prose string literals) and lib/catalogue.json.
// Today's known issues live in scripts/copy-baseline.json; only NEW issues fail.
// Usage: node scripts/lint-copy.mjs [--update-baseline]
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(fileURLToPath(new URL('..',import.meta.url)));
const BASELINE=join(ROOT,'scripts/copy-baseline.json');

export const BANNED=[
 ['brick brand','\\blego\\b'],['toy','\\btoys?\\b'],['official','\\bofficial(?:ly)?\\b'],['approved','\\bapproved\\b'],
 ['certified','\\bcertified\\b'],['exact replica','exact (?:scale )?replica'],['scale model','\\bscale model\\b'],
 ['iconic','\\biconic\\b'],['legendary','\\blegendary\\b'],['stunning','\\bstunning\\b'],['ultimate','\\bultimate\\b'],['nostalgia','\\bnostalgi']
].map(([name,re])=>({name,re:new RegExp(re,'i')}));
const ALLOWED_EXCLAIM=/Taxi!|Uncle, ball de do!|Nonsense!/; // "Nonsense!" is the set's plaque (product decision, 6 Nov 2026)
const UNIT=/(?<![\d,.])(\d{1,2},\d{3}|\d+(?:\.\d+)?)(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(pieces|pcs|cm|mm|hours?|hrs?|minutes?|mins?)\b/gi;
const QUALIFIER=/\b(about|over|under|above|up to|around)\b[^.]*$/i;
const THRESHOLD=/\b(over|under|above|below|up to)\b[^.]*$/i; // price bands and level labels, not product numbers

/** Lint one piece of visible text. Returns [{rule,text}]. */
export function lintText(text,{file='',catalogue={products:[]}}={}){
 const out=[];const t=text.replace(/\s+/g,' ').trim();if(!t)return out;
 for(const b of BANNED)if(b.re.test(t))out.push({rule:`banned word: ${b.name}`,text:t});
 if(/\bplay(?:s|ing|ed)?\b|\bkhelo\b/i.test(t)&&!/gully|cricket/i.test(file+' '+t))out.push({rule:'"play" outside Gully Cricket',text:t});
 for(const m of t.matchAll(UNIT)){const before=t.slice(Math.max(0,m.index-45),m.index);if(!QUALIFIER.test(before))out.push({rule:'number without "about"',text:t});}
 if(/!/.test(t.replace(ALLOWED_EXCLAIM,''))&&/[a-z]!/i.test(t.replace(ALLOWED_EXCLAIM,'')))out.push({rule:'exclamation mark',text:t});
 if(/\b1 (?:sets|pieces|items)\b/.test(t))out.push({rule:'singular/plural',text:t});
 const prices=new Set(catalogue.products.map(p=>p.price));const pieces=new Set(catalogue.products.map(p=>p.pieces));
 for(const m of t.matchAll(/(?:₹|\bRs\.?)\s?(\d[\d,]{2,})/g)){const v=+m[1].replace(/,/g,'');if(!prices.has(v)&&!THRESHOLD.test(t.slice(Math.max(0,m.index-20),m.index)))out.push({rule:'price not in catalogue',text:t});}
 for(const m of t.matchAll(/(\d{1,2},\d{3}|\d{3,4})\s*pieces/gi)){const v=+m[1].replace(/,/g,'');if(!pieces.has(v)&&!THRESHOLD.test(t.slice(Math.max(0,m.index-20),m.index)))out.push({rule:'piece count not in catalogue',text:t});}
 return [...new Map(out.map(o=>[o.rule+'|'+o.text,o])).values()];
}

/** Pull visible copy out of a TSX/TS source: JSX text nodes and prose string literals. */
export function extractCopy(src){
 const pieces=[];
 for(const m of src.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g))pieces.push(m[1]);
 for(const m of src.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.){6,400})\1/g)){const s=m[2];
  if(/^[A-Z0-9₹].*\s\S/.test(s)&&!/[{};=<>]|=>|\bimport\b|^[A-Z_]+$|\.(?:tsx?|mjs|css|webp|png|jpe?g|svg)\b|^https?:/.test(s)&&!/^(?:[a-z-]+ )*[a-z-]+$/.test(s))pieces.push(s);}
 return pieces.map(s=>s.replace(/\\n/g,' ').trim()).filter(s=>/[A-Za-z]{2}/.test(s)&&!/!==|===|&&|\|\||=>|\bas keyof\b|;\s*return\b/.test(s));
}

async function walk(dir,acc=[]){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory()){if(!/node_modules|^\.|^api$|^admin$/.test(e.name))await walk(p,acc);}else if(/\.(tsx|ts)$/.test(e.name)&&!/\.d\.ts$/.test(e.name))acc.push(p);}return acc;}

export async function run({update=false}={}){
 const catalogue=JSON.parse(await readFile(join(ROOT,'lib/catalogue.json'),'utf8'));
 const found=new Map();
 const add=(file,list)=>{for(const v of list){const key=`${v.rule} | ${file} | ${v.text.slice(0,160)}`;found.set(key,v);}};
 for(const f of [...await walk(join(ROOT,'app')),...await walk(join(ROOT,'components/taksh'))]){const rel=relative(ROOT,f);const src=await readFile(f,'utf8');for(const text of extractCopy(src))add(rel,lintText(text,{file:rel,catalogue}));}
 const strings=[];const visit=v=>{if(typeof v==='string')strings.push(v);else if(v&&typeof v==='object')Object.values(v).forEach(visit);};visit(catalogue);
 for(const s of strings)if(/\s/.test(s))add('lib/catalogue.json',lintText(s,{file:'lib/catalogue.json',catalogue}));
 const keys=[...found.keys()].sort();
 if(update){await writeFile(BASELINE,JSON.stringify({note:'Known copy issues on main when the check was added (2026-11-09 audit). Fix them and remove the line; never add new ones.',issues:keys},null,1)+'\n');console.log(`Copy baseline written: ${keys.length} known issues.`);return 0;}
 let base=[];try{base=JSON.parse(await readFile(BASELINE,'utf8')).issues}catch{}
 const fresh=keys.filter(k=>!base.includes(k));const gone=base.filter(k=>!keys.includes(k));
 console.log(`Copy lint: ${keys.length} issues (${base.length} known, ${fresh.length} new, ${gone.length} fixed).`);
 for(const k of gone)console.log(`  fixed (remove from baseline): ${k}`);
 for(const k of fresh)console.log(`  NEW: ${k}`);
 return fresh.length?1:0;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=await run({update:process.argv.includes('--update-baseline')});
