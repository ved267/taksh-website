import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDatabase} from '../db/portable-database.mjs';
import {createLocalStorage} from '../db/portable-storage.mjs';
import * as uploads from '../lib/support-upload.mjs';

const fields={set:'nonsense',description:'The small blue hinge is missing.',mobile:'9876543210'};
async function fixture(run){
 const db=createDatabase({url:':memory:'}),directory=await mkdtemp(join(tmpdir(),'taksh-upload-chunks-')),storage=createLocalStorage(directory);
 await db.exec('CREATE TABLE support_uploads(token_hash TEXT PRIMARY KEY,photo_key TEXT NOT NULL,photo_type TEXT NOT NULL,total_size INTEGER NOT NULL,fields TEXT NOT NULL,expires_at INTEGER NOT NULL,claimed INTEGER NOT NULL DEFAULT 0)');
 try{await run(db,storage)}finally{db.close();await rm(directory,{recursive:true,force:true})}
}
const jpeg=()=>{const bytes=new Uint8Array(5*1024*1024);bytes.set([255,216,255]);bytes[bytes.length-1]=71;return bytes};
test('a maximum-size support photo survives bounded transfer and a token cannot be reused',async()=>{
 assert.equal(typeof uploads.startPhotoUpload,'function','large-photo transfer is not implemented');
 await fixture(async(db,storage)=>{
  const bytes=jpeg(),part=bytes.slice(0,3*1024*1024),remaining=bytes.slice(part.length);
  const token=await uploads.startPhotoUpload(db,storage,{bytes:part,type:'image/jpeg',totalSize:bytes.length,fields});
  const completed=await uploads.finishPhotoUpload(db,storage,{token,bytes:remaining,fields});
  assert.deepEqual(completed.bytes,bytes);assert.equal(completed.type,'image/jpeg');
  await assert.rejects(uploads.finishPhotoUpload(db,storage,{token,bytes:remaining,fields}),/expired|try again/i);
  assert.equal((await db.prepare('SELECT * FROM support_uploads').all()).results.length,0);
 });
});
test('upload limits, signature and contact binding are checked before final storage',async()=>{
 assert.equal(typeof uploads.startPhotoUpload,'function');
 await fixture(async(db,storage)=>{
  const bytes=jpeg(),part=bytes.slice(0,3*1024*1024);
  await assert.rejects(uploads.startPhotoUpload(db,storage,{bytes:part,type:'image/jpeg',totalSize:6*1024*1024,fields}),/5 MB/i);
  await assert.rejects(uploads.startPhotoUpload(db,storage,{bytes:new Uint8Array(part.length),type:'image/jpeg',totalSize:bytes.length,fields}),/supported photo/i);
  const token=await uploads.startPhotoUpload(db,storage,{bytes:part,type:'image/jpeg',totalSize:bytes.length,fields});
  await assert.rejects(uploads.finishPhotoUpload(db,storage,{token,bytes:bytes.slice(part.length),fields:{...fields,mobile:'9876543211'}}),/match|try again/i);
  await assert.rejects(uploads.finishPhotoUpload(db,storage,{token,bytes:new Uint8Array(4*1024*1024),fields}),/size|5 MB/i);
 });
});
test('expired photo parts are rejected and cleanup removes their private bytes',async()=>{
 assert.equal(typeof uploads.startPhotoUpload,'function');
 await fixture(async(db,storage)=>{
  const bytes=jpeg(),token=await uploads.startPhotoUpload(db,storage,{bytes:bytes.slice(0,3*1024*1024),type:'image/jpeg',totalSize:bytes.length,fields});
  const row=await db.prepare('SELECT * FROM support_uploads').first();
  await db.prepare('UPDATE support_uploads SET expires_at=0').run();
  await assert.rejects(uploads.finishPhotoUpload(db,storage,{token,bytes:bytes.slice(3*1024*1024),fields}),/expired|try again/i);
  await uploads.cleanupPhotoUploads(db,storage);
  assert.equal(await storage.get(row.photo_key),null);
  assert.equal((await db.prepare('SELECT * FROM support_uploads').all()).results.length,0);
 });
});

test('a transient private-part deletion failure remains tracked for cleanup and cannot be claimed again',async()=>{
 await fixture(async(db,storage)=>{
  const bytes=jpeg(),token=await uploads.startPhotoUpload(db,storage,{bytes:bytes.slice(0,3*1024*1024),type:'image/jpeg',totalSize:bytes.length,fields});
  let failed=false;const unreliable={...storage,async delete(key){if(!failed){failed=true;throw new Error('Transient storage failure')}return storage.delete(key)}};
  await assert.rejects(uploads.finishPhotoUpload(db,unreliable,{token,bytes:bytes.slice(3*1024*1024),fields}),/storage failure/i);
  assert.equal((await db.prepare('SELECT * FROM support_uploads').all()).results.length,1);
  await assert.rejects(uploads.finishPhotoUpload(db,storage,{token,bytes:bytes.slice(3*1024*1024),fields}),/expired|try again/i);
  await db.prepare('UPDATE support_uploads SET expires_at=0').run();await uploads.cleanupPhotoUploads(db,storage);
  assert.equal((await db.prepare('SELECT * FROM support_uploads').all()).results.length,0);
 });
});
