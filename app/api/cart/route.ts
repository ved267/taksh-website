import {database} from '@/db';
import {resolveItems} from '@/lib/order-domain.mjs';
import {json,parseJson,currentOrder,hash,token,setCookie,apiError,rateLimit} from '@/lib/server';
// Anonymous selection only. Never collect contact fields or mutate a checkout/request.
export async function POST(req:Request){try{
 const body=await parseJson(req);const items=Array.isArray(body.items)&&body.items.length===0?[]:resolveItems(body.items);
 const row=await currentOrder(req,'taksh_cart');const now=new Date().toISOString();
 if(!items.length&&row?.status!=='cart')return json({saved:true});
 const total=items.reduce((n,i)=>n+i.price*i.quantity,0);const headers:Record<string,string>={};
 if(!row||row.status!=='cart'){
  // A checkout already owns this record. Keep it intact until a new selection is made.
  if(row?.status==='draft')return json({saved:true});
  await rateLimit(req,'cart',60);const access=token();const id=crypto.randomUUID();
  const reference='TK-'+now.slice(2,10).replace(/-/g,'')+'-'+token().slice(0,8).toUpperCase();
  const a=body.attribution||{};const s=(v:unknown)=>typeof v==='string'?v.slice(0,300):'';
  await database().prepare('INSERT INTO orders (id,token_hash,reference,created_at,updated_at,status,last_step,items,total,details,device_type,arrival_page,utm_source,utm_medium,utm_campaign,email_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,await hash(access),reference,now,now,'cart',0,JSON.stringify(items),total,'{}',/Mobile|Android|iPhone/i.test(req.headers.get('user-agent')||'')?'mobile':'desktop',s(a.arrivalPage)||'/',s(a.utmSource),s(a.utmMedium),s(a.utmCampaign),'not_requested').run();
  headers['Set-Cookie']=setCookie(req,'taksh_cart',access);
 }else await database().prepare("UPDATE orders SET updated_at=?,version=version+1,items=?,total=? WHERE id=? AND status='cart'").bind(now,JSON.stringify(items),total,row.id).run();
 return json({saved:true},200,headers);
 }catch(e){return apiError(e)}}
