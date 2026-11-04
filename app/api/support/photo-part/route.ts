import {database,storage} from '@/db';
import {products} from '@/lib/shop';
import {json,checkOrigin,rateLimit,apiError} from '@/lib/server';
import {supportFields,startPhotoUpload} from '@/lib/support-upload.mjs';
export async function POST(req:Request){try{
 checkOrigin(req);await rateLimit(req,'support-photo',15);
 if(Number(req.headers.get('content-length'))>3*1024*1024+20000)throw new Error('That photo part is too large.');
 const form=await req.formData(),fields=supportFields(form,products),part=form.get('photoFirst');
 if(!(part instanceof File))throw new Error('Please choose a photo.');
 const uploadToken=await startPhotoUpload(database(),storage(),{bytes:new Uint8Array(await part.arrayBuffer()),type:part.type,totalSize:Number(form.get('photoSize')),fields});
 return json({uploadToken});
}catch(error){return apiError(error)}}
