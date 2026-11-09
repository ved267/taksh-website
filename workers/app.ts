import handler from "vinext/server/fetch-handler";
import {publicPageCacheKey,cacheablePageResponse,readPublicPageCache} from '../lib/performance-domain.mjs';
import {automatedRequest,requestFacts,autoCookie} from '../lib/bot-domain.mjs';
declare const __TAKSH_BUILD__:string;
// Bots may use the site but are never counted: mark them with a cookie the tracking code reads (9 Nov 2026).
const markAutomated=(request:Request,headers:Headers,network:boolean)=>{if(!(headers.get('content-type')||'').includes('text/html'))return;const c=autoCookie(automatedRequest(requestFacts(request),{network}),request.headers.get('cookie')||'');if(c)headers.append('Set-Cookie',c);};
export default {
 async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
    const key = import.meta.env.DEV ? null : publicPageCacheKey(request, __TAKSH_BUILD__);
    const {cache,hit}=key?await readPublicPageCache(caches,key):{cache:null,hit:null};
    if (hit) {const headers=new Headers(hit.headers);if(env.APP_ENV!=='production')headers.set('X-Robots-Tag','noindex');headers.set('Cache-Control','no-cache');headers.set('Server-Timing','taksh_cache;desc="hit"');markAutomated(request,headers,env.APP_ENV!=='preview');return new Response(hit.body,{status:hit.status,headers});}
    const start=performance.now();
    const response=await handler.fetch(request,env,ctx);
    if (key && cache && cacheablePageResponse(response)) {
      const stored=response.clone();const headers=new Headers(stored.headers);
      headers.set('Cache-Control','public, max-age=300');
      ctx.waitUntil(cache.put(key,new Response(stored.body,{status:stored.status,headers})).catch(()=>{}));
    }
    const headers=new Headers(response.headers);if(env.APP_ENV!=='production')headers.set('X-Robots-Tag','noindex');headers.append('Server-Timing',`taksh_render;dur=${(performance.now()-start).toFixed(1)}`);markAutomated(request,headers,env.APP_ENV!=='preview');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  },
};
