// Unversioned legacy choices need a fresh decision; never invent consent dates.
export function readConsent(raw,now=Date.now()){
 try{
  const value=JSON.parse(raw);
  if(!value||value.version!==1||typeof value.analytics!=='boolean'||typeof value.updatedAt!=='string')return null;
  const at=Date.parse(value.updatedAt);
  if(!Number.isFinite(at)||at>now)return null;
  return {version:1,analytics:value.analytics,updatedAt:new Date(at).toISOString()};
 }catch{return null;}
}
export function writeConsent(analytics,now=Date.now()){
 return JSON.stringify({version:1,analytics:analytics===true,updatedAt:new Date(now).toISOString()});
}

// The owner-selected default is on; preserve both current and legacy opt-outs.
export function analyticsEnabled(raw,now=Date.now()){
 if(raw==='deny')return false;
 return readConsent(raw,now)?.analytics??true;
}
