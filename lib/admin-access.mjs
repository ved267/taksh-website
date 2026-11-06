const windowMs=15*60*1000;
export function validateAdminPassword(value){if(typeof value!=='string'||value.length<4)throw new Error('Use at least four characters.');return value;}
export async function adminLocked(db,client,now=Date.now()){return !!await db.prepare('SELECT key FROM rate_limits WHERE key=? AND attempts>4 AND window_start>?').bind('admin-failed:'+client,now-windowMs).first();}
export function countAdminAttempt(db,key,now=Date.now()){const start=now-windowMs;return db.prepare('INSERT INTO rate_limits (key,window_start,attempts) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET window_start=CASE WHEN window_start<? THEN excluded.window_start ELSE window_start END, attempts=CASE WHEN window_start<? THEN 1 ELSE attempts+1 END RETURNING attempts').bind(key,now,start,start).first();}
export const recordAdminFailure=(db,client,now)=>countAdminAttempt(db,'admin-failed:'+client,now);
export const clearAdminFailures=(db,client)=>db.prepare('DELETE FROM rate_limits WHERE key=?').bind('admin-failed:'+client).run();
