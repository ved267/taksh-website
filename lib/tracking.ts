import {brand,catalogueProducts} from './shop';
import {createTracker,safePage} from './tracking-domain.mjs';
import {readConsent,writeConsent,analyticsEnabled} from './consent-domain.mjs';
declare global {interface Window {dataLayer?:IArguments[];gtag?:(...args:unknown[])=>void}}
export const analyticsConfigured = /^G-[A-Z0-9]+$/.test(brand.ga);
export const analyticsChoiceKey = 'taksh-analytics-consent';
let tracker:ReturnType<typeof createTracker>|undefined;
function currentPage() {
  const url = safePage(location.href,catalogueProducts);
  const path = new URL(url).pathname;
  const product = catalogueProducts.find(p => path === `/sets/${p.slug}`);
  const title = product ? `${product.name} | Taksh` : `${path === '/' ? 'Home' : path.split('/').filter(Boolean).join(' ')} | Taksh`;
  return {url,title};
}
function instance() {
  if (typeof window === 'undefined' || !analyticsConfigured || ['localhost','127.0.0.1','::1'].includes(location.hostname) || location.pathname.startsWith('/admin')) return;
  if (!tracker) tracker = createTracker({products:catalogueProducts,
    load:() => {
      window.dataLayer = window.dataLayer || [];
      // Google's tag bootstrap consumes Arguments objects rather than arrays.
      // eslint-disable-next-line prefer-rest-params
      window.gtag = function() {window.dataLayer!.push(arguments)};
      window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.gtag('js',new Date());
      let referrer = '';try {referrer = document.referrer ? new URL(document.referrer).origin : ''} catch {}
      window.gtag('config',brand.ga,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:currentPage().url,page_referrer:referrer});
      const script = document.createElement('script');script.async = true;script.src = `https://www.googletagmanager.com/gtag/js?id=${brand.ga}`;document.head.appendChild(script);
    },
    send:(name:string,data:Record<string,unknown>) => {const p=currentPage();window.gtag?.('set',{page_location:p.url,page_title:p.title});window.gtag?.('event',name,{...data,page_location:p.url,page_title:p.title})}
  });
  return tracker;
}
export function track(name:'ViewContent'|'AddToCart'|'InitiateCheckout'|'Lead'|'ViewCart'|'RemoveFromCart',data:Record<string,unknown>={}) {
  const t = instance();if (!t) return;const p=currentPage();t.page(p.url,p.title);t.event(name,data);
}
export function trackRoutePageView() {const t=instance();if(t){const p=currentPage();t.page(p.url,p.title)}}
export function analyticsPreference(){try{return readConsent(localStorage.getItem(analyticsChoiceKey))}catch{return null}}
export function initialiseTracking() {let allow=true;try{allow=analyticsEnabled(localStorage.getItem(analyticsChoiceKey))}catch{}instance()?.consent(allow);trackRoutePageView()}
export function setAnalyticsConsent(allow:boolean) {
  let saved=true;try {localStorage.setItem(analyticsChoiceKey,writeConsent(allow))}catch{saved=false}
  // Withdrawal stops the tracker before a page update can emit another event.
  instance()?.consent(allow);trackRoutePageView();
  if (!allow) {
    if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied'});
    for (const part of document.cookie.split(';')) {const key=part.trim().split('=')[0];if(!/^_ga(?:_|$)/.test(key))continue;for(const domain of ['',location.hostname,`.${location.hostname}`])document.cookie=`${key}=; Max-Age=0; Path=/;${domain?` Domain=${domain};`:''}`;}
    if(window.gtag&&saved)location.reload();
  }
  window.dispatchEvent(new Event('taksh-analytics-updated'));
  return saved;
}
