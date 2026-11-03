import {database} from '@/db';
import {json,parseJson,rateLimit,apiError} from '@/lib/server';
export async function POST(req:Request){try{const b=await parseJson(req);await rateLimit(req,'signup',15);if(!/^[6-9]\d{9}$/.test(b.mobile)||b.consent!==true)throw new Error('Enter a valid 10-digit Indian mobile number and agree to updates.');await database().prepare('INSERT INTO subscriptions (id,created_at,mobile,consent) VALUES (?,?,?,1) ON CONFLICT(mobile) DO NOTHING').bind(crypto.randomUUID(),new Date().toISOString(),b.mobile).run();return json({saved:true})}catch(e){return apiError(e)}}
