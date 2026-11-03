import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';

const root=process.cwd();
const cssDir=path.join(root,'dist/client/_next/static/css');
const cssFile=fs.readdirSync(cssDir).find(file=>/^index\..*\.css$/.test(file));
const css=fs.readFileSync(path.join(cssDir,cssFile));
const manifestPath=path.join(root,'lib/image-assets.json');
const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{};
const galleries={
 'yellow-taxi':['01-hero','02-front','03-inside','04-roof-luggage','05-dashboard','06-in-a-real-taxi','07-dimensions'],
 'chandrayaan':['01-hero','02-rover-closeup','07-inside-front','03-top-deck-closeup','05-leg-heat-probe','11-dimensions','12-room'],
 'ram-mandir':['01-hero-front','10-room','02-angle','03-spire-flag-closeup','11-spire-lifted','04-roofs-surya-tilak-window','05-porch-stairs-plaque','06-wing-porch','07-platform-lawn','09-dimensions'],
};
galleries.nonsense=fs.readdirSync('public/nonsense').filter(f=>/^gallery-.*(?<!-sm)\.webp$/.test(f)).map(f=>f.slice(8,-5));
const report={globalCssBytes:css.length,globalCssGzipBytes:zlib.gzipSync(css).length,thumbnailBytes:{}};
for(const [folder,names] of Object.entries(galleries)){
 report.thumbnailBytes[folder]=names.reduce((sum,name)=>{
  const entry=manifest[`/${folder}/gallery-${name}.webp`];
  const file=entry?.thumb||`/${folder}/gallery-${name}-sm.webp`;
  return sum+fs.statSync(path.join(root,'public',file)).size;
 },0);
}
const bharat=['gallery-01-hero-front.png','life-01-room.jpg','gallery-02-closeup.png','life-05-floor.jpg','life-04-last-dot.jpg','life-02-nani.jpg','gallery-04-size.png','gallery-05-plates.png'];
report.thumbnailBytes.bharat=bharat.reduce((sum,name)=>{
 const src='/bharat/product-page/'+name;
 assert.ok(manifest[src],`Missing responsive image family: ${src}`);
 return sum+fs.statSync(path.join(root,'public',manifest[src].thumb)).size;
},0);
console.log(JSON.stringify(report,null,2));
assert.ok(report.globalCssBytes<110_000,'Global CSS must stay under 110 KB; check source scanning and old page styles.');
for(const [name,bytes] of Object.entries(report.thumbnailBytes))assert.ok(bytes<80_000,`${name} thumbnail row must stay under 80 KB; do not use full gallery images for thumbnails.`);
// A long cache lifetime is safe only when each URL identifies its exact bytes.
for(const entry of Object.values(manifest))for(const size of ['full','thumb','card','small','medium','large']){
 const file=entry[size];const bytes=fs.readFileSync(path.join(root,'public',file));
 const hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
 assert.ok(file.includes('.'+hash+'.'),`Cache key does not match image bytes: ${file}`);
}
// Every product source, including nested collections, needs small derivatives.
for(const folder of ['bharat','chandrayaan','ram-mandir','yellow-taxi','nonsense']){
 for(const file of fs.readdirSync(path.join(root,'public',folder),{recursive:true})){
  if(!/\.(png|jpe?g|webp)$/i.test(file)||file.endsWith('-sm.webp'))continue;
  const src='/'+folder+'/'+file;
  const entry=manifest[src];
  assert.ok(entry,`Unoptimised product image: ${src}`);
  assert.ok(fs.statSync(path.join(root,'public',entry.thumb)).size<12_000,`Thumbnail too large: ${src}`);
  assert.ok(fs.statSync(path.join(root,'public',entry.medium)).size<400_000,`Phone image too large: ${src}`);
 }
}
console.log('Performance budgets, complete product coverage and image cache keys passed.');

// Display copies may be optimised; viewer originals must remain byte-identical.
const gullyFiles=fs.readdirSync('public/gully-cricket').filter(f=>f.endsWith('.png'));
assert.equal(gullyFiles.length,17);
for(const file of gullyFiles){
 const entry=manifest['/gully-cricket/'+file];assert.ok(entry);
 const original=fs.readFileSync('public/gully-cricket/'+file);
 assert.deepEqual(fs.readFileSync('public'+entry.original),original,'Gully image was altered: '+file);
 assert.ok(fs.statSync('public'+entry.medium).size<400_000);
 assert.ok(fs.statSync('public'+entry.thumb).size<12_000);
}
console.log('All 17 Gully Cricket originals retain exact bytes and full resolution.');
