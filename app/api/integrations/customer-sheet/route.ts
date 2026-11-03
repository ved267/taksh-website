import {database,runtime} from '@/db';
import type {StoredOrder} from '@/lib/order-types';
import {json,parseJson,apiError} from '@/lib/server';
import {validSyncKey,parseSyncCursor,sheetRequest} from '@/lib/customer-sheet-domain.mjs';
export async function POST(req:Request){
 try{
  if(!runtime.CUSTOMER_SHEET_SYNC_KEY)return json({error:'Customer sync is not configured.'},503);
  if(!await validSyncKey(req.headers.get('authorization'),runtime.CUSTOMER_SHEET_SYNC_KEY))return json({error:'Not authorised.'},401);
  const body=await parseJson(req),cursor=parseSyncCursor(body.cursor);
  const result=await database().prepare("SELECT id,reference,placed_at,status,details,items,total,utm_source,utm_campaign FROM orders WHERE status='placed' AND (placed_at>? OR (placed_at=? AND id>?)) ORDER BY placed_at,id LIMIT 100").bind(cursor.at,cursor.at,cursor.id).all<StoredOrder>();
  const rows=result.results,last=rows.at(-1);
  return json({requests:rows.map(sheetRequest),nextCursor:last?{at:last.placed_at,id:last.id}:cursor,hasMore:rows.length===100});
 }catch(e){return apiError(e)}
}
