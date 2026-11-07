import {brand,catalogueProducts} from './shop';
import {createTracker,safePage,excludedFromTracking,pixelPayload} from './tracking-domain.mjs';
import {readConsent,writeConsent,analyticsEnabled} from './consent-domain.mjs';
declare global {interface Window {dataLayer?:IArguments[];gtag?:(...args:unknown[])=>void;fbq?:(...args:unknown[])=>void;clarity?:(...args:unknown[])=>void}}
export const analyticsConfigured = /^G-[A-Z0-9]+$/.test(brand.ga);
export const analyticsChoiceKey = 'taksh-analytics-consent';
export function internalTracking(){try{return excludedFromTracking(location.hostname,navigator.userAgent,localStorage.getItem('taksh-internal-traffic')==='1',navigator.webdriver===true)}catch{return false}}
let tracker:ReturnType<typeof createTracker>|undefined;
function currentPage() {
  const url = safePage(location.href,catalogueProducts);
  const path = new URL(url).pathname;
  const product = catalogueProducts.find(p => path === `/sets/${p.slug}`);
  const title = product ? `${product.name} | Taksh` : `${path === '/' ? 'Home' : path.split('/').filter(Boolean).join(' ')} | Taksh`;
  return {url,title};
}
function instance() {
  if (typeof window === 'undefined' || !analyticsConfigured || ['localhost','127.0.0.1','::1'].includes(location.hostname) || location.pathname.startsWith('/admin')||internalTracking()||location.hostname!=='taksh.store') return;
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
      // Meta Pixel and Clarity queue calls on small stubs now and download their scripts when the browser is idle, so neither can delay the page.
      const fbq:{(...args:unknown[]):void;queue?:unknown[];callMethod?:(...args:unknown[])=>void;loaded?:boolean;version?:string;disablePushState?:boolean;push?:unknown}=function(...args:unknown[]){if(fbq.callMethod)fbq.callMethod(...args);else fbq.queue!.push(args)};
      fbq.queue=[];fbq.loaded=true;fbq.version='2.0';fbq.push=fbq;fbq.disablePushState=true;window.fbq=fbq as unknown as Window['fbq'];
      window.fbq?.('init',brand.pixel);
      window.clarity=window.clarity||function(...args:unknown[]){((window.clarity as unknown as {q?:unknown[]}).q=(window.clarity as unknown as {q?:unknown[]}).q||[]).push(args)};
      const later=(fn:()=>void)=>{if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(fn,{timeout:4000});else if(typeof setTimeout==='function')setTimeout(fn,2000);else fn()};
      later(()=>{
        const pixel=document.createElement('script');pixel.async=true;pixel.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(pixel);
        const clarity=document.createElement('script');clarity.async=true;clarity.src=`https://www.clarity.ms/tag/${brand.clarity}`;document.head.appendChild(clarity);
      });
    },
    send:(name:string,data:Record<string,unknown>) => {const p=currentPage();window.gtag?.('set',{page_location:p.url,page_title:p.title});window.gtag?.('event',name,{...data,page_location:p.url,page_title:p.title});const px=pixelPayload(name,data);if(px)window.fbq?.('track',px.event,px.params)}
  });
  return tracker;
}
export function track(name:'ViewContent'|'AddToCart'|'InitiateCheckout'|'Lead'|'PayTap'|'ViewCart'|'RemoveFromCart'|'RequestFailure',data:Record<string,unknown>={}) {
  const t = instance();if (!t) return;const p=currentPage();t.page(p.url,p.title);t.event(name,data);
}
function disableInternal(){tracker?.consent(false);window.gtag?.('consent','update',{analytics_storage:'denied'});(window as unknown as Record<string,unknown>)[`ga-disable-${brand.ga}`]=true;}
function markInternalRoute(){if(location.pathname.startsWith('/admin')){try{localStorage.setItem('taksh-internal-traffic','1')}catch{};disableInternal();}}
let observingInternal=false;
export function trackRoutePageView() {markInternalRoute();const t=instance();if(t){const p=currentPage();t.page(p.url,p.title)}}
export function analyticsPreference(){try{return readConsent(localStorage.getItem(analyticsChoiceKey))}catch{return null}}
export function initialiseTracking() {if(!observingInternal){observingInternal=true;window.addEventListener('storage',(event:StorageEvent)=>{if(event.key==='taksh-internal-traffic'&&event.newValue==='1')disableInternal()});}markInternalRoute();let allow=true;try{allow=analyticsEnabled(localStorage.getItem(analyticsChoiceKey))}catch{}instance()?.consent(allow);trackRoutePageView()}
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
