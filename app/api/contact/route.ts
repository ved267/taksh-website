import {database} from '@/db';
import {json,parseJson,rateLimit,apiError} from '@/lib/server';
import {validateEnquiry} from '@/lib/contact-domain.mjs';
export async function POST(req:Request){try{const raw=await parseJson(req);await rateLimit(req,'contact',15);const d=validateEnquiry(raw);const id=crypto.randomUUID();const reference='ASK-'+id.slice(0,8).toUpperCase();await database().prepare('INSERT INTO enquiries (id,reference,created_at,name,mobile,email,topic,message) VALUES (?,?,?,?,?,?,?,?)').bind(id,reference,new Date().toISOString(),d.name,d.mobile,d.email,d.topic,d.message).run();return json({saved:true,reference})}catch(e){return apiError(e)}}
