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

// The Sunflower Theory in one frame: day and night side by side, then what it means for people.
function SunflowerStory(){
 return <section className="sm-story" aria-labelledby="sm-story-heading"><div className="wrap">
  <h2 id="sm-story-heading" className="sm-story-title">The Sunflower Theory</h2>
  <div className="sm-split">
   <figure className="sm-half sm-half-day"><SetPhoto image="/surajmukhi/day.webp" alt="By day: the pair on a sunlit windowsill, both heads turned to the sun in the window." sizes="(max-width: 960px) 50vw, 600px"/><figcaption>By day, they follow the sun.</figcaption></figure>
   <figure className="sm-half sm-half-night"><SetPhoto image="/surajmukhi/night.webp" alt="At night: the same windowsill under a crescent moon. The two heads have turned to face each other." sizes="(max-width: 960px) 50vw, 600px"/><figcaption>At night, they turn to each other.</figcaption></figure>
  </div>
  <p className="sm-people">People are the same. We chase the light all day. When it goes dark, we turn to our person.</p>
  <p className="sm-never">That’s why you never give just one.</p>
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
