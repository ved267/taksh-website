const pages=new Set(['/', '/sets', '/quality', '/help', '/help/contact', '/help/missing-piece', '/returns', '/privacy', ...['chandrayaan-3','ram-mandir','map-of-india','gully-cricket','yellow-taxi','nonsense'].map(s=>'/sets/'+s)]);
// Never share authenticated, cart, API, query-dependent or partial React responses.
export function publicPageCacheKey(request,build){
 const url=new URL(request.url);
 // Analytics and Cloudflare bot-protection cookies do not personalise these
 // public documents. Application, authentication and unknown cookies bypass.
 const cookieNames=(request.headers.get('cookie')||'').split(';').map(c=>c.trim().split('=')[0]).filter(Boolean);
 if(cookieNames.some(name=>!/^(__cf_bm|cf_clearance|_ga(?:_[A-Za-z0-9]+)?|_gid|_gat(?:_[A-Za-z0-9_]+)?)$/.test(name)))return null;
 if(request.method!=='GET'||!pages.has(url.pathname)||url.search||['authorization','rsc','next-router-state-tree','next-router-prefetch','next-router-segment-prefetch','next-url','x-vinext-interception-context','x-vinext-mounted-slots','x-vinext-rsc-render-mode','oai-sites-authorization'].some(h=>request.headers.has(h)))return null;
 url.searchParams.set('__taksh_build',build);return url.href;
}
export function cacheablePageResponse(response){return response.status===200&&response.headers.get('content-type')?.includes('text/html')&&!response.headers.has('set-cookie')&&!/private|no-store/i.test(response.headers.get('cache-control')||'');}
// Workers for Platforms isolates named caches and prohibits the default cache.
// Caching is optional: a service failure must always fall back to rendering.
export async function readPublicPageCache(storage,key){try{const cache=await storage.open('taksh-public-pages');return {cache,hit:await cache.match(key)}}catch{return {cache:null,hit:null}}}
