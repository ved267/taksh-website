'use client';
import {StockNotice} from './stock-notice';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ChandrayaanGallery} from './chandrayaan';
import {BuyerDetails} from './buyer-details';
import {SetPhoto} from './set-gallery';
import {Stepper} from './stepper';
import {ContactLink} from './shell';
import {SiteLink} from './site-link';
import {useStore} from './store';
import {useStickyPurchase} from './use-sticky-purchase';
import {productMoney,boxLine,type Product} from '@/lib/shop';
import {track} from '@/lib/tracking';
import './nonsense.css';
import {SetFilm} from './set-film';
function WhatsAppIcon(){return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.6 11.6a8.7 8.7 0 0 1-12.9 7.6L3 20.5l1.3-4.6a8.7 8.7 0 1 1 16.3-4.3Z"/><path d="M8.5 7.5c-.8.3-1 1.5-.5 2.6 1 2.4 3 4.4 5.4 5.2 1 .4 2.2-.1 2.6-1l-2.3-1.5-.9 1c-1.5-.6-2.7-1.8-3.3-3.2l.8-.9-1.2-2.2Z"/></svg>}

const gallery=[
 {image:'gallery-04-breakfast',label:'At breakfast',alt:'The Ulta Chashma brick glasses on a breakfast table.'},
 {image:'gallery-03-home',label:'On the shelf',alt:'The Ulta Chashma brick glasses displayed on a shelf at home.'},
 {image:'gallery-01-hero',label:'Ulta Chashma',alt:'Blue brick glasses on a black display stand.'},
 {image:'gallery-02-hinge-closeup',label:'The hinge',alt:'A close-up of the folding hinge on the blue brick glasses.'},
];

export function NonsenseDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();
 const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef,false);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="ch3-page nonsense-page" style={{'--ch3-header-height':`${headerHeight}px`} as CSSProperties}>
  <section className="wrap ch3-opening nonsense-opening" aria-label="Ulta Chashma gallery and buy panel">
   <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Ulta Chashma</span></nav><div className="ch3-top-layout">
    <ChandrayaanGallery photos={gallery} folder="nonsense" showHomePreview={false}/>
    <div className="ch3-buy">
     <div className="ch3-title"><h1>Ulta Chashma</h1><p className="product-literal">Buildable brick glasses and display stand.</p></div>
     <div className="ch3-facts"><span>About 200 pieces</span><span>{p.buildTime}</span><span>Craft</span></div>
     <div className="ch3-description"><p className="nonsense-intro" lang="hi-Latn">{p.description}</p><p style={{marginTop:12}}>For the shelf, not for wearing.</p><p className="rm-in-box" style={{marginTop:12}}>{boxLine}</p></div>
     <div className="ch3-pricing"><div className="price-block"><span className="price-tag">{productMoney(p)}</span><small>MRP inclusive of all taxes</small></div></div>
     <StockNotice/><div className="ch3-order"><div className="quantity-row"><span>Quantity</span><Stepper value={qty} onChange={setQty}/></div><button ref={buyRef} className="button primary full" onClick={()=>ready&&add(p,qty)}>Add to bag</button></div>
     <BuyerDetails p={p}/><div ref={contactRef} className="ch3-contact"><ContactLink><WhatsAppIcon/>Ask us on WhatsApp</ContactLink></div>
    </div>
   </div>
  </section>
  <section className="nonsense-breakfast" aria-label="Ulta Chashma at breakfast">
   <figure className="nonsense-breakfast-scene"><SetPhoto image="/nonsense/gallery-04-breakfast.webp" alt="The blue Ulta Chashma brick glasses among chai, jalebi and breakfast favourites." sizes="100vw"/>
    <figcaption className="nonsense-breakfast-copy" lang="hi-Latn"><h2>Nazariya badlo, nazara badlega.</h2></figcaption>
   </figure>
   <div className="nonsense-caption"><small>An original Taksh design. Not affiliated with or endorsed by any film, television programme or brand.</small></div>
  </section><SetFilm name="nonsense-other-view" caption="Nazariya badlo, nazara badlega."/>
  {sticky&&<div className="ch3-sticky nonsense-sticky"><div><strong>Ulta Chashma</strong><span aria-hidden="true"> · </span><span>{productMoney(p)}</span></div><button className="button primary" onClick={()=>ready&&add(p,qty)}>Add to bag</button></div>}
 </div>;
}
