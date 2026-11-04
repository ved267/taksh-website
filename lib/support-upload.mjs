// Server-only large-photo transport. Nothing here grants public read access to photos.
const CHUNK_BYTES=3*1024*1024,MAX_BYTES=5*1024*1024;
const uploadError=()=>new Error('That photo upload expired. Please try again.');
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const fieldHash=fields=>digest(JSON.stringify([fields.set,fields.description,fields.mobile]));
export function supportFields(form,products){
 const fields={set:String(form.get('set')||''),description:String(form.get('description')||'').trim().slice(0,2000),mobile:String(form.get('mobile')||'')};
 if(!products.some(p=>p.slug===fields.set)||fields.description.length<5||!/^[6-9]\d{9}$/.test(fields.mobile))throw new Error('Please choose a set, describe the piece and enter a valid mobile number.');
 return fields;
}
export function validatePhoto(bytes,type){
 if(!bytes.length||bytes.length>MAX_BYTES)throw new Error('Please use a photo smaller than 5 MB.');
 if(!['image/jpeg','image/png','image/webp'].includes(type))throw new Error('Please upload a JPG, PNG or WebP photo.');
 const valid=(type==='image/png'&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)||(type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)||(type==='image/webp'&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP');
 if(!valid)throw new Error('That file does not look like a supported photo.');
}
export async function cleanupPhotoUploads(db,storage){
 const rows=(await db.prepare('SELECT token_hash,photo_key FROM support_uploads WHERE expires_at<=? LIMIT 100').bind(Date.now()).all()).results;
 for(const row of rows){await storage.delete(row.photo_key);await db.prepare('DELETE FROM support_uploads WHERE token_hash=? AND expires_at<=?').bind(row.token_hash,Date.now()).run()}
 return rows.length;
}
export async function startPhotoUpload(db,storage,{bytes,type,totalSize,fields}){
 if(!Number.isSafeInteger(totalSize)||totalSize>MAX_BYTES)throw new Error('Please use a photo smaller than 5 MB.');
 if(bytes.length!==CHUNK_BYTES||totalSize<=CHUNK_BYTES)throw new Error('That photo size is invalid. Please try again.');
 validatePhoto(bytes,type);await cleanupPhotoUploads(db,storage);
 const token=crypto.randomUUID()+crypto.randomUUID(),key='support/partial-'+crypto.randomUUID();
 await db.prepare('INSERT INTO support_uploads(token_hash,photo_key,photo_type,total_size,fields,expires_at) VALUES (?,?,?,?,?,?)').bind(await digest(token),key,type,totalSize,await fieldHash(fields),Date.now()+10*60*1000).run();
 await storage.put(key,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),{httpMetadata:{contentType:type}});
 return token;
}
export async function finishPhotoUpload(db,storage,{token,bytes,fields}){
 if(typeof token!=='string'||token.length!==72)throw uploadError();
 const tokenHash=await digest(token),row=await db.prepare('SELECT * FROM support_uploads WHERE token_hash=? AND claimed=0 AND expires_at>?').bind(tokenHash,Date.now()).first();
 if(!row)throw uploadError();
 if(row.fields!==await fieldHash(fields))throw new Error('That photo does not match this request. Please try again.');
 if(bytes.length!==row.total_size-CHUNK_BYTES)throw new Error('That photo size is invalid. Please try again.');
 const first=await storage.get(row.photo_key);if(!first)throw uploadError();
 const prefix=new Uint8Array(await new Response(first.body).arrayBuffer());
 if(prefix.length!==CHUNK_BYTES)throw uploadError();
 const combined=new Uint8Array(row.total_size);combined.set(prefix);combined.set(bytes,prefix.length);validatePhoto(combined,row.photo_type);
 const claimed=await db.prepare('UPDATE support_uploads SET claimed=1 WHERE token_hash=? AND claimed=0 AND expires_at>? RETURNING token_hash').bind(tokenHash,Date.now()).first();
 if(!claimed)throw uploadError();
 await storage.delete(row.photo_key);
 await db.prepare('DELETE FROM support_uploads WHERE token_hash=?').bind(tokenHash).run();
 return {bytes:combined,type:row.photo_type};
}
