// Vercel sets this header at its edge. Never use a caller's Cloudflare header there.
export function clientAddress(req,env){
 return env.VERCEL?(req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'unavailable').split(',')[0].trim():(req.headers.get('cf-connecting-ip')||'local');
}
