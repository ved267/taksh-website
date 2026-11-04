import test from 'node:test';
import assert from 'node:assert/strict';
import {createDatabase, databaseConfig} from '../db/portable-database.mjs';

test('portable database preserves binding, missing rows and optimistic update conflicts',async()=>{
 const db=createDatabase({url:':memory:'});
 try{
  await db.exec('CREATE TABLE requests(id TEXT PRIMARY KEY, value TEXT, version INTEGER NOT NULL DEFAULT 0)');
  await db.prepare('INSERT INTO requests(id,value) VALUES (?,?)').bind('a',"O'Brien").run();
  assert.equal((await db.prepare('SELECT value FROM requests WHERE id=?').bind('a').first()).value,"O'Brien");
  assert.equal(await db.prepare('SELECT * FROM requests WHERE id=?').bind('missing').first(),null);
  const attempts=await Promise.all(['one','two'].map(value=>db.prepare('UPDATE requests SET value=?,version=version+1 WHERE id=? AND version=?').bind(value,'a',0).run()));
  assert.equal(attempts.reduce((n,r)=>n+r.meta.changes,0),1);
  assert.equal((await db.prepare('SELECT * FROM requests').all()).results.length,1);
 }finally{db.close()}
});

test('batch errors roll back earlier writes',async()=>{
 const db=createDatabase({url:':memory:'});
 try{
  await db.exec('CREATE TABLE requests(id TEXT PRIMARY KEY)');
  await assert.rejects(db.batch([db.prepare('INSERT INTO requests VALUES (?)').bind('same'),db.prepare('INSERT INTO requests VALUES (?)').bind('same')]));
  assert.equal((await db.prepare('SELECT * FROM requests').all()).results.length,0);
 }finally{db.close()}
});

test('hosted execution requires durable database configuration',()=>{
 assert.throws(()=>databaseConfig({VERCEL:'1'}),/database.*configured/i);
 assert.throws(()=>databaseConfig({VERCEL:'1',TURSO_DATABASE_URL:'file:/tmp/ephemeral.db'}),/local.*hosted/i);
 assert.throws(()=>databaseConfig({VERCEL:'1',TURSO_DATABASE_URL:'libsql://example.turso.io'}),/token/i);
 assert.equal(databaseConfig({}).url,'file:.local/taksh.sqlite3');
});

test('Netlify production cannot silently use a local database',()=>{
 assert.throws(()=>databaseConfig({NETLIFY:'true'}),/database.*configured/i);
 assert.throws(()=>databaseConfig({NETLIFY:'true',TURSO_DATABASE_URL:'file:.local/ephemeral.sqlite3'}),/local.*hosted/i);
 assert.throws(()=>databaseConfig({NETLIFY:'true',TURSO_DATABASE_URL:'libsql://example.turso.io'}),/token/i);
});

test('Netlify serverless runtime markers fail closed and previews never use production credentials',()=>{
 assert.throws(()=>databaseConfig({SITE_ID:'netlify-site'}),/database.*configured/i);
 assert.throws(()=>databaseConfig({SITE_ID:'netlify-site',TAKSH_DEPLOY_CONTEXT:'deploy-preview',TURSO_DATABASE_URL:'libsql://production.turso.io',TURSO_AUTH_TOKEN:'production'}),/preview.*configured/i);
 assert.equal(databaseConfig({SITE_ID:'netlify-site',TAKSH_DEPLOY_CONTEXT:'deploy-preview',TURSO_DATABASE_URL:'libsql://production.turso.io',TURSO_AUTH_TOKEN:'production',TAKSH_PREVIEW_DATABASE_URL:'libsql://preview.turso.io',TAKSH_PREVIEW_AUTH_TOKEN:'preview'}).url,'libsql://preview.turso.io');
});
