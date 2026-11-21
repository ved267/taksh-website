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

const gallery:PhotoInfo[]=[
 {image:'/surajmukhi/gallery-01-hero.webp',label:'Surajmukhi',alt:'Two brick sunflowers with crossed stems, their heads turned towards each other.'},
 {image:'/surajmukhi/gallery-04-back.webp',label:'From behind',alt:'The pair from behind: the green back of each head sits on a round joint at the top of its stem, and the stems cross.'},
 {image:'/surajmukhi/gallery-02-heads.webp',label:'Up close',alt:'The two heads up close: dark brown stud centres ringed in yellow, with pointed yellow and orange petals.'},
 {image:'/surajmukhi/gallery-05-joining.webp',label:'The click',alt:'One head about to click onto the top of its stem.'},
 {image:'/surajmukhi/gallery-06-building.webp',label:'Half built',alt:'Two flowers half built on a wooden table, with small piles of petals, stem pieces, leaves and studs sorted by colour.'},
 {image:'/surajmukhi/gallery-03-at-home.webp',label:'At home',alt:'The pair in a glass bottle on a bedside table at golden hour, beside a folded note. Their shadows lean together on the wall.'},
];

// The Sunflower Theory in one frame, in the same words as the reel: day and night side by side, then what it means for people.
function SunflowerStory(){
 return <section className="sm-story" aria-labelledby="sm-story-heading"><div className="wrap">
  <p className="sm-kicker">The Sunflower Theory</p>
  <h2 id="sm-story-heading" className="sm-story-title">Sunflowers have a secret. They only share it after dark.</h2>
  <div className="sm-split">
   <figure className="sm-half sm-half-day"><SetPhoto image="/surajmukhi/day.webp" alt="By day: the pair on a sunlit windowsill, both heads turned to the sun in the window." sizes="(max-width: 960px) 50vw, 460px"/><figcaption>All day, a sunflower follows the sun.</figcaption></figure>
   <figure className="sm-half sm-half-night"><SetPhoto image="/surajmukhi/night.webp" alt="After dark: the same windowsill under a crescent moon. The two heads have turned to face each other." sizes="(max-width: 960px) 50vw, 460px"/><figcaption>After dark, they turn to each other.</figcaption></figure>
  </div>
  <p className="sm-together">Alone, one would fade. Together, they keep each other warm till morning.</p>
  <div className="sm-people">
   <p>People are the same. We all need someone who’s our warmth when the day is done. Not just on the hard days. On every ordinary evening.</p>
   <p>Someone you turn to. Someone who turns to you.</p>
  </div>
  <p className="sm-never">Who’s yours?</p>
  <p className="sm-gift">One for you. One for them.</p>
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
