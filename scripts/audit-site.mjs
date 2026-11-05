// Read-only public crawl. Never follows /api/, sends forms, loads customer data or fires analytics.
import {mkdir,writeFile}from'node:fs/promises';
const live='https://taksh.store',target=process.argv[2];
if(!/^https:\/\/[a-z0-9-]+\.taksh-ved267\.workers\.dev$/.test(target||''))throw new Error('Use an isolated Taksh Cloudflare preview/staging URL.');
const report={asOf:new Date().toISOString(),live,target,pages:[],assets:[],errors:[]},queue=['/','/sitemap.xml','/robots.txt','/this-page-must-not-exist-migration-qa'],visited=new Set(),assets=new Set();
function decode(s){return s.replaceAll('&amp;','&').replaceAll('&#x27;',"'").replaceAll('&quot;','"');}
async function get(origin,path){const r=await fetch(origin+path,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'TakshMigrationReadOnlyQA'}});return{status:r.status,url:new URL(r.url).pathname,type:r.headers.get('content-type')||'',text:await r.text()};}
function metadata(html){return[...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>|<meta\s+[^>]*>|<link\s+[^>]*rel="(?:canonical|icon|apple-touch-icon)"[^>]*>/gi)].map(m=>m[0]).filter(s=>!s.includes('next-size-adjust')).sort();}
for(let n=0;queue.length&&n<150;n++){
 const path=queue.shift();if(visited.has(path))continue;visited.add(path);
 try{
  const [a,b]=await Promise.all([get(live,path),get(target,path)]);
  if(a.status!==b.status||a.url!==b.url)report.errors.push(`${path}: live ${a.status} ${a.url}; target ${b.status} ${b.url}`);
  if(a.type.includes('text/html')&&JSON.stringify(metadata(a.text))!==JSON.stringify(metadata(b.text)))report.errors.push(`${path}: page metadata differs`);
  report.pages.push({path,liveStatus:a.status,targetStatus:b.status,finalPath:b.url});
  if(path==='/sitemap.xml'){
   const paths=[...a.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(decode(m[1])).pathname);queue.push(...paths);
   if(a.text.replaceAll(live,'ORIGIN')!==b.text.replaceAll(target,'ORIGIN').replaceAll(live,'ORIGIN'))report.errors.push('sitemap.xml differs');
  }
  if(path==='/robots.txt'&&a.text.replaceAll(live,'ORIGIN')!==b.text.replaceAll(target,'ORIGIN').replaceAll(live,'ORIGIN'))report.errors.push('robots.txt differs');
  for(const m of a.text.matchAll(/(?:href|src)="([^"]+)"/g)){
   let url;try{url=new URL(decode(m[1]),live+path)}catch{continue;}
   if(url.origin!==live||url.pathname.startsWith('/api/'))continue;
   if(/\.(avif|webp|png|jpe?g|gif|svg|ico|woff2?|pdf)$/i.test(url.pathname))assets.add(url.pathname+url.search);
   else if(!/\.(js|css)$/i.test(url.pathname)&&!visited.has(url.pathname))queue.push(url.pathname);
  }
  for(const m of a.text.matchAll(/srcset="([^"]+)"/g))for(const src of decode(m[1]).split(',')){try{const u=new URL(src.trim().split(/\s+/)[0],live+path);if(u.origin===live)assets.add(u.pathname+u.search);}catch{}}
 }catch(e){report.errors.push(`${path}: ${e.message}`);}
}
// Every referenced image/font/icon is checked on both hosts; no browser script or GA request is executed.
const entries=[...assets];for(let i=0;i<entries.length;i+=4)await Promise.all(entries.slice(i,i+4).map(async path=>{
 try{const [a,b]=await Promise.all([fetch(live+path,{method:'HEAD',signal:AbortSignal.timeout(30000)}),fetch(target+path,{method:'HEAD',signal:AbortSignal.timeout(30000)})]);report.assets.push({path,liveStatus:a.status,targetStatus:b.status});if(a.status!==200||b.status!==200)report.errors.push(`${path}: asset HTTP ${a.status}/${b.status}`);}catch(e){report.errors.push(`${path}: ${e.message}`);}
}));
await mkdir('.local',{recursive:true});await writeFile('.local/public-site-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({pages:report.pages.length,assets:report.assets.length,errors:report.errors},null,2));if(report.errors.length)process.exitCode=1;
