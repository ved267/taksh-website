const windowMs=15*60*1000;
export function validateAdminPassword(value){if(typeof value!=='string'||value.length<4)throw new Error('Use at least four characters.');return value;}
export async function adminLocked(db,client,now=Date.now()){const row=await db.prepare('SELECT window_start,attempts FROM rate_limits WHERE key=?').bind('admin-failed:'+client).first();return !!row&&now-row.window_start<windowMs&&row.attempts>=5;}
export async function recordAdminFailure(db,client,now=Date.now()){const start=now-windowMs;await db.prepare('INSERT INTO rate_limits(key,window_start,attempts) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END,attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END').bind('admin-failed:'+client,now,start,start).run();}
export async function clearAdminFailures(db,client){await db.prepare('DELETE FROM rate_limits WHERE key=?').bind('admin-failed:'+client).run();}
