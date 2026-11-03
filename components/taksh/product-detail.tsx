'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {SetGallery} from './set-gallery';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import {useStore} from './store';
import {useStickyPurchase} from './use-sticky-purchase';
import {SiteLink} from './site-link';
import {track} from '@/lib/tracking';
import {type Product} from '@/lib/shop';
import './ram-mandir.css';
// Future catalogue entries get a complete buying page before bespoke stories are added.
export function ProductDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber]})},[p.setNumber]);
 return <div className="rm-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}><div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/sets">Sets</SiteLink><span>/</span><span>{p.name}</span></nav><div className="rm-product-layout"><SetGallery name={p.name} photos={p.gallery?.length?p.gallery:[{image:p.image||'/og.png',label:p.name,alt:p.imageAlt||p.name}]}/><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/></div></div><div className="wrap quality-points">{Object.entries(p.stories||{}).map(([key,story])=><section key={key}><h2>{story.title}</h2><p>{story.text}</p></section>)}</div>{sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}</div>;
}
