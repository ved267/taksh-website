import {storedTraffic} from '@/lib/internal-demand';
import {database,runtime} from '@/db';
import type {StoredOrder} from '@/lib/order-types';
import {json,parseJson,apiError} from '@/lib/server';
import {validSyncKey,parseSyncCursor,sheetRequest} from '@/lib/customer-sheet-domain.mjs';
export async function POST(req:Request){
 try{
  if(!runtime.CUSTOMER_SHEET_SYNC_KEY)return json({error:'Customer sync is not configured.'},503);
  if(!await validSyncKey(req.headers.get('authorization'),runtime.CUSTOMER_SHEET_SYNC_KEY))return json({error:'Not authorised.'},401);
  const body=await parseJson(req);
  if(['ack','failure'].includes(body.action)){
   const at=new Date().toISOString();const key='customer-sheet';
   if(!Number.isInteger(body.count)||body.count<0||body.count>10000)throw new Error('Invalid sync count.');const category=['network','http','sheet','schema','authorization'].includes(body.category)?body.category:'';const payload:Record<string,unknown>={status:body.action==='ack'?'success':'failed',lastAttempt:at,count:body.count,errorCategory:category};if(body.action==='ack')payload.lastSuccess=at;else {const previous=await database().prepare('SELECT payload FROM reporting_state WHERE key=?').bind(key).first<{payload:string}>();if(previous)payload.lastSuccess=JSON.parse(previous.payload).lastSuccess;}
   await database().prepare('INSERT INTO reporting_state (key,updated_at,payload) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET updated_at=excluded.updated_at,payload=excluded.payload').bind(key,at,JSON.stringify(payload)).run();return json({recorded:true});
  }
  const cursor=parseSyncCursor(body.cursor);
  const result=await database().prepare("SELECT id,reference,placed_at,status,details,items,total,utm_source,utm_campaign,traffic_type FROM orders WHERE status='placed' AND (placed_at>? OR (placed_at=? AND id>?)) ORDER BY placed_at,id LIMIT 100").bind(cursor.at,cursor.at,cursor.id).all<StoredOrder>();
  const rows=result.results,last=rows.at(-1);
  return json({requests:rows.map(row=>sheetRequest({...row,traffic_type:storedTraffic(row)})),nextCursor:last?{at:last.placed_at,id:last.id}:cursor,hasMore:rows.length===100});
 }catch(e){return apiError(e)}
}
