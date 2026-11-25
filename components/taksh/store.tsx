'use client';
import {SiteLink} from '@/components/taksh/site-link';
import {usePathname} from 'next/navigation';

import {createContext,useContext,useEffect,useState,useCallback,useRef,useMemo,useSyncExternalStore} from 'react';

import {Check,Minus} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {catalogueProducts as products,productMoney,type CartItem,type Product} from '@/lib/shop';
import {track,initialiseTracking,trackRoutePageView} from '@/lib/tracking';
import {ProductImage} from './visuals';
import {syncCart,flushCart} from '@/lib/cart-sync';
import {bagSnapshot,subscribeBag,writeBag} from '@/lib/bag-storage';
import {normaliseBag,addBagItem} from '@/lib/bag-domain.mjs';
type BrowserTool={name:string;description:string;inputSchema:Record<string,unknown>;annotations:{readOnlyHint:boolean};execute:((input:{slug:string;quantity:number})=>unknown)|(()=>unknown)};
declare global {interface Window {__takshReleaseVisualTap?:()=>void} interface Document {modelContext?:{registerTool:(tool:BrowserTool,options:{signal:AbortSignal})=>unknown}}}
type Store={items:CartItem[];ready:boolean;add:(p:Product,qty?:number,silent?:boolean)=>void;update:(slug:string,qty:number)=>void;clear:()=>void;count:number;total:number};
const Ctx=createContext<Store|null>(null);
export const useStore=()=>{const c=useContext(Ctx);if(!c)throw new Error('Store unavailable');return c};
export function StoreProvider({children}:{children:React.ReactNode}){const raw=useSyncExternalStore(subscribeBag,bagSnapshot,()=>null);const ready=useSyncExternalStore(subscribeBag,()=>true,()=>false);const items=useMemo(()=>{try{return normaliseBag(JSON.parse(raw||'[]')) as CartItem[]}catch{return []}},[raw]);const[added,setAdded]=useState<{p:Product,qty:number,limited:boolean}|null>(null);
 const pathname=usePathname();const previousPath=useRef<string|null>(null);
 useEffect(()=>{if(ready)window.__takshReleaseVisualTap?.()},[ready]);
 useEffect(()=>{if(previousPath.current!==null&&previousPath.current!==pathname)trackRoutePageView();previousPath.current=pathname},[pathname]);
 const readItems=useCallback(()=>{try{return normaliseBag(JSON.parse(bagSnapshot()||'[]')) as CartItem[]}catch{return []}},[]);
 const commit=useCallback((next:CartItem[])=>writeBag(JSON.stringify(next)),[]);
 useEffect(()=>{initialiseTracking();try{if(!sessionStorage.getItem('taksh-arrival')){const u=new URL(location.href);sessionStorage.setItem('taksh-arrival',JSON.stringify({arrivalPage:u.pathname,referrer:document.referrer?new URL(document.referrer).origin:'',utmSource:u.searchParams.get('utm_source')||'',utmMedium:u.searchParams.get('utm_medium')||'',utmCampaign:u.searchParams.get('utm_campaign')||''}))}}catch{}},[]);
 const add=useCallback((p:Product,qty=1,silent=false)=>{const prior=readItems().find(i=>i.slug===p.slug)?.quantity||0;const next=addBagItem(readItems(),p.slug,qty);const quantity=next.find(i=>i.slug===p.slug)!.quantity;commit(next);syncCart(next);const actual=quantity-prior;if(actual)track('AddToCart',{content_ids:[p.setNumber],value:p.price*actual,num_items:actual});if(!silent)setAdded({p,qty:quantity,limited:actual===0})},[commit,readItems]);
 const update=(slug:string,qty:number)=>{if(!Number.isInteger(qty))return;const prior=readItems().find(i=>i.slug===slug)?.quantity||0;if(qty<prior)track('RemoveFromCart',{items:[{slug,quantity:prior-Math.max(0,qty)}]});const next=normaliseBag(qty<=0?readItems().filter(i=>i.slug!==slug):readItems().map(i=>i.slug===slug?{...i,quantity:Math.min(3,qty)}:i));commit(next);syncCart(next)};
 useEffect(()=>{const flush=()=>{if(document.visibilityState==='hidden')flushCart()};window.addEventListener('online',flushCart);document.addEventListener('visibilitychange',flush);return()=>{window.removeEventListener('online',flushCart);document.removeEventListener('visibilitychange',flush)}},[]);
 useEffect(()=>{if(ready&&items.length)syncCart(items)},[ready,items]);

 useEffect(()=>{const context=document.modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();const register=(tool:BrowserTool)=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}};register({name:'taksh_read_bag',description:'Read the current Taksh bag and catalogue prices.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({items:items.map(i=>({...i,name:products.find(p=>p.slug===i.slug)?.name})),total:items.reduce((n,i)=>n+(products.find(p=>p.slug===i.slug)?.price||0)*i.quantity,0)})});register({name:'taksh_add_to_bag',description:'Add a known Taksh set to the visible bag. Does not place an order.',inputSchema:{type:'object',properties:{slug:{type:'string'},quantity:{type:'integer',minimum:1,maximum:3}},required:['slug','quantity'],additionalProperties:false},annotations:{readOnlyHint:false},execute:({slug,quantity}:{slug:string;quantity:number})=>{const p=products.find(p=>p.slug===slug);if(!p||!Number.isInteger(quantity)||quantity<1||quantity>3)throw new Error('Choose a valid set and quantity from 1 to 3.');add(p,quantity);return{slug,quantity:Math.min(3,(items.find(i=>i.slug===slug)?.quantity||0)+quantity),status:'added_to_bag'}}});return()=>lifecycle.abort()},[items,add]);
 return <Ctx.Provider value={{items,ready,add,update,clear:()=>{commit([]);syncCart([])},count:items.reduce((n,i)=>n+i.quantity,0),total:items.reduce((n,i)=>n+(products.find(p=>p.slug===i.slug)?.price||0)*i.quantity,0)}}>{children}<Dialog open={!!added} onOpenChange={v=>{if(!v)setAdded(null)}}><DialogContent className="taksh-dialog bag-dialog"><span className="confirmation-mark">{added?.limited?<Minus size={24}/>:<Check size={24}/>}</span><DialogTitle>{added?.limited?'Three is the limit for this set':'Added to your bag'}</DialogTitle><DialogDescription className="sr-only">Your selected set, price and quantity.</DialogDescription>{added&&<div className="added-item"><ProductImage p={added.p} sizes="100px"/><div><h3>{added.p.name}</h3><p>{productMoney(added.p)} · Quantity {added.qty}</p></div></div>}<div className="two-buttons"><button className="button outline" onClick={()=>setAdded(null)}>Keep looking</button><SiteLink className="button primary" href="/bag" onClick={()=>setAdded(null)}>View bag</SiteLink></div></DialogContent></Dialog></Ctx.Provider>
}
