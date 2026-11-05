import {readFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
export async function measurePerformance(root,origin){
 const routes=['/','/sets','/sets/gully-cricket','/sets/map-of-india','/sets/ram-mandir','/sets/yellow-taxi','/sets/chandrayaan-3','/sets/nonsense','/our-story','/quality','/levels','/community','/building-instructions','/help','/help/contact','/help/missing-piece','/returns','/privacy','/bag','/checkout','/admin'];
 const pages={};
 for(const route of routes){
  const response=await fetch(origin+route);if(response.status!==200)throw new Error(`${route}: HTTP ${response.status}`);
  const html=await response.text();
  const assets=new Set();
  for(const tag of html.matchAll(/<(?:script|link|img)\b[^>]*>/g)){
   const text=tag[0];
   if(text.startsWith('<link')&&!/rel="(?:stylesheet|modulepreload|preload)"/.test(text))continue;
   if(text.startsWith('<img')&&/loading="lazy"/.test(text))continue;
   const src=text.match(/(?:src|href)="([^"]+)"/)?.[1];
   if(src?.startsWith('/')&&!src.startsWith('//'))assets.add(src.replaceAll('&amp;','&'));
  }
  let weight=gzipSync(html).length,js=0,css=0;
  for(const asset of assets){const r=await fetch(origin+asset);if(!r.ok)throw new Error(`Missing page asset ${asset}`);const bytes=new Uint8Array(await r.arrayBuffer());const size=/\.(js|css)(?:\?|$)/.test(asset)?gzipSync(bytes).length:bytes.length;weight+=size;if(/\.js(?:\?|$)/.test(asset))js+=size;if(/\.css(?:\?|$)/.test(asset))css+=size;}
  pages[route]={htmlGzip:gzipSync(html).length,jsGzip:js,cssGzip:css,pageBytes:weight};
 }
 const totals={jsGzip:0,cssGzip:0};
 async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(/\.(js|css)$/.test(file))totals[file.endsWith('.js')?'jsGzip':'cssGzip']+=gzipSync(await readFile(file)).length;}}
 await walk(resolve(root,'dist/client'));
 const dryrun=execFileSync(process.execPath,[resolve(root,'node_modules/wrangler/bin/wrangler.js'),'deploy','--dry-run','--config',resolve(root,'dist/server/wrangler.json'),'--outdir',resolve(root,'.local/worker-size')],{cwd:root,encoding:'utf8'});
 const match=dryrun.match(/gzip:\s*([\d.]+)\s*(KiB|MiB|B)/);if(!match)throw new Error('Compressed Worker size unavailable.');
 const workerGzip=Math.ceil(Number(match[1])*({KiB:1024,MiB:1024*1024,B:1}[match[2]]));
 if(workerGzip>=3*1024*1024)throw new Error(`Worker ${workerGzip} exceeds owner 3MiB budget.`);
 return {schema:1,measuredAt:new Date().toISOString(),totals:{...totals,workerGzip},pages};
}
