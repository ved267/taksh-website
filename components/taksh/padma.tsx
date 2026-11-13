'use client';
import {useEffect,useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import {SiteLink} from './site-link';
import {SetGallery,SetPhoto,GalleryStatus,type PhotoInfo} from './set-gallery';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import {useGallerySelection} from './use-gallery-selection';
import {useStickyPurchase} from './use-sticky-purchase';
import {useStore} from './store';
import {track} from '@/lib/tracking';
import {type Product} from '@/lib/shop';
import './ram-mandir.css';
import './padma.css';

const gallery:PhotoInfo[]=[
 {image:'/padma/gallery-01-hero.webp',label:'Padma',alt:'Three pink and white brick lotuses at three heights, standing on a round gold lotus base.'},
 {image:'/padma/gallery-04-at-home.webp',label:'At home',alt:'The set on a teak side table beside reading glasses on a book and a brass bowl, in morning light.'},
 {image:'/padma/gallery-02-heart.webp',label:'The heart',alt:'One brick lotus up close: white inner petals, a yellow seed pod and a ring of yellow stamens.'},
 {image:'/padma/gallery-03-gold-seat.webp',label:'The gold seat',alt:'The round gold base with lotus-petal sides and three green stems.'},
 {image:'/padma/gallery-05-gift.webp',label:'A gift',alt:'The set beside an open gift box and a handwritten card that reads Dadi ke liye.'},
 {image:'/padma/gallery-06-size.webp',label:'Size',alt:'The set is about 28 cm tall and 19 cm wide.'},
];

const days=[
 {id:'day-1',tab:'Day 1',tone:'dawn',line:'It opens at dawn, only halfway, and closes again by afternoon.',alt:'A real pink lotus, half open, in a misty pond at dawn.'},
 {id:'day-2',tab:'Day 2',tone:'morning',line:'It opens fully. The yellow seed pod and its ring of stamens show.',alt:'The same lotus fully open in morning light, its yellow centre showing.'},
 {id:'day-3',tab:'Day 3',tone:'afternoon',line:'It opens wide one last time.',alt:'The same lotus opened wide in golden afternoon light, its stamens drying.'},
 {id:'day-4',tab:'Day 4',tone:'dusk',line:'The petals fall. Only the seed pod stays.',alt:'At dusk only the green seed pod stands; pink petals lie on the leaves and water.'},
 {id:'day-yours',tab:'Yours',tone:'yours',line:'Yours stays. Close it for the night if you like.',alt:'The brick Padma set, three open lotuses on a gold base.'},
] as const;

function ThreeDays(){
 const images=days.map(d=>`/padma/${d.id}.webp`);
 const {index,resolvedSrc,status,change,warm}=useGallerySelection(images,'(max-width: 760px) calc(100vw - 40px), 760px');
 const buttons=useRef<(HTMLButtonElement|null)[]>([]);
 const day=days[index];
 function onKey(e:KeyboardEvent){
  const current=buttons.current.indexOf(document.activeElement as HTMLButtonElement);if(current<0)return;
  let next=current;const n=days.length;
  if(e.key==='ArrowRight')next=(current+1)%n;else if(e.key==='ArrowLeft')next=(current+n-1)%n;else if(e.key==='Home')next=0;else if(e.key==='End')next=n-1;else return;
  e.preventDefault();buttons.current[next]?.focus({preventScroll:true});void change(next);
 }
 return <section className="pd-days" data-tone={day.tone} aria-labelledby="pd-days-heading"><div className="wrap pd-days-inner">
  <div className="pd-days-copy">
   <h2 id="pd-days-heading">A lotus lasts about three days.</h2>
   <p>A real lotus opens with the sun and closes by afternoon. On the fourth day its petals fall.</p>
  </div>
  <figure className="pd-days-stage" aria-busy={status==='loading'}>
   <SetPhoto key={day.id} image={images[index]} alt={day.alt} resolvedSrc={resolvedSrc} sizes="(max-width: 760px) calc(100vw - 40px), 760px"/>
   <GalleryStatus status={status}/>
  </figure>
  <div className="pd-day-tabs" role="group" aria-label="Choose a day" onKeyDown={onKey}>{days.map((d,i)=><button key={d.id} ref={el=>{buttons.current[i]=el}} aria-pressed={index===i} onPointerEnter={()=>{void warm(i)}} onFocus={()=>{void warm(i)}} onClick={()=>{void change(i)}} className={d.id==='day-yours'?'pd-yours':''}>{d.tab}</button>)}</div>
  <p className="pd-day-line" aria-live="polite">{day.line}</p>
 </div></section>;
}

function BornOfMud(){
 return <section className="pd-mud" aria-labelledby="pd-mud-heading">
  <div className="pd-mud-banner"><SetPhoto image="/padma/banner-born-of-mud.webp" alt="A pink lotus rising clean out of a dark, muddy pond at sunrise, water beading on a leaf beside it." sizes="100vw"/>
   <div className="pd-mud-copy"><h2 id="pd-mud-heading"><span lang="hi-Latn">Pankaj</span> means born of mud.</h2><p>The lotus roots in the mud at the bottom of a pond and rises clean. The Gita and Guru Nanak both use it for a life lived in the world, untouched by it.</p></div>
  </div>
 </section>;
}

const names=[
 ['Pankaj','Born of mud.'],['Neeraj','Born of water.'],['Saroj','Born of a lake.'],['Jalaj','Born of water.'],['Ambuj','Born of water.'],['Arvind','The lotus.'],
 ['Kamal','The lotus.'],['Kamala','Of the lotus. A name of Lakshmi.'],['Padma','The lotus. A name of Lakshmi.'],['Padmini','Full of lotuses.'],['Nalini','The lotus.'],
] as const;

function FamilyNames({onAdd,ready}:{onAdd:()=>void;ready:boolean}){
 const [picked,setPicked]=useState<number|null>(0);
 return <section className="rm-section pd-family" aria-labelledby="pd-family-heading"><div className="wrap pd-family-layout">
  <div className="pd-family-copy">
   <h2 id="pd-family-heading">Is there a lotus in your family?</h2>
   <p className="pd-family-intro">Many Indian names mean lotus. Tap one to see what it means.</p>
   <div className="pd-names" role="group" aria-label="Names that mean lotus">{names.map(([name],i)=><button key={name} lang="hi-Latn" aria-pressed={picked===i} onClick={()=>setPicked(picked===i?null:i)}>{name}</button>)}</div>
   <p className="pd-name-meaning" aria-live="polite">{picked===null?' ':<><strong lang="hi-Latn">{names[picked][0]}:</strong> {names[picked][1]}</>}</p>
   <div className="pd-honour"><p>India’s Padma awards are named after the lotus. Give one at home.</p><button className="button primary" onClick={()=>ready&&onAdd()}>Add to bag</button></div>
  </div>
 </div></section>;
}

export function PadmaDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page pd-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Padma</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name="Padma"/>
    <div className="pd-buy-column"><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/><p className="pd-preview-note">Images are design previews.</p></div>
   </div>
  </div>
  <ThreeDays/>
  <BornOfMud/>
  <FamilyNames ready={ready} onAdd={()=>add(p,1)}/>
  <section className="wrap rm-specs" aria-labelledby="pd-size-heading"><h2 id="pd-size-heading">Size and space.</h2><dl><div><dt>Height</dt><dd>About 28 cm</dd></div><div><dt>Width</dt><dd>About 19 cm</dd></div><div><dt>Base</dt><dd>About 13 cm across</dd></div></dl><div className="rm-real-temple"><p>It fits a side table, a mandir shelf or a windowsill.</p></div><p className="rm-disclaimer">An original Taksh design. Images are design previews; sizes are estimates until the final model is checked.</p></section>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
