'use client';
import {useEffect,useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import {SiteLink} from './site-link';
import {SetGallery,SetPhoto,GalleryStatus,type PhotoInfo} from './set-gallery';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import {useGallerySelection} from './use-gallery-selection';
import {useStickyPurchase} from './use-sticky-purchase';
import {useStore} from './store';
import {track} from '@/lib/tracking';
import {productMoney,type Product} from '@/lib/shop';
import './ram-mandir.css';
import './surajmukhi.css';

const gallery:PhotoInfo[]=[
 {image:'/surajmukhi/gallery-01-hero.webp',label:'Surajmukhi',alt:'Two brick sunflowers with crossed stems, their heads turned towards each other.'},
 {image:'/surajmukhi/gallery-02-heads.webp',label:'Up close',alt:'The two heads up close: dark brown stud centres ringed in yellow, with pointed yellow and orange petals.'},
 {image:'/surajmukhi/gallery-03-at-home.webp',label:'At home',alt:'The pair in a glass bottle on a bedside table at golden hour, beside a folded note. Their shadows lean together on the wall.'},
];

const moments=[
 {id:'day',tab:'Day',line:'By day, sunflowers face the sun.',alt:'The pair in a glass bottle on a sunlit windowsill, both heads turned to the morning sun in the window.'},
 {id:'night',tab:'Night',line:'When the sun goes down, they turn to each other and keep each other warm till morning.',alt:'The same windowsill at night under a crescent moon. The two heads have turned to face each other.'},
] as const;
const nightLine='It’s night where you are. They’ve turned to each other, and will keep each other warm till morning.';
const isNightNow=()=>{const h=new Date().getHours();return h>=19||h<6};

function SunflowerTheory({onAdd,price}:{onAdd:()=>void;price:string}){
 const images=moments.map(m=>`/surajmukhi/${m.id}.webp`);
 const {index,resolvedSrc,status,change,warm}=useGallerySelection(images,'(max-width: 760px) calc(100vw - 40px), 760px');
 const buttons=useRef<(HTMLButtonElement|null)[]>([]),section=useRef<HTMLElement>(null),fns=useRef({change,warm});
 useEffect(()=>{fns.current={change,warm}});
 const [touched,setTouched]=useState(false),[nightNow,setNightNow]=useState(false);
 const moment=moments[index],night=moment.id==='night';
 // After dark the section opens on Night; by day it turns to Night once when first in view. Any tap or key stops it.
 useEffect(()=>{if(!isNightNow())return;const id=requestAnimationFrame(()=>{setNightNow(true);void fns.current.change(1)});return()=>cancelAnimationFrame(id)},[]);
 useEffect(()=>{const el=section.current;if(!el||touched||nightNow||matchMedia('(prefers-reduced-motion: reduce)').matches)return;let t:ReturnType<typeof setTimeout>|undefined;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){io.disconnect();void fns.current.warm(1);t=setTimeout(()=>{void fns.current.change(1)},2400)}},{threshold:.6});io.observe(el);return()=>{io.disconnect();if(t)clearTimeout(t)}},[touched,nightNow]);
 function onKey(e:KeyboardEvent){
  setTouched(true);
  const current=buttons.current.indexOf(document.activeElement as HTMLButtonElement);if(current<0)return;
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
  e.preventDefault();const next=current?0:1;buttons.current[next]?.focus({preventScroll:true});void change(next);
 }
 return <section ref={section} className="sm-theory" data-tone={moment.id} aria-labelledby="sm-theory-heading"><div className="wrap sm-theory-inner">
  <div className="sm-theory-side"><h2 id="sm-theory-heading" className="sm-theory-copy">The Sunflower Theory</h2>
   <div className="sm-tabs" role="group" aria-label="Day or night" onKeyDown={onKey}>{moments.map((m,i)=><button key={m.id} ref={el=>{buttons.current[i]=el}} aria-pressed={index===i} onClick={()=>{setTouched(true);void change(i)}}>{m.tab}</button>)}</div>
   <p className="sm-line" aria-live={touched?'polite':'off'}>{night&&nightNow?nightLine:moment.line}</p>
   <div className={night?'sm-close is-on':'sm-close'} aria-hidden={!night}><p className="sm-never">That’s why you never give just one.</p><button className="button primary sm-cta" onClick={onAdd}>Bring them home · {price}</button><p className="sm-footnote">A theory, not botany.</p></div>
  </div>
  <figure className="sm-stage" aria-busy={status==='loading'}>
   <SetPhoto key={moment.id} image={images[index]} alt={moment.alt} resolvedSrc={resolvedSrc} sizes="(max-width: 760px) calc(100vw - 40px), 760px"/>
   <GalleryStatus status={status}/>
  </figure>
 </div></section>;
}

function KeepsYouWarm({onAdd}:{onAdd:()=>void}){
 return <section className="sm-warm" aria-labelledby="sm-warm-heading">
  <div className="sm-warm-banner"><SetPhoto image="/surajmukhi/banner-at-home.webp" alt="The pair in a glass bottle on a bedside table at golden hour, beside a folded note. On the wall, their two shadows lean together and nearly touch." sizes="100vw"/>
   <div className="sm-warm-copy"><h2 id="sm-warm-heading">For the one who keeps you warm.</h2><button className="button primary sm-warm-cta" onClick={onAdd}>Add to bag</button></div>
  </div>
 </section>;
}

export function SurajmukhiDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page sm-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Surajmukhi</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name="Surajmukhi"/>
    <div className="sm-buy-column"><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/><p className="sm-preview-note">Images are design previews; sizes are estimates.</p></div>
   </div>
  </div>
  <SunflowerTheory price={productMoney(p)} onAdd={()=>ready&&add(p,qty)}/>
  <KeepsYouWarm onAdd={()=>ready&&add(p,qty)}/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
