import {isNetlify} from './hosting.mjs';
// Vercel sets this header at its edge. Never use a caller's Cloudflare header there.
export function clientAddress(req,env){
 if(isNetlify(env))return req.headers.get('x-nf-client-connection-ip')||'unavailable';
 return env.VERCEL?(req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'unavailable').split(',')[0].trim():(req.headers.get('cf-connecting-ip')||'local');
}
