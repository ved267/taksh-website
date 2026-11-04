import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createLocalStorage,storageConfig} from '../db/portable-storage.mjs';

test('private local uploads round-trip and reject escaping paths',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'taksh-upload-'));
 try{
  const storage=createLocalStorage(dir);
  await storage.put('support/abc',new TextEncoder().encode('photo'),{httpMetadata:{contentType:'image/png'}});
  assert.equal(await new Response((await storage.get('support/abc')).body).text(),'photo');
  assert.equal((await stat(join(dir,'support/abc'))).mode&0o777,0o600);
  for(const key of ['../secret','/etc/passwd','support/../../secret','support\\..\\secret'])await assert.rejects(storage.get(key),/invalid/i);
  await storage.delete('support/abc');assert.equal(await storage.get('support/abc'),null);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('hosted execution has no filesystem upload fallback',()=>{
 assert.throws(()=>storageConfig({VERCEL:'1'}),/storage.*configured/i);
 assert.equal(storageConfig({}).kind,'local');
});

test('Netlify uses its private store rather than local disk or a paid provider token',()=>{
 assert.equal(storageConfig({NETLIFY:'true'}).kind,'netlify');
 assert.equal(storageConfig({NETLIFY:'true',BLOB_READ_WRITE_TOKEN:'unrelated-token'}).kind,'netlify');
});

test('Netlify runtime marker requires private platform storage even without build-only NETLIFY',()=>{
 assert.equal(storageConfig({SITE_ID:'netlify-site'}).kind,'netlify');
});
