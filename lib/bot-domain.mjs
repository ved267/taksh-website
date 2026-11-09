// Automated-traffic classifier (owner decision 9 Nov 2026: bots may use the site but are never counted).
// Data-centre networks by ASN. Consumer ISPs (for example Jio 55836, Airtel 45609) and
// Cloudflare WARP / 1.1.1.1 (13335) are deliberately absent.
export const DATA_CENTRE_ASNS=new Set([15169,396982,16509,14618,8075,14061,16276,24940,63949,31898,45102,132203]);
export const AUTO_COOKIE='taksh_auto';
const UA=/bot\b|crawler|spider|headless|preview|facebookexternalhit/i;

/**
 * @param {{asn?:number|string,verifiedBotCategory?:string,userAgent?:string,acceptLanguage?:string|null}} r
 * @param {{network?:boolean}} [o] network=false skips the ASN rule (preview and CI Workers run inside data centres).
 */
export function automatedRequest({asn,verifiedBotCategory,userAgent='',acceptLanguage}={},{network=true}={}){
 return (network&&DATA_CENTRE_ASNS.has(Number(asn)))||Boolean(verifiedBotCategory)||UA.test(userAgent)||!acceptLanguage;
}

/** Read the facts from a Request (request.cf exists on Cloudflare; absent locally). */
export function requestFacts(request){
 const cf=/** @type {any} */(request).cf||{};
 return {asn:cf.asn,verifiedBotCategory:cf.verifiedBotCategory||cf.botManagement?.verifiedBotCategory,userAgent:request.headers.get('user-agent')||'',acceptLanguage:request.headers.get('accept-language')};
}

/** True when the request is automated now or carries the cookie from an earlier automated page view. */
export function automatedFromRequest(request,options){
 return new RegExp(`(?:^|;\\s*)${AUTO_COOKIE}=1`).test(request.headers.get('cookie')||'')||automatedRequest(requestFacts(request),options);
}

/** Set-Cookie value for an HTML response, or null when nothing needs to change. */
export function autoCookie(automated,cookieHeader=''){
 const has=new RegExp(`(?:^|;\\s*)${AUTO_COOKIE}=1`).test(cookieHeader||'');
 if(automated)return has?null:`${AUTO_COOKIE}=1; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
 return has?`${AUTO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`:null;
}
