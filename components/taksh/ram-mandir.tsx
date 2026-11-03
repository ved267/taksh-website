'use client';
import {ProductPhoto} from './product-photo';
import {SiteLink} from '@/components/taksh/site-link';


import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {useStore} from './store';
import {type Product} from '@/lib/shop';
import {track} from '@/lib/tracking';
import {useStickyPurchase} from './use-sticky-purchase';
import {imageAsset,imageSrcSet} from '@/lib/images';

import {SetGallery} from './set-gallery';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import './ram-mandir.css';

type PhotoInfo={image:string;label:string;alt:string};
const asset=(name:string,small=false)=>imageAsset(`/ram-mandir/${name}.webp`,small?'thumb':'full');
const dimensions=(name:string)=>name==='gallery-08-parts-no-legend'?[2508,1969]:name==='gallery-09-dimensions'?[2508,2808]:name==='gallery-10-room'?[1536,1024]:name==='ad-sunrise-banner'?[1672,941]:[1254,1254];
const gallery:PhotoInfo[]=[
 {image:'gallery-01-hero-front',label:'The front',alt:'The brick Ram Mandir seen from the front, on its base with four lawns'},
 {image:'gallery-10-room',label:'At home',alt:'The model on a sideboard at home'},
 {image:'gallery-02-angle',label:'The south-east view',alt:'The model from the south-east, showing the three hall roofs rising to the spire'},
 {image:'gallery-03-spire-flag-closeup',label:'The spire and flag',alt:'The spire, its gold finial and the saffron flag'},
 {image:'gallery-11-spire-lifted',label:'The spire lifted',alt:'The model with the spire lifted off, showing the eight-sided sanctum'},
 {image:'gallery-04-roofs-surya-tilak-window',label:'The roofs and window',alt:'The three hall roofs with gold finials and the Surya Tilak window'},
 {image:'gallery-05-porch-stairs-plaque',label:'The entrance',alt:'The entrance porch, the stairs, the elephants and lions, and the nameplate'},
 {image:'gallery-06-wing-porch',label:'The side hall',alt:'One of the two side halls with its arches and lattice windows'},
 {image:'gallery-07-platform-lawn',label:'The platform and lawn',alt:'The carved platform, the side stairs and a lawn'},
 {image:'gallery-09-dimensions',label:'The dimensions',alt:"The model's size: 38 cm wide, 34 cm deep, 26 cm tall"},
];
const guide:PhotoInfo={image:'gallery-08-parts-no-legend',label:'Walk in from the east',alt:'The brick temple with twelve numbered parts.'};

function Photo({image,alt,eager=false,large=false,sizes}:{image:string;alt:string;eager?:boolean;large?:boolean;sizes?:string}){
 const [width,height]=dimensions(image);
 return <ProductPhoto eager={eager} src={asset(image)} srcSet={imageSrcSet(`/ram-mandir/${image}.webp`)} sizes={sizes??(large?'100vw':'(max-width: 960px) 100vw, 60vw')} width={width} height={height} alt={alt} fetchPriority={eager?'high':'auto'} decoding="async" draggable={false}/>;
}

function WalkGuide(){
 return <section className="rm-section rm-walk" aria-labelledby="rm-walk-heading"><div className="wrap">
  <div className="rm-section-intro"><h2 id="rm-walk-heading">Walk in from the east.</h2><p>The temple’s entrance faces east, towards the rising sun. Climb the steps and explore the temple, getting to know each part along the way.</p></div>
  <figure className="rm-parts-image"><Photo image={guide.image} alt={guide.alt} sizes="(max-width: 900px) calc(100vw - 40px), 860px"/></figure>
  <details className="parts-disclosure"><summary>Explore the 12 parts</summary><ol className="rm-parts-legend">{[
   ['Dharma Dhwaj','The saffron flag of dharma'],['Shikhara','The spire over the sanctum'],['Surya Tilak window','A mirror tile above the sanctum'],['Sabha Mandap','The tallest hall, before the sanctum'],['Rang Mandap','The gathering hall'],['Nritya Mandap','The dance hall, at the entrance'],['Side halls','One for prayer, one for song'],['Singh Dwar','The Lion Gate, facing east'],['Main stairs','32 steps on the real temple'],['Elephants and lions','Guardians beside the stairs'],['Platform','The raised base, with carved panels'],['Lawns','Four lawns around the temple'],
  ].map(([name,job],i)=><li key={name}><span className="rm-part-number" aria-hidden="true">{i+1}</span><div><strong>{name}</strong><p>{job}</p></div></li>)}</ol></details>
 </div></section>;
}

