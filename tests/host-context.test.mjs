import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const script=resolve('scripts/prepare-host-context.mjs');
test('Netlify build configuration bakes deployment identity without including credentials',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'taksh-host-context-'));
 try{
  const built=spawnSync(process.execPath,[script],{cwd:directory,env:{...process.env,NETLIFY:'',TAKSH_BUILD_PLATFORM:'netlify',TAKSH_BUILD_CONTEXT:'deploy-preview',TURSO_AUTH_TOKEN:'must-not-be-baked'},encoding:'utf8'});
  assert.equal(built.status,0,built.stderr);
  const json=await readFile(join(directory,'.deployment/host-context.json'),'utf8');
  assert.deepEqual(JSON.parse(json),{platform:'netlify',context:'deploy-preview'});
  assert.ok(!json.includes('must-not-be-baked'));
 }finally{await rm(directory,{recursive:true,force:true})}
});
