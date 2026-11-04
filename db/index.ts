import {createDatabase,databaseConfig} from './portable-database.mjs';
import {createLocalStorage,createBlobStorage,storageConfig} from './portable-storage.mjs';
type Statement={bind(...args:unknown[]):Statement;first<T=Record<string,unknown>>(column?:string):Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results:T[];meta:{changes:number}}>;run():Promise<{meta:{changes:number}}>};
type Database={prepare(sql:string):Statement;batch(statements:Statement[]):Promise<unknown[]>};
let db:Database|undefined;
let bucket:ReturnType<typeof createLocalStorage>|ReturnType<typeof createBlobStorage>|undefined;
export function database(){return db??=createDatabase(databaseConfig(process.env)) as unknown as Database}
export function storage(){if(!bucket){const c=storageConfig(process.env);bucket=c.kind==='blob'?createBlobStorage(c.token):createLocalStorage(c.directory)}return bucket}
export const runtime=process.env;
