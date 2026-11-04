import {database,storage} from '@/db';
import {products} from '@/lib/shop';
import {supportFields,validatePhoto,finishPhotoUpload} from '@/lib/support-upload.mjs';
import {json,checkOrigin,rateLimit,apiError} from '@/lib/server';
export async function POST(req:Request){let photoKey:string|null=null;try{checkOrigin(req);await rateLimit(req,'support',15);if(Number(req.headers.get('content-length'))>6*1024*1024)throw new Error('Please use a photo smaller than 5 MB.');const form=await req.formData();const {set,description,mobile}=supportFields(form,products);const photo=form.get('photo');const id=crypto.randomUUID();let photoType:null|string=null;let bytes:Uint8Array|undefined;
 if(form.get('uploadToken')){const remainder=form.get('photoRemainder');if(!(remainder instanceof File))throw new Error('Please choose a photo.');const completed=await finishPhotoUpload(database(),storage(),{token:String(form.get('uploadToken')),bytes:new Uint8Array(await remainder.arrayBuffer()),fields:{set,description,mobile}});bytes=completed.bytes;photoType=completed.type}
 else if(photo instanceof File&&photo.size){bytes=new Uint8Array(await photo.arrayBuffer());photoType=photo.type;validatePhoto(bytes,photoType)}
 if(bytes){photoKey='support/'+id;await storage().put(photoKey,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),{httpMetadata:{contentType:photoType||'application/octet-stream'}})}
 await database().prepare('INSERT INTO support (id,created_at,set_slug,description,mobile,photo_key,photo_type) VALUES (?,?,?,?,?,?,?)').bind(id,new Date().toISOString(),set,description,mobile,photoKey,photoType).run();return json({saved:true,reference:id.slice(0,8).toUpperCase()})}catch(e){if(photoKey)try{await storage().delete(photoKey)}catch{}return apiError(e)}}
