import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
// Exercise the real helper with its checked-in image manifest.
const path=new URL('../lib/images.ts',import.meta.url);
const imageModule={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2017}}).outputText,{module:imageModule,exports:imageModule.exports,require:createRequire(path)});
const {imageSrcSet,imageAsset,imageOriginal}=imageModule.exports;
const manifest=JSON.parse(fs.readFileSync(new URL('../lib/image-assets.json',import.meta.url),'utf8'));
test('Gully display copies are responsive while viewer originals stay byte-identical',()=>{
 for(const [path,image] of Object.entries(manifest).filter(([path])=>path.startsWith('/gully-cricket/'))){
  assert.ok(imageSrcSet(path).includes('900w'),path);
  assert.equal(imageOriginal(path),image.original);
  assert.deepEqual(fs.readFileSync('public'+imageOriginal(path)),fs.readFileSync('public'+path));
  assert.ok(fs.statSync('public'+image.medium).size<400000);
  assert.notEqual(imageAsset(path),imageOriginal(path));
 }
});
test('existing image families keep their exact responsive candidates',()=>{
 for(const [path,image] of Object.entries(manifest).filter(([path])=>!path.startsWith('/gully-cricket/'))){
  const expected=new Map();
  for(const [size,width] of [['card',320],['small',600],['medium',900],['large',1200],['full',image.fullWidth]])expected.set(Math.min(width,image.width),image[size]);
  assert.equal(imageSrcSet(path),[...expected].map(([width,url])=>`${url} ${width}w`).join(', '),path);
 }
});
