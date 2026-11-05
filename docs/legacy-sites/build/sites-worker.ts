import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

import { publicPageCacheKey, cacheablePageResponse, readPublicPageCache } from "../lib/performance-domain.mjs";
declare const __TAKSH_BUILD__: string;
export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    const key = import.meta.env.DEV ? null : publicPageCacheKey(request, __TAKSH_BUILD__);
    const {cache,hit}=key?await readPublicPageCache(caches,key):{cache:null,hit:null};
    if (hit) {const headers=new Headers(hit.headers);headers.set('Cache-Control','no-cache');headers.set('Server-Timing','taksh_cache;desc="hit"');return new Response(hit.body,{status:hit.status,headers});}
    const start=performance.now();
    const response=await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
    if (key && cache && cacheablePageResponse(response)) {
      const stored=response.clone();const headers=new Headers(stored.headers);
      headers.set('Cache-Control','public, max-age=300');
      ctx.waitUntil(cache.put(key,new Response(stored.body,{status:stored.status,headers})).catch(()=>{}));
    }
    const headers=new Headers(response.headers);headers.append('Server-Timing',`taksh_render;dur=${(performance.now()-start).toFixed(1)}`);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  },
};
