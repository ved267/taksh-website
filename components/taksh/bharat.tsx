'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {SiteLink} from './site-link';
import {SetGallery,SetPhoto,type PhotoInfo} from './set-gallery';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import {useStore} from './store';
import {useStickyPurchase} from './use-sticky-purchase';
import {track} from '@/lib/tracking';
import {type Product} from '@/lib/shop';
import './ram-mandir.css';
import './bharat.css';
import {SetFilm} from './set-film';

const asset=(name:string)=>`/bharat/product-page/${name}`;
const gallery:PhotoInfo[]=[
 {image:asset('gallery-01-hero-front.png'),label:'Bharat: The Map of India',alt:'A square wall mosaic of India made of small round pieces, each state a different bright colour, in a brown frame.'},
 {image:asset('life-01-room.jpg'),label:'The map on the wall.',alt:'The map of India on a dark green living-room wall, above a teak sideboard with marigolds.'},
 {image:asset('gallery-02-closeup.png'),label:'Seven rivers, one verse.',alt:'Close view of the round pieces, with blue river tiles sitting on top of them.'},
 {image:asset('life-05-floor.jpg'),label:'One plate at a time.',alt:'A boy and his sister building the map on a round rug on the floor while their grandmother watches.'},
 {image:asset('life-04-last-dot.jpg'),label:'One last yellow dot.',alt:'A boy placing one last yellow dot on the finished map.'},
 {image:asset('life-02-nani.jpg'),label:'Look closely.',alt:'A boy pointing at a place on the map and grinning at his grandmother.'},
 {image:asset('gallery-04-size.png'),label:'Size and space.',alt:'The map with its size: about 52.8 cm wide and 52.8 cm tall.'},
 {image:asset('gallery-05-plates.png'),label:'A1 to D4',alt:'The map divided into 16 square plates, named A1 to D4.'},
];
const steps=[
 {image:'life-06-one-plate.jpg',title:'Fill a plate.',alt:"A boy's finger pressing a blue dot onto a black studded plate."},
 {image:'life-07-joining.jpg',title:'Join it to the next.',alt:'Two finished plates being pushed together on two black pins.'},
 {image:'life-03-hanging.jpg',title:'Frame it and hang it.',alt:'A sister and brother hanging the finished map with a spirit level.'},
];
const rivers=['Ganga','Yamuna','Indus','Narmada','Godavari','Kaveri','Brahmaputra'];

function BharatFrame({design=false}:{design?:boolean}){
 const frame=useRef<HTMLIFrameElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const node=frame.current;if(!node)return;
  const nearby=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);nearby.disconnect()}},{rootMargin:"200px 0px"});
  nearby.observe(node);return()=>nearby.disconnect();
 },[]);
 const observer=useRef<ResizeObserver|null>(null);
 function fitOnLoad(){
  observer.current?.disconnect();
  const root=frame.current?.contentDocument?.getElementById('bharat-map');
  if(!root)return;
  // Follow later caption changes without changing either supplied document.
  const fit=()=>{if(frame.current)frame.current.style.height=`${Math.ceil(root.getBoundingClientRect().height)}px`};
  observer.current=new ResizeObserver(fit);
  observer.current.observe(root);
  fit();
 }
 useEffect(()=>()=>observer.current?.disconnect(),[]);
 return <iframe ref={frame} id={design?'bharat-design-frame':'bharat-map-frame'} className={`bharat-frame ${design?'bh-design-frame':'bh-explorer-frame'}`} src={visible?(design?'/bharat-make-it-yours.html':'/bharat-map.html'):undefined} title={design?'Design your own sea':'Interactive map of India'} loading="lazy" scrolling="no" onLoad={fitOnLoad}/>;
}

export function BharatDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null),pageRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();
 const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 useEffect(()=>{
  function resize(event:MessageEvent){
   const height=event.data?.bharatMapHeight;
   if(event.origin!==window.location.origin||typeof height!=='number'||!Number.isFinite(height)||height<=0)return;
   pageRef.current?.querySelectorAll<HTMLIFrameElement>('iframe.bharat-frame').forEach(frame=>{
    if(frame.contentWindow===event.source)frame.style.height=`${Math.ceil(height)}px`;
   });
  }
  window.addEventListener('message',resize);
  return()=>window.removeEventListener('message',resize);
 },[]);
 return <div ref={pageRef} className="rm-page bh-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening">
   <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Bharat: The Map of India</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name={p.name}/><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/></div>
  </div>
  <section className="bh-map-section" aria-label="Interactive map of India"><BharatFrame/></section>
  <section className="bh-build bh-story" aria-labelledby="bh-build-heading"><div className="wrap">
   <div className="bh-build-opening"><div className="bh-section-opening"><h2 id="bh-build-heading">One plate at a time.</h2><p>Sixteen plates. Fill one, join it to the next.</p></div>
   <SetPhoto className="bh-photo bh-family" sizes="(max-width: 700px) 90vw, 50vw" image={asset('life-05-floor.jpg')} alt="A boy lying on a round rug pressing the last dot onto the map, his sister beside him checking the plan, their grandmother in an armchair and a cat asleep nearby."/></div>
   <ol className="bh-steps">{steps.map((step,i)=><li key={step.image}>
    <SetPhoto className="bh-photo" sizes="(max-width: 700px) 30vw, 30vw" image={asset(step.image)} alt={step.alt}/>
    <div className="bh-step-copy"><div className="bh-step-title"><span aria-hidden="true">{i+1}</span><h3>{step.title}</h3></div></div>
   </li>)}</ol>
  </div></section><SetFilm name="bharat-build" caption="Build it to learn it."/>
  <section className="bh-design bh-story" aria-labelledby="bh-design-heading">
   <div className="wrap bh-design-opening"><h2 id="bh-design-heading">India never changes.<br/>The sea is yours.</h2><p>Every dot outside India lifts off. Make the sea your own.</p></div>
   <details className="bh-design-disclosure">
    <summary className="bh-design-toggle"><span className="bh-design-show">Try your design</span><span className="bh-design-hide">Close designer</span></summary>
    <BharatFrame design/>
   </details>
   <div className="wrap bh-design-notes"><p className="bh-note">The box has the dots of the design shown, to rearrange.</p></div>
  </section><SetFilm name="bharat-colour" caption="Every colour has a reason."/>
  <section className="bh-rivers bh-story" aria-labelledby="bh-rivers-heading"><div className="wrap bh-rivers-layout">
   <SetPhoto className="bh-river-photo" sizes="45vw" image={asset('gallery-02-closeup.png')} alt="Close view of the round pieces, with blue river tiles sitting on top of them."/>
   <div className="bh-rivers-copy"><h2 id="bh-rivers-heading">Seven rivers, one verse.</h2><p>An old bathing verse names seven rivers. Your map has them all, the Brahmaputra in place of the Saraswati.</p>
   <ul className="bh-river-list" aria-label="The seven rivers">{rivers.map(name=><li key={name}>{name}</li>)}</ul></div>
  </div></section>
  <section className="wrap bh-legal" aria-label="About the map"><p className="rm-disclaimer">The boundary of India is shown as depicted by the Survey of India. The map is a simplified mosaic and is not for navigation or legal use. Rivers are shown inside India only. Outside India the colours show height and depth; no other boundaries are drawn. The photographs on this page are imagined scenes; the map shown in them is the Taksh set.</p></section>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
