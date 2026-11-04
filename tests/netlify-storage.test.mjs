import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {BlobsServer} from '@netlify/blobs/server';
import {setEnvironmentContext} from '@netlify/blobs';
import {createNetlifyStorage} from '../db/portable-storage.mjs';

test('private Netlify adapter round-trips bytes through the SDK and isolates preview storage',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'taksh-netlify-blobs-')),server=new BlobsServer({directory,token:'local-test-only',logger:()=>{}});
 const {port}=await server.start();setEnvironmentContext({apiURL:`http://127.0.0.1:${port}`,siteID:'test-site',token:'local-test-only'});
 try{
  const production=createNetlifyStorage({TAKSH_DEPLOY_CONTEXT:'production'}),preview=createNetlifyStorage({TAKSH_DEPLOY_CONTEXT:'deploy-preview'});
  const bytes=new Uint8Array([137,80,78,71,8,9]);
  await production.put('support/example',bytes.buffer,{httpMetadata:{contentType:'image/png'}});
  assert.deepEqual(new Uint8Array(await new Response((await production.get('support/example')).body).arrayBuffer()),bytes);
  assert.equal(await preview.get('support/example'),null);
  await assert.rejects(production.get('../private'),/Invalid private photo key/);
  await production.delete('support/example');assert.equal(await production.get('support/example'),null);
 }finally{setEnvironmentContext({});await server.stop();await rm(directory,{recursive:true,force:true})}
});
