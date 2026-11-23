'use client';
import {useEffect,useRef,useState,type CSSProperties,type FormEvent} from 'react';
import {SiteLink} from './site-link';
import {SetGallery,SetPhoto,type PhotoInfo} from './set-gallery';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import {useStickyPurchase} from './use-sticky-purchase';
import {useStore} from './store';
import {track} from '@/lib/tracking';
import {productMoney,type Product} from '@/lib/shop';
import './ram-mandir.css';
import './kamdhenu.css';

const gallery:PhotoInfo[]=[
 {image:'/kamdhenu/gallery-01-hero.webp',label:'Kamdhenu',alt:'A white brick cow with a dark red saddle cloth, an orange cap between gold horns and a bell at her neck, one front hoof raised, beside a reddish brown post on a tan studded base.'},
 {image:'/kamdhenu/gallery-02-mandir.webp',label:'In the mandir',alt:'The set on a marble ledge in a carved wooden mandir, beside a lit brass diya and marigolds.'},
 {image:'/kamdhenu/gallery-03-new-home.webp',label:'A new home',alt:'The set on a wooden console by a doorway hung with a mango-leaf and marigold toran, a rangoli on the floor.'},
 {image:'/kamdhenu/gallery-04-childs-room.webp',label:'A child’s room',alt:'The set on a white shelf in a child’s room, under a child’s drawing of a cow, beside books and a plant.'},
 {image:'/kamdhenu/gallery-05-head.webp',label:'Up close',alt:'Her head up close: pink ears, an orange cap between gold horns, a gold necklace and a bell. Beside her, the rope coiled on her post.'},
 {image:'/kamdhenu/gallery-06-size.webp',label:'Size',alt:'The set with dimension lines: about 32 cm long and about 23 cm tall.'},
];

// The name, split in two as it comes into view, then a wish that is folded and given to her.
// The wish never leaves the page: it is not sent, saved or tracked.
function WishSection(){
 const ref=useRef<HTMLElement>(null),input=useRef<HTMLInputElement>(null),again=useRef<HTMLButtonElement>(null);
 const [split,setSplit]=useState<'open'|'joined'>('open');
 const [wish,setWish]=useState('');const [stage,setStage]=useState<'idle'|'giving'|'kept'>('idle');
 useEffect(()=>{
  const node=ref.current;if(!node||!('IntersectionObserver' in window))return;
  setSplit('joined');let timer=0;
  const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){timer=window.setTimeout(()=>setSplit('open'),350);io.disconnect()}},{threshold:.45});
  io.observe(node);return()=>{io.disconnect();clearTimeout(timer)};
 },[]);
 useEffect(()=>{
  if(stage!=='giving')return;
  const still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timer=window.setTimeout(()=>setStage('kept'),still?0:1900);return()=>clearTimeout(timer);
 },[stage]);
 useEffect(()=>{if(stage==='kept')again.current?.focus()},[stage]);
 function give(e:FormEvent){e.preventDefault();if(wish.trim())setStage('giving');else input.current?.focus()}
 function another(){setWish('');setStage('idle');requestAnimationFrame(()=>input.current?.focus())}
 return <section ref={ref} className="kd-wish" data-split={split} aria-labelledby="kd-wish-heading">
  <div className="wrap kd-wish-inner">
   <h2 id="kd-wish-heading" className="sr-only">What Kamdhenu means</h2>
   <div className="kd-word">
    <div className="kd-part" lang="sa"><span className="kd-deva">काम</span><span className="kd-roman">Kāma</span><span className="kd-gloss">a wish</span></div>
    <span className="kd-plus" aria-hidden="true">+</span>
    <div className="kd-part" lang="sa"><span className="kd-deva">धेनु</span><span className="kd-roman">Dhenu</span><span className="kd-gloss">the cow who gives</span></div>
   </div>
   <div className="kd-give" data-stage={stage}>
    {stage==='idle'&&<form className="kd-form" onSubmit={give}>
     <h3><label htmlFor="kd-wish-input">Make a wish.</label></h3>
     <div className="kd-field"><input ref={input} id="kd-wish-input" value={wish} onChange={e=>setWish(e.target.value)} maxLength={80} placeholder="I wish…" autoComplete="off" enterKeyHint="send"/><button className="button primary">Give it to her</button></div>
     <p className="kd-private">Only you see it. Nothing is sent or saved.</p>
    </form>}
    {stage==='giving'&&<div className="kd-slip-stage" aria-hidden="true"><p className="kd-slip">{wish}</p><span className="kd-glow"/></div>}
    <div className="kd-kept" aria-live="polite">{stage==='kept'&&<><h3>She has your wish.</h3><p>Now build towards it.</p><button ref={again} className="kd-again" onClick={another}>Make another wish</button></>}</div>
   </div>
  </div>
 </section>;
}

