'use client';
import {StockNotice} from './stock-notice';
import {type RefObject} from 'react';
import {BuyerDetails} from './buyer-details';
import {Stepper} from './stepper';
import {ContactLink} from './shell';
import {pieceLabel,productMoney,boxLine,type Product} from '@/lib/shop';
function WhatsAppIcon(){return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.6 11.6a8.7 8.7 0 0 1-12.9 7.6L3 20.5l1.3-4.6a8.7 8.7 0 1 1 16.3-4.3Z"/><path d="M8.5 7.5c-.8.3-1 1.5-.5 2.6 1 2.4 3 4.4 5.4 5.2 1 .4 2.2-.1 2.6-1l-2.3-1.5-.9 1c-1.5-.6-2.7-1.8-3.3-3.2l.8-.9-1.2-2.2Z"/></svg>}
export function SetBuyBox({p,qty,setQty,buyRef,contactRef,ready,onAdd}:{p:Product;qty:number;setQty:(n:number)=>void;buyRef:RefObject<HTMLButtonElement|null>;contactRef:RefObject<HTMLDivElement|null>;ready:boolean;onAdd:()=>void;dispatch?:string;showPaymentNote?:boolean}){
 return <section className="rm-buy" aria-label="Choose your set">
  <div className="rm-title"><h1>{p.name}</h1><p>{p.subtitle}</p></div>
  <div className="rm-facts"><span>{pieceLabel(p)} pieces</span><span>{p.buildTime}</span><span>{p.level}</span></div>
  <div className="rm-description"><p className="rm-in-box">{boxLine}</p></div>
  <div className="rm-pricing"><div className="price-block"><span className="price-tag">{productMoney(p)}</span><small>MRP inclusive of all taxes</small></div></div>
  <StockNotice/><div className="rm-order"><div className="quantity-row"><span>Quantity</span><Stepper value={qty} onChange={setQty}/></div><button ref={buyRef} className="button primary full" onClick={()=>ready&&onAdd()}>Add to bag</button></div>
  <BuyerDetails p={p}/><div className="rm-contact" ref={contactRef}><ContactLink><WhatsAppIcon/>Ask us on WhatsApp</ContactLink></div>
 </section>;
}
export function SetStickyBar({p,ready,onAdd}:{p:Product;ready:boolean;onAdd:()=>void}){return <div className="rm-sticky"><div><strong>{p.name}</strong><span>{productMoney(p)}</span></div><button className="button primary" onClick={()=>ready&&onAdd()}>Add to bag</button></div>}
