import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';import ts from 'typescript';
import * as domain from '../lib/tracking-domain.mjs';import * as consent from '../lib/consent-domain.mjs';
const source=ts.transpileModule(await fs.readFile(new URL('../lib/tracking.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function browser(choice){const stored=new Map(),listeners=new Map(),scripts=[];if(choice)stored.set('taksh-analytics-consent',choice);const exports={},location={hostname:'taksh.store',pathname:'/',href:'https://taksh.store/'};const window={addEventListener:(n,fn)=>listeners.set(n,fn)};const context={exports,require:n=>n==='./shop'?{brand:{ga:'G-TEST',pixel:'29283360584637655',clarity:'z9fvuelbga'},catalogueProducts:[{slug:'set',setNumber:'01',name:'Set',price:100}]}:n==='./tracking-domain.mjs'?domain:consent,window,location,navigator:{userAgent:'Mozilla/5.0',webdriver:false},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)},URL,Event,document:{referrer:'',head:{appendChild:s=>scripts.push(s)},createElement:()=>({})}};vm.runInNewContext(source,context);return {api:exports,stored,listeners,scripts,location,window,events:()=>window.dataLayer?.filter(args=>args[0]==='event')||[]}}
test('SPA owner entry excludes subsequent visits and disables an already-loaded Google tag',()=>{const b=browser();b.api.initialiseTracking();assert.equal(b.scripts.length,3);const count=b.events().length;b.location.pathname='/admin';b.location.href='https://taksh.store/admin';b.api.trackRoutePageView();b.location.pathname='/';b.location.href='https://taksh.store/';b.api.trackRoutePageView();b.api.track('AddToCart',{items:[{slug:'set',quantity:1}]});assert.equal(b.stored.get('taksh-internal-traffic'),'1');assert.equal(b.window['ga-disable-G-TEST'],true);assert.equal(b.events().length,count)});
test('internal exclusion in another tab stops existing tracker events',()=>{const b=browser();b.api.initialiseTracking();const count=b.events().length;b.stored.set('taksh-internal-traffic','1');b.listeners.get('storage')({key:'taksh-internal-traffic',newValue:'1'});b.api.trackRoutePageView();assert.equal(b.window['ga-disable-G-TEST'],true);assert.equal(b.events().length,count)});
test('existing analytics-off preference loads no Google script and emits no funnel events',()=>{const b=browser(consent.writeConsent(false));b.api.initialiseTracking();b.api.track('AddToCart',{items:[{slug:'set',quantity:1}]});assert.equal(b.scripts.length,0);assert.equal(b.events().length,0)});

test('Pixel and Clarity load only with analytics on, from their own hosts, and Pixel mirrors the funnel without values on a stock request',()=>{const b=browser();b.api.initialiseTracking();assert.deepEqual(b.scripts.map(s=>new URL(s.src).hostname),['www.googletagmanager.com','connect.facebook.net','www.clarity.ms']);b.api.track('PayTap',{items:[{slug:'set',quantity:2}]});b.api.track('Lead',{items:[{slug:'set',quantity:1}],reference:'R1',saved:true,contactable:true});const calls=b.window.fbq.queue.map(a=>[a[0],a[1],a[2]]);assert.equal(calls[0][0],'init');assert.equal(calls[0][1],'29283360584637655');const paid=calls.find(c=>c[1]==='AddPaymentInfo');assert.equal(paid[2].value,200);assert.deepEqual(paid[2].content_ids,['01']);const lead=calls.find(c=>c[1]==='Lead');assert.equal('value' in lead[2],false)});
test('pixelPayload ignores events it does not map and never carries typed input',()=>{assert.equal(domain.pixelPayload('availability_request_error',{items:[{item_id:'01',quantity:1}]}),null);assert.deepEqual(domain.pixelPayload('page_view',{page_location:'x'}),{event:'PageView',params:{}});assert.equal(JSON.stringify(domain.pixelPayload('view_item',{items:[{item_id:'01',quantity:1}],value:100,email:'a@b.c'})).includes('a@b.c'),false)});

// Job 2026-11-25-01: the live browser funnel is what Meta's ad set optimises on, so the whole map is locked here.
// Array.from rebuilds the list in this realm; the queue itself belongs to the script context.
const pixelCalls=b=>Array.from(b.window.fbq.queue).filter(a=>a[0]==='track').map(a=>({event:a[1],eventID:a[3]&&a[3].eventID}));
test('a visitor browser sends every funnel event to the Pixel, each with its own event id',()=>{
 const b=browser();b.api.initialiseTracking();
 b.api.track('ViewContent',{content_ids:['01'],value:100});
 b.api.track('AddToCart',{content_ids:['01'],num_items:1,value:100});
 b.api.track('InitiateCheckout',{items:[{slug:'set',quantity:1}]});
 b.api.track('PayTap',{items:[{slug:'set',quantity:1}]});
 b.api.track('Lead',{items:[{slug:'set',quantity:1}],reference:'R7',saved:true,contactable:true});
 const calls=pixelCalls(b);
 assert.deepEqual(calls.map(c=>c.event),['PageView','ViewContent','AddToCart','InitiateCheckout','AddPaymentInfo','Lead']);
 assert.equal(calls.every(c=>typeof c.eventID==='string'&&c.eventID.length>0),true);
 assert.equal(new Set(calls.map(c=>c.eventID)).size,calls.length);
 // The server sends Lead with the request reference as event_id, so Meta counts the pair once.
 assert.equal(calls.find(c=>c.event==='Lead').eventID,'R7');
});
test('the owner exclusion can be read and cleared, and tracking resumes for that browser',()=>{
 const b=browser();b.location.pathname='/admin';b.location.href='https://taksh.store/admin';b.api.initialiseTracking();
 assert.equal(b.api.internalExclusion(),true);
 assert.equal(b.window['ga-disable-G-TEST'],true);
 assert.equal(b.api.clearInternalExclusion(),true);
 assert.equal(b.api.internalExclusion(),false);
 assert.equal(b.window['ga-disable-G-TEST'],false);
 const after=browser();after.api.initialiseTracking();
 assert.equal(after.scripts.length,3);
});

