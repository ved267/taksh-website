// Automated-traffic classifier (owner decision 9 Nov 2026: bots may use the site but are never counted).
// Data-centre networks by ASN. Consumer ISPs (for example Jio 55836, Airtel 45609) and
// Cloudflare WARP / 1.1.1.1 (13335) are deliberately absent.
export const DATA_CENTRE_ASNS=new Set([15169,396982,16509,14618,8075,14061,16276,24940,63949,31898,45102,132203]);
export const AUTO_COOKIE='taksh_auto';
const UA=/bot\b|crawler|spider|headless|preview|facebookexternalhit/i;
const MARKED=/(?:^|;\s*)taksh_auto=1/;
// A prefetch, prerender or preview is the browser fetching ahead of the person, not a visit.
const purposeOf=h=>/pre(fetch|render|view)/i.test(h.get('sec-purpose')+h.get('purpose')+h.get('x-purpose'));

/**
 * @param {{asn?:number|string,verifiedBotCategory?:string,userAgent?:string,acceptLanguage?:string|null,purpose?:boolean}} r
 * @param {{network?:boolean}} [o] network=false skips the ASN rule (preview and CI Workers run inside data centres).
 */
export function automatedRequest({asn,verifiedBotCategory,userAgent='',acceptLanguage,purpose}={},{network=true}={}){
 return (network&&DATA_CENTRE_ASNS.has(Number(asn)))||Boolean(verifiedBotCategory)||UA.test(userAgent)||Boolean(purpose)||!acceptLanguage;
}

/** Read the facts from a Request (request.cf exists on Cloudflare; absent locally). */
export function requestFacts(request){
 const cf=/** @type {any} */(request).cf||{};
 return {asn:cf.asn,verifiedBotCategory:cf.verifiedBotCategory||cf.botManagement?.verifiedBotCategory,userAgent:request.headers.get('user-agent')||'',acceptLanguage:request.headers.get('accept-language'),purpose:purposeOf(request.headers)};
}

/** True when the request is automated now or carries the cookie from an earlier automated page view. */
export function automatedFromRequest(request,options){
 return MARKED.test(request.headers.get('cookie')||'')||automatedRequest(requestFacts(request),options);
}

/**
 * Set-Cookie for a page response that marks or unmarks this browser (24 Nov 2026: Pixel silent for real visitors).
 * Prefetch and preview requests (Meta's in-app browser, Chrome) are not page views, so they never change the mark.
 * Both a prefetch and a missing Accept-Language still count the request as automated on the server
 * (25 Nov 2026: a prefetch that does send a language used to be counted as a person), but neither alone marks the browser:
 * in-app and prefetch HTTP stacks omit it, and the mark switches off GA4, Pixel and Clarity for 30 days.
 */
export function browserCookie(request,network){
 const f=requestFacts(request);
 return f.purpose?null:autoCookie(automatedRequest({...f,acceptLanguage:1},{network}),request.headers.get('cookie'));
}

/** Set-Cookie value for an HTML response, or null when nothing needs to change. */
export function autoCookie(automated,cookieHeader=''){
 const has=MARKED.test(cookieHeader||'');
 if(automated)return has?null:`${AUTO_COOKIE}=1; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
 return has?`${AUTO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`:null;
}
