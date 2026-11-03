import {database} from '@/db';
import {json,checkOrigin,cookie,hash,setCookie,apiError} from '@/lib/server';
export async function POST(req:Request){try{checkOrigin(req);await database().prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await hash(cookie(req,'taksh_admin'))).run();return json({authenticated:false},200,{'Set-Cookie':setCookie(req,'taksh_admin','',0)})}catch(e){return apiError(e)}}
