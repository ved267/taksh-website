#!/usr/bin/env node
// Internal links and sitemap completeness, from source only (no network).
// Routes come from app/ pages (redirect-only pages excluded), set slugs from lib/catalogue.json
// and the info pages defined in app/[info]/page.tsx. Every internal href in source must resolve;
// every public route must be in public/sitemap.xml. KNOWN_GAPS lists today's accepted gaps.
import {readFile,readdir} from 'node:fs/promises';
import {join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(fileURLToPath(new URL('..',import.meta.url)));
const PRIVATE=new Set(['/bag','/checkout','/admin']);
// Accepted on 2026-11-09 (audit job 2026-11-09-03). Remove a line once fixed.
export const KNOWN_GAPS=new Set([]);

async function walk(dir,acc=[]){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory()){if(!/node_modules|^\./.test(e.name))await walk(p,acc);}else acc.push(p);}return acc;}

export async function routes(){
 const catalogue=JSON.parse(await readFile(join(ROOT,'lib/catalogue.json'),'utf8'));
 const out={public:new Set(),redirects:new Set(),all:new Set()};
 for(const f of await walk(join(ROOT,'app'))){
  if(!/[\\/]page\.tsx$/.test(f))continue;
  const route='/'+relative(join(ROOT,'app'),f).split(sep).slice(0,-1).join('/');const r=route==='/'?'/':route.replace(/\/$/,'');
  if(r.startsWith('/api'))continue;
  const src=await readFile(f,'utf8');
  if(r.includes('[slug]')){for(const p of catalogue.products)out.all.add(r.replace('[slug]',p.slug)).add(r.replace('[slug]',p.slug));continue;}
  if(r.includes('[info]')){for(const m of src.matchAll(/([a-z-]+):\{title:/g))out.all.add(r.replace('[info]',m[1]));continue;}
  out.all.add(r);if(/permanentRedirect\(|redirect\(/.test(src)&&src.length<400)out.redirects.add(r);
 }
 for(const r of out.all)if(!out.redirects.has(r)&&!PRIVATE.has(r))out.public.add(r);
 return out;
}

export async function run(){
 const rt=await routes();const problems=[];
 const sitemap=new Set([...(await readFile(join(ROOT,'public/sitemap.xml'),'utf8')).matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map(m=>m[1]||'/'));
 for(const r of rt.public)if(!sitemap.has(r))problems.push(`sitemap missing: ${r}`);
 for(const s of sitemap)if(!rt.public.has(s))problems.push(`sitemap lists a non-public route: ${s}`);
 const files=(await walk(join(ROOT,'components'))).concat(await walk(join(ROOT,'app'))).filter(f=>/\.(tsx|ts)$/.test(f));
 for(const f of files){const src=await readFile(f,'utf8');
  for(const m of src.matchAll(/href=\{?['"`](\/[^'"`#?]*)/g)){const h=m[1].replace(/\/$/,'')||'/';
   if(/\.(?:png|jpe?g|webp|avif|svg|ico|pdf|html|xml|txt|woff2?|css|js|json)$/.test(h)||h.startsWith('/api/'))continue;
   if(!rt.all.has(h))problems.push(`dead link ${h} in ${relative(ROOT,f)}`);
   else if(rt.redirects.has(h))problems.push(`link to a redirect ${h} in ${relative(ROOT,f)}`);}}
 const fresh=problems.filter(p=>!KNOWN_GAPS.has(p));const known=problems.filter(p=>KNOWN_GAPS.has(p));
 console.log(`Link check: ${rt.public.size} public routes, ${sitemap.size} in sitemap, ${known.length} known gap(s), ${fresh.length} new problem(s).`);
 for(const p of known)console.log(`  known: ${p}`);
 for(const p of [...KNOWN_GAPS].filter(k=>!problems.includes(k)))console.log(`  fixed (remove from KNOWN_GAPS): ${p}`);
 for(const p of fresh)console.log(`  NEW: ${p}`);
 return fresh.length?1:0;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=await run();
