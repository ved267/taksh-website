import {createClient} from '@libsql/client';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';

export function databaseConfig(env){
 const url=env.TURSO_DATABASE_URL||env.DATABASE_URL;
 if(env.VERCEL&&!url)throw new Error('Durable database is not configured.');
 if(env.VERCEL&&/^(file:|:memory:)/.test(url||''))throw new Error('Local databases are unavailable in hosted execution.');
 if(url&&!/^(file:|:memory:)/.test(url)&&!env.TURSO_AUTH_TOKEN)throw new Error('Database authentication token is not configured.');
 return {url:url||'file:.local/taksh.sqlite3',authToken:env.TURSO_AUTH_TOKEN};
}

export function createDatabase(config){
 const url=config.url===':memory:'?'file::memory:':config.url;
 if(url.startsWith('file:')&&url!=='file::memory:')mkdirSync(dirname(resolve(url.slice(5))),{recursive:true,mode:0o700});
 const client=createClient({...config,url});
 const result=r=>({success:true,results:Array.from(r.rows,row=>({...row})),meta:{changes:r.rowsAffected,last_row_id:r.lastInsertRowid===undefined?undefined:Number(r.lastInsertRowid)}});
 class Statement{
  constructor(sql,args=[]){this.sql=sql;this.args=args}
  bind(...args){return new Statement(this.sql,args)}
  async all(){return result(await client.execute({sql:this.sql,args:this.args}))}
  async first(column){const row=(await this.all()).results[0];return row?(column===undefined?row:row[column]):null}
  async run(){return this.all()}
 }
 return {
  prepare:sql=>new Statement(sql),
  async batch(statements){return (await client.batch(statements.map(s=>({sql:s.sql,args:s.args})),'write')).map(result)},
  exec:sql=>client.executeMultiple(sql),
  close:()=>client.close(),
 };
}
