'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {SiteLink} from './site-link';
import {SetGallery,SetPhoto,type PhotoInfo} from './set-gallery';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import {useStickyPurchase} from './use-sticky-purchase';
import {useStore} from './store';
import {track} from '@/lib/tracking';
import {type Product} from '@/lib/shop';
import './ram-mandir.css';
import './surajmukhi.css';
import {SetFilm} from './set-film';

const gallery:PhotoInfo[]=[
 {image:'/surajmukhi/gallery-03-at-home.webp',label:'At home',alt:'The pair in a glass bottle on a bedside table at golden hour, beside a folded note. Their shadows lean together on the wall.'},
 {image:'/surajmukhi/gallery-01-hero.webp',label:'Surajmukhi',alt:'Two brick sunflowers with crossed stems, their heads turned towards each other.'},
 {image:'/surajmukhi/gallery-04-back.webp',label:'From behind',alt:'The pair from behind: the green back of each head sits on a round joint at the top of its stem, and the stems cross.'},
 {image:'/surajmukhi/gallery-02-heads.webp',label:'Up close',alt:'The two heads up close: dark brown stud centres ringed in yellow, with pointed yellow and orange petals.'},
 {image:'/surajmukhi/gallery-05-joining.webp',label:'The click',alt:'One head about to click onto the top of its stem.'},
 {image:'/surajmukhi/gallery-06-building.webp',label:'Half built',alt:'Two flowers half built on a wooden table, with small piles of petals, stem pieces, leaves and studs sorted by colour.'},
];

const beats=[
 {id:'day',line:'By day, a sunflower lives on the sun.',image:'/surajmukhi/day.webp',alt:'The pair in a glass bottle on a sunlit windowsill, both heads turned to the morning sun in the window.'},
 {id:'night',line:'When the dark comes, they turn to each other. For warmth. For light.',image:'/surajmukhi/night.webp',alt:'The same windowsill at night under a crescent moon. The two heads have turned to face each other.'},
 {id:'home',line:'Alone, a sunflower fades. Together, they make it to morning.',image:'/surajmukhi/banner-at-home.webp',alt:'The pair at golden hour on a bedside table. On the wall, their two shadows lean together and nearly touch.'},
] as const;

// One story, told as you scroll: the picture and the section's light pass from day to night to home.
function SunflowerStory(){
 const [active,setActive]=useState(0);const refs=useRef<(HTMLDivElement|null)[]>([]);
 useEffect(()=>{const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(Number((e.target as HTMLElement).dataset.i))},{rootMargin:'-45% 0px -45% 0px'});refs.current.forEach(el=>el&&io.observe(el));return()=>io.disconnect()},[]);
 return <section className="sm-story" data-tone={beats[active].id} aria-labelledby="sm-story-heading"><div className="wrap sm-story-inner">
  <div className="sm-story-text"><h2 id="sm-story-heading" className="sm-story-title">The Sunflower Theory</h2>
   {beats.map((b,i)=><div key={b.id} ref={el=>{refs.current[i]=el}} data-i={i} className={i===active?'sm-beat is-on':'sm-beat'}>
    <figure className="sm-beat-photo"><SetPhoto image={b.image} alt={b.alt} sizes="calc(100vw - 40px)"/>{i===0&&<SetFilm name="surajmukhi-theory" caption="The Sunflower Theory."/>}</figure>
    <p>{b.line}</p></div>)}
   <p className="sm-never">That’s why you never give just one.</p>
  </div>
  <div className="sm-story-stage"><div aria-hidden="true">{beats.map((b,i)=><figure key={b.id} className={i===active?'is-on':''}><SetPhoto image={b.image} alt="" sizes="(max-width: 1200px) 55vw, 700px"/></figure>)}</div><SetFilm name="surajmukhi-theory" caption="The Sunflower Theory."/></div>
 </div></section>;
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
  <SunflowerStory/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
