import {isNetlify} from '../lib/hosting.mjs';
import {mkdir,readFile,writeFile,unlink} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';

function validKey(key){if(typeof key!=='string'||!/^support\/[A-Za-z0-9_-]+$/.test(key))throw new Error('Invalid private photo key.');return key}
export function storageConfig(env){
 if(isNetlify(env))return {kind:'netlify'};
 if(env.BLOB_READ_WRITE_TOKEN)return {kind:'blob',token:env.BLOB_READ_WRITE_TOKEN};
 if(env.VERCEL)throw new Error('Private photo storage is not configured.');
 return {kind:'local',directory:env.TAKSH_UPLOAD_DIRECTORY||'.local/uploads'};
}
export function createLocalStorage(directory){
 const root=resolve(directory);
 return {
  async put(key,body,_options){const file=resolve(root,validKey(key));await mkdir(dirname(file),{recursive:true,mode:0o700});await writeFile(file,new Uint8Array(body),{mode:0o600,flag:'wx'})},
  async get(key){try{return {body:new Uint8Array(await readFile(resolve(root,validKey(key))))}}catch(e){if(e.code==='ENOENT')return null;throw e}},
  async delete(key){try{await unlink(resolve(root,validKey(key)))}catch(e){if(e.code!=='ENOENT')throw e}},
 };
}
export function createBlobStorage(token){
 return {
  async put(key,body,options){const {put}=await import('@vercel/blob');return put(validKey(key),body,{access:'private',token,addRandomSuffix:false,contentType:options?.httpMetadata?.contentType})},
  async get(key){const {get}=await import('@vercel/blob');const file=await get(validKey(key),{access:'private',token,useCache:false});return file?.statusCode===200?{body:file.stream}:null},
  async delete(key){const {del}=await import('@vercel/blob');await del(validKey(key),{token})},
 };
}

export function createNetlifyStorage(env=process.env){
 const name=env.TAKSH_DEPLOY_CONTEXT==='production'?'taksh-private-support':'taksh-preview-support';
 const store=async()=>{const {getStore}=await import('@netlify/blobs');return getStore({name,consistency:'strong',region:'ap-southeast-1'})};
 return {
  async put(key,body,options){await (await store()).set(validKey(key),body,{metadata:{contentType:options?.httpMetadata?.contentType||'application/octet-stream'}})},
  async get(key){const body=await (await store()).get(validKey(key),{type:'stream',consistency:'strong'});return body?{body}:null},
  async delete(key){await (await store()).delete(validKey(key))},
 };
}
