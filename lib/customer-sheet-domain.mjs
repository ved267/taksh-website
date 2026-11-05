export async function validSyncKey(header,configured){
 if(!/^[a-f0-9]{64}$/.test(configured||''))return false;
 const supplied=/^Bearer ([a-f0-9]{64})$/.exec(header||'')?.[1];if(!supplied)return false;
 const digest=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
 const [a,b]=await Promise.all([digest(supplied),digest(configured)]);let difference=0;for(let i=0;i<a.length;i++)difference|=a[i]^b[i];return difference===0;
}
export function parseSyncCursor(cursor){
 if(cursor==null)return {at:'',id:''};
 if(cursor.at===''&&cursor.id==='')return {at:'',id:''};
 if(typeof cursor.at!=='string'||typeof cursor.id!=='string'||cursor.id.length>200||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(cursor.at)||new Date(cursor.at).toISOString()!==cursor.at)throw new Error('Invalid sync cursor.');
 return {at:cursor.at,id:cursor.id};
}
function text(value){const s=String(value??'').replace(/\u0000/g,'');return /^[=+\-@]/.test(s.trimStart())?"'"+s:s}
export function sheetRequest(row){
 if(row.status!=='placed')throw new Error('Only submitted requests can be exported.');
 const d=JSON.parse(row.details),items=JSON.parse(row.items);
 return {excluded:!((d.email||'').trim()||(d.mobile||'').trim()),reference:row.reference,placedAt:row.placed_at,isTest:row.traffic_type==='test'||row.traffic_type==='automated'||/@(?:example\.test|example\.invalid)$/i.test(d.email||''),values:[text(d.fullName),text(d.mobile),items.map(i=>`${text(i.name)} × ${i.quantity}`).join('; '),items.reduce((n,i)=>n+i.quantity,0),row.total,text(d.email),text(d.city),text(d.state),text(d.pincode),text([d.house,d.street,d.city,d.state,d.pincode].filter(Boolean).join(', ')),d.whatsappConsent?'Yes':'No',row.placed_at,text(row.reference),text(row.utm_source),text(row.utm_campaign)]};
}