// Points sit on the hero photo, cropped to the cow (x 60–1540, y 260–1360 of 1600).
const parts=[
 {id:'horns',name:'Her horns',line:'Brahma, Vishnu and Shiva.',x:32.2,y:7.3},
 {id:'eyes',name:'Her eyes',line:'The sun and the moon.',x:25.9,y:22.7},
 {id:'legs',name:'Her four legs',line:'The four Vedas.',x:37.2,y:75.5},
 {id:'milk',name:'Her milk',line:'Curd, butter, and the ghee that lights the diya.',x:77,y:56.4},
 {id:'ground',name:'The ground she stands on',line:'Village floors are plastered with her gobar. Lakshmi, it is said, lives in it.',x:23,y:87.6},
] as const;

function HolySection(){
 const [active,setActive]=useState(0);const part=parts[active];
 return <section className="kd-holy" aria-labelledby="kd-holy-heading"><div className="wrap kd-holy-inner">
  <div className="kd-holy-photo">
   <div className="kd-crop"><SetPhoto image="/kamdhenu/gallery-01-hero.webp" alt="" sizes="(max-width: 960px) calc(100vw - 40px), 760px"/></div>
   {parts.map((p,i)=><button key={p.id} type="button" tabIndex={-1} aria-hidden="true" className={i===active?'kd-dot is-on':'kd-dot'} style={{left:`${p.x}%`,top:`${p.y}%`}} onClick={()=>setActive(i)}><span/></button>)}
  </div>
  <div className="kd-holy-copy">
   <h2 id="kd-holy-heading">Every part of her is holy.</h2>
   <p className="kd-holy-intro">It is believed every god lives in her.</p>
   <div className="kd-chips" role="group" aria-label="Parts of Kamdhenu">{parts.map((p,i)=><button key={p.id} type="button" aria-pressed={i===active} onClick={()=>setActive(i)}>{p.name}</button>)}</div>
   <div className="kd-caption" aria-live="polite"><p className="kd-caption-name">{part.name}</p><p className="kd-caption-line" key={part.id}>{part.line}</p></div>
  </div>
 </div></section>;
}

const homes=[['A new home','At a griha pravesh, a cow steps in first.'],['A child’s room','The first roti of the day is hers. Give first.'],['The mandir','Beside the diya, one wish every morning.']] as const;

function PlentySection({onAdd,price}:{onAdd:()=>void;price:string}){
 return <section className="kd-plenty" aria-labelledby="kd-plenty-heading">
  <div className="kd-plenty-banner"><SetPhoto image="/kamdhenu/banner-pichwai.webp" alt="A painting in the Pichwai style: white cows in red saddle cloths walk with their calves through a green forest towards a lotus pond." sizes="100vw"/></div>
  <div className="kd-plenty-copy"><h2 id="kd-plenty-heading">She brings plenty home.</h2>
   <ul className="kd-homes">{homes.map(([where,line])=><li key={where}><b>{where}</b><span>{line}</span></li>)}</ul>
   <p className="kd-builds">What you build, builds you.</p>
   <button className="button primary kd-plenty-cta" onClick={onAdd}>Bring her home · {price}</button>
  </div>
 </section>;
}

export function KamdhenuDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page kd-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Kamdhenu</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name="Kamdhenu"/>
    <div className="kd-buy-column"><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/><p className="kd-preview-note">Images are design previews; sizes are estimates.</p></div>
   </div>
  </div>
  <WishSection/>
  <HolySection/>
  <PlentySection price={productMoney(p)} onAdd={()=>ready&&add(p,qty)}/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