export function RamMandirDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);const {add,ready}=useStore();
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 return <div className="rm-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Ram Mandir</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery.map(photo=>({...photo,image:`/ram-mandir/${photo.image}.webp`}))} name="Ram Mandir"/><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/></div>
  </div>
  <section className="rm-section rm-stone" aria-labelledby="rm-stone-heading"><div className="wrap">
   <h2 id="rm-stone-heading">Different blocks. The same idea.</h2>
   <p className="rm-stone-intro">In Ayodhya, the Ram Mandir was built without steel in its structure. Stone blocks were shaped to fit one another. Your set follows the same idea: each piece joins the next, and slowly, a temple takes shape in your hands.</p>
   <div className="rm-stone-pair"><figure><Photo image="story-01-stone-lock" alt="Two sandstone blocks, one above the other. A ridge on the lower block fits a groove in the upper block." sizes="(max-width: 760px) 45vw, 320px"/><figcaption>The temple</figcaption></figure><figure><Photo image="story-03-brick-lock" alt="Two tan building bricks, one above the other, with round studs on top." sizes="(max-width: 760px) 45vw, 320px"/><figcaption>Your set</figcaption></figure></div>
  </div></section>
  <WalkGuide/>
  <section className="rm-section rm-sun" aria-labelledby="rm-sun-heading"><div className="wrap rm-sun-layout">
   <figure><Photo image="gallery-04-roofs-surya-tilak-window" alt={gallery.find(photo=>photo.image==='gallery-04-roofs-surya-tilak-window')!.alt} sizes="(max-width: 760px) calc(100vw - 40px), 46vw"/></figure>
   <div><h2 id="rm-sun-heading">Ram Lalla’s tilak.</h2><p>At noon on Ram Navami, sunlight enters through an opening on the temple’s top floor. Mirrors send the light down to Ram Lalla’s forehead, where it rests for about three minutes. This is the Surya Tilak.</p><p>A mirror tile on your model’s third roof, just above the sanctum, is a reminder of that moment.</p></div>
  </div></section>
  <section className="rm-history rm-section" aria-labelledby="rm-history-heading"><div className="wrap">
   <h2 id="rm-history-heading">Thirty-five years<br/>from drawing to flag.</h2>
    <div className="rm-timeline-layout"><ol className="rm-timeline">{[
     ['Around 1990','Architect Chandrakant Sompura visits the site. No instruments are allowed, so he measures the ground in footsteps.'],['5 August 2020','Ground-breaking.'],['22 January 2024','The temple is consecrated.'],['25 November 2025','The saffron flag is raised on the spire and the temple is declared complete.'],
    ].map(([date,text])=><li key={date}><span>{date}</span><p>{text}</p></li>)}</ol><p className="rm-family-note">The Sompura family has designed temples for 15 generations.</p></div>
  </div></section>
  <figure className="rm-quote"><Photo image="ad-sunrise-banner" alt="The Ram Mandir model in a sunrise scene, with the nameplate verse: Mother and motherland are greater than even heaven." large/></figure>
  <section className="wrap rm-specs" aria-labelledby="rm-size-heading"><h2 id="rm-size-heading">Size and space.</h2><dl><div><dt>Width</dt><dd>About 38 cm</dd></div><div><dt>Depth</dt><dd>About 34 cm</dd></div><div><dt>Height with the flag</dt><dd>About 26 cm</dd></div></dl><div className="rm-real-temple"><p>It needs a shelf 40 cm wide and 35 cm deep.</p><p>The real temple: 380 ft long, 250 ft wide, 161 ft tall, with 392 carved pillars. Nagara style. Entrance in the east.</p></div><p className="rm-disclaimer">A simplified brick model inspired by the Ram Mandir in Ayodhya. It is not an exact scale replica and is not made by, affiliated with or endorsed by the Shri Ram Janmabhoomi Teerth Kshetra Trust.</p></section>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
