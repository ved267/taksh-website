// Responsive derivatives only: original photographs and map documents stay unchanged.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const output='public/media';
await fs.mkdir(output,{recursive:true});
const manifest={};
async function save(name,bytes,extension='webp'){
 const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
 const filename=`${name}.${hash}.${extension}`;
 const destination=path.join(output,filename);
 try{await fs.access(destination)}catch{await fs.writeFile(destination,bytes)}
 return '/media/'+filename;
}
async function prepare(folder){
 for(const entry of (await fs.readdir('public/'+folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
  if(entry.isDirectory()){await prepare(folder+'/'+entry.name);continue}
  const file=entry.name;
  if(!/\.(png|jpe?g|webp)$/i.test(file)||file.endsWith('-sm.webp'))continue;
  const bytes=await fs.readFile(`public/${folder}/${file}`);
  const {width,height}=await sharp(bytes).metadata();
  const name=(folder+'-'+file.replace(/\.[^.]+$/,'')).replaceAll('/','-');
  const variants={};
  for(const [key,target,quality] of [['thumb',160,80],['card',320,82],['small',600,84],['medium',900,86],['large',1200,88]]){
   const displayQuality=folder.startsWith('bharat')||key==='thumb'||key==='card'?quality:quality-4;
   variants[key]=await save(name+'-'+target,await sharp(bytes).resize({width:target,withoutEnlargement:true}).webp({quality:displayQuality}).toBuffer());
   if(['small','medium','large'].includes(key)&&(/life-|ad-|gallery-/.test(file)||folder.startsWith('bharat'))){const avif=await sharp(bytes).resize({width:target,withoutEnlargement:true}).avif({quality:65,effort:5}).toBuffer();const webp=await fs.stat('public'+variants[key]);if(avif.length<webp.size*.9)variants[key]=await save(name+'-'+target,avif,'avif')}
  }
  // Existing WebP masters are already compressed. Preserve those; large PNG/JPEG
  // sources get a display master without altering aspect ratio or source files.
  const fullWidth=file.endsWith('.webp')?width:Math.min(width,1800);
  const fullBytes=file.endsWith('.webp')?bytes:await sharp(bytes).resize({width:fullWidth,withoutEnlargement:true}).webp({quality:90}).toBuffer();
  const full=await save(name,fullBytes);
  manifest[`/${folder}/${file}`]={width,height,fullWidth,full,...variants};
 }
}
for(const folder of ['chandrayaan','ram-mandir','yellow-taxi','nonsense','bharat','padma','1983-trophy','surajmukhi'])await prepare(folder);
// Owner-approved responsive display copies; preserve exact originals for the viewer.
await prepare('gully-cricket');
for(const file of (await fs.readdir('public/gully-cricket')).filter(f=>f.endsWith('.png'))){
 const bytes=await fs.readFile('public/gully-cricket/'+file);
 manifest['/gully-cricket/'+file].original=await save('gully-cricket-original-'+file.slice(0,-4),bytes,'png');
}
for(const kind of ['primary','reversed']){
 const bytes=await sharp(`public/logo-${kind}.png`).resize({width:390}).webp({quality:92,alphaQuality:100}).toBuffer();
 const {width,height}=await sharp(bytes).metadata();
 const full=await save('logo-'+kind,bytes);
 manifest[`/logo-${kind}.png`]={width,height,fullWidth:width,full,thumb:full,card:full,small:full,medium:full,large:full};
}
const json=JSON.stringify(manifest,null,2)+'\n';
const destination='lib/image-assets.json';
if(await fs.readFile(destination,'utf8').catch(()=>null)!==json)await fs.writeFile(destination,json);
const currentFiles=new Set(Object.values(manifest).flatMap(entry=>['full','thumb','card','small','medium','large','original'].filter(size=>entry[size]).map(size=>path.basename(entry[size]))));
for(const file of await fs.readdir(output))if(/\.[a-f0-9]{12}\.(webp|avif|png)$/.test(file)&&!currentFiles.has(file))await fs.unlink(path.join(output,file));
console.log(`Prepared ${Object.keys(manifest).length} responsive image families with content-based cache keys.`);
