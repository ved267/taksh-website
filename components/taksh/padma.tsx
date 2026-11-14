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
import './padma.css';

const gallery:PhotoInfo[]=[
 {image:'/padma/gallery-01-hero.webp',label:'Padma',alt:'Three pink and white brick lotuses at three heights, standing on a round gold lotus base.'},
 {image:'/padma/gallery-04-at-home.webp',label:'At home',alt:'The set on a teak side table beside reading glasses on a book and a brass bowl, in morning light.'},
 {image:'/padma/gallery-02-heart.webp',label:'The heart',alt:'One brick lotus up close: white inner petals, a yellow seed pod and a ring of yellow stamens.'},
 {image:'/padma/gallery-03-gold-seat.webp',label:'The gold seat',alt:'The round gold base with lotus-petal sides and three green stems.'},
 {image:'/padma/gallery-06-size.webp',label:'Size',alt:'The set is about 28 cm tall and 19 cm wide.'},
];

const days=[
 {id:'day-1',tab:'Day 1',tone:'dawn',line:'It opens at dawn, only halfway.',alt:'A real pink lotus, half open, in a misty pond at dawn.'},
 {id:'day-2',tab:'Day 2',tone:'morning',line:'It opens fully.',alt:'The same lotus fully open in morning light, its yellow centre showing.'},
 {id:'day-3',tab:'Day 3',tone:'afternoon',line:'It opens wide one last time.',alt:'The same lotus opened wide in afternoon light.'},
 {id:'day-4',tab:'Day 4',tone:'dusk',line:'The petals fall. Only the seed pod stays.',alt:'At dusk only the green seed pod stands; pink petals lie on the leaves and water.'},
 {id:'day-yours',tab:'Yours',tone:'yours',line:'Yours stays in bloom.',alt:'The brick Padma set, three open lotuses on a gold base.'},
] as const;

function ThreeDays({onAdd,price}:{onAdd:()=>void;price:string}){
 const images=days.map(d=>`/padma/${d.id}.webp`);
 const {index,resolvedSrc,status,change,warm}=useGallerySelection(images,'(max-width: 760px) calc(100vw - 40px), 760px');
 const buttons=useRef<(HTMLButtonElement|null)[]>([]),section=useRef<HTMLElement>(null),fns=useRef({change,warm});
 useEffect(()=>{fns.current={change,warm}});
 const [auto,setAuto]=useState(false),[touched,setTouched]=useState(false);
 const day=days[index],playing=auto&&!touched&&index<days.length-1;
 // Plays the four days once, ending on Yours, when the section is first in view; any tap or key stops it.
 useEffect(()=>{const el=section.current;if(!el||touched||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){io.disconnect();setAuto(true)}},{threshold:.6});io.observe(el);return()=>io.disconnect()},[touched]);
 useEffect(()=>{if(!playing)return;void fns.current.warm(index+1);const t=setTimeout(()=>{void fns.current.change(index+1)},index?2200:1400);return()=>clearTimeout(t)},[playing,index]);
 function onKey(e:KeyboardEvent){
  setTouched(true);
  const current=buttons.current.indexOf(document.activeElement as HTMLButtonElement);if(current<0)return;
  let next=current;const n=days.length;
  if(e.key==='ArrowRight')next=(current+1)%n;else if(e.key==='ArrowLeft')next=(current+n-1)%n;else return;
  e.preventDefault();buttons.current[next]?.focus({preventScroll:true});void change(next);
 }
 return <section ref={section} className="pd-days" data-tone={day.tone} aria-labelledby="pd-days-heading"><div className="wrap pd-days-inner">
  <div className="pd-days-side"><h2 id="pd-days-heading" className="pd-days-copy">A real lotus lasts about three days. This one stays.</h2>
  <div className="pd-day-tabs" role="group" aria-label="Choose a day" onKeyDown={onKey}>{days.map((d,i)=><button key={d.id} ref={el=>{buttons.current[i]=el}} aria-pressed={index===i} onClick={()=>{setTouched(true);void change(i)}} className={d.id==='day-yours'?'pd-yours':''}>{d.tab}</button>)}</div>
  <p className="pd-day-line" aria-live={playing?'off':'polite'}>{day.line}</p>{day.id==='day-yours'&&<button className="button primary pd-day-cta" onClick={onAdd}>Bring one home · {price}</button>}</div>
  <figure className="pd-days-stage" aria-busy={status==='loading'}>
   <SetPhoto key={day.id} image={images[index]} alt={day.alt} resolvedSrc={resolvedSrc} sizes="(max-width: 760px) calc(100vw - 40px), 760px"/>
   <GalleryStatus status={status}/>
  </figure>
 </div></section>;
}

function LotusLeaf({onAdd}:{onAdd:()=>void}){
 return <section className="pd-mud" aria-labelledby="pd-mud-heading">
  <div className="pd-mud-banner"><SetPhoto image="/padma/banner-born-of-mud.webp" alt="A pink lotus rising clean from a muddy pond at sunrise." sizes="100vw"/>
   <div className="pd-mud-copy"><p className="pd-verse" lang="sa">पद्मपत्रमिवाम्भसा</p><h2 id="pd-mud-heading">Like a lotus leaf on water.</h2><p>Live fully in the world, and let nothing cling to you.</p><p className="pd-cite">Bhagavad Gita 5.10</p><p className="pd-keep">Keep one where you see it every day.</p><button className="button primary pd-mud-cta" onClick={onAdd}>Add to bag</button></div>
  </div>
 </section>;
}

export function PadmaDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page pd-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Padma</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name="Padma"/>
    <div className="pd-buy-column"><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/><p className="pd-preview-note">Images are design previews; sizes are estimates.</p></div>
   </div>
  </div>
  <ThreeDays price={productMoney(p)} onAdd={()=>ready&&add(p,qty)}/>
  <LotusLeaf onAdd={()=>ready&&add(p,qty)}/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
