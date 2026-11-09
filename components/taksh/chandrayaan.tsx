'use client';
import {StockNotice} from './stock-notice';
import {useGallerySelection} from './use-gallery-selection';
import {GalleryStatus} from './set-gallery';
import {BuyerDetails} from './buyer-details';
import {ProductPhoto} from './product-photo';
import {SiteLink} from '@/components/taksh/site-link';


import {useEffect,useRef,useState,type CSSProperties,type ReactNode,type PointerEvent,type MouseEvent} from 'react';
import {ArrowLeft,ArrowRight,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Stepper} from './stepper';
import {ContactLink} from './shell';
import {useStore} from './store';
import {productMoney,pieceLabel,inTheBox,type Product} from '@/lib/shop';
import {track} from '@/lib/tracking';
import {useStickyPurchase} from './use-sticky-purchase';
import {imageAsset,imageInfo,imageSrcSet} from '@/lib/images';
import {HomePreview} from './home-preview';
import './chandrayaan.css';

const asset=(name:string,small=false)=>imageAsset(`/chandrayaan/${name}.webp`,small?'thumb':'full');
const landscape=(name:string)=>['gallery-12-room','gallery-13-hand-for-scale'].includes(name);
const photoWidth=(name:string)=>landscape(name)?1536:['gallery-11-dimensions','gallery-09-lander-clean'].includes(name)?1800:1254;
function Photo({name,alt,eager=false,large=false,folder='chandrayaan',sizes,resolvedSrc}:{name:string;alt:string;eager?:boolean;large?:boolean;folder?:string;sizes?:string;resolvedSrc?:string}){
 const src=`/${folder}/${name}.webp`,info=imageInfo(src);
 return <ProductPhoto eager={eager} src={resolvedSrc||imageAsset(src)} srcSet={resolvedSrc?undefined:imageSrcSet(src)} sizes={sizes??(large?'(max-width: 760px) 100vw, 1100px':'(max-width: 960px) calc(100vw - 40px), 50vw')} alt={alt} width={info?.width||photoWidth(name)} height={info?.height||(landscape(name)?1024:photoWidth(name))} fetchPriority={eager?'high':'auto'} decoding="async" draggable={false}/>;
}
const chandrayaanGalleryPhotos=[
 {image:'gallery-01-hero',label:'The complete set',alt:'Vikram and Pragyan on the brick lunar base.'},
 {image:'gallery-02-rover-closeup',label:'Pragyan close-up',alt:'Pragyan with six wheels, camera eyes and a blue solar panel.'},
 {image:'gallery-07-inside-front',label:'Inside Vikram',alt:'The open lander with its rover bay, tanks and guide rails.'},
 {image:'gallery-03-top-deck-closeup',label:'The top deck',alt:'The antenna dish and instruments on Vikram’s top deck.'},
 {image:'gallery-05-leg-heat-probe',label:'The landing leg',alt:'Vikram’s landing leg, gold footpad and heat probe.'},
 {image:'gallery-11-dimensions',label:'Size and space',alt:'The complete set, about 32 cm wide, 28 cm deep and 17 cm tall.'},
 {image:'gallery-12-room',label:'The set at home',alt:'The complete model on a wooden console beside books.'},
];
type Part={name:string;job:string};
const parts:Record<'lander'|'rover',Part[]>={
 lander:[
  {name:'Antenna dish',job:'Sends data home. The dish turns on your model.'},
  {name:'Laser reflector',job:'Helps orbiting spacecraft locate the lander.'},
  {name:'Plasma probe',job:'Measures charged particles above the lunar surface.'},
  {name:'Ramp lever',job:'Lowers the ramp on your model.'},
  {name:'Landing cameras',job:'Help find a safe place to touch down.'},
  {name:'Solar panels',job:'Turn sunlight into power on the real mission.'},
  {name:'Door and ramp',job:'Unfolds in two sections so Pragyan can roll out.'},
  {name:'Four engines',job:'Slow the lander for a soft touchdown.'},
  {name:'Landing legs',job:'Support Vikram when it reaches the ground.'},
  {name:'Heat probe',job:'Measures the temperature of the lunar soil.'},
  {name:'Moonquake sensor',job:'Senses vibrations in the ground.'},
  {name:'Pragyan rover',job:'Rolls out to explore the lunar surface.'},
 ],
 rover:[
  {name:'Camera eyes',job:'Two cameras help pick a safe path.'},
  {name:'Solar panel',job:'Folds for travel. Powers the real rover with sunlight.'},
  {name:'Antenna',job:'Keeps the rover in touch with Vikram.'},
  {name:'Soil sensor',job:'Studies what the lunar ground is made of.'},
  {name:'Six wheels',job:'Each wheel turns on your model.'},
  {name:'Rocker frame',job:'Helps the wheels follow uneven ground.'},
 ],
};

const timeline=[
 {date:'14 July 2023',event:'Leaving Earth',note:'LVM3 lifts off from Sriharikota, carrying Chandrayaan-3.'},
 {date:'5 August 2023',event:'Around the Moon',note:'Chandrayaan-3 enters lunar orbit.'},
 {date:'23 August 2023',event:'Vikram lands at 6:04 pm',note:'India becomes the first country to land near the Moon’s south pole.'},
 {date:'A few hours later',event:'Pragyan rolls onto the Moon'},
 {date:'3 September 2023',event:'Vikram makes a short hop',note:'It rises about 40 cm and lands a short distance away.'},
];

const points={
 lander:[{x:53,y:14},{x:49.4,y:20.8},{x:36.9,y:14.9},{x:63.8,y:17.8},{x:56,y:26.5},{x:39.8,y:31.5},{x:46.4,y:47.6},{x:54.4,y:48.5},{x:61.6,y:57.9},{x:66.1,y:58.8},{x:30.5,y:53.8},{x:44.4,y:68}],
 rover:[{x:34,y:44},{x:63,y:36},{x:78,y:39},{x:42,y:73},{x:29,y:82},{x:57,y:76}],
};
function WhatsAppIcon(){return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.6 11.6a8.7 8.7 0 0 1-12.9 7.6L3 20.5l1.3-4.6a8.7 8.7 0 1 1 16.3-4.3Z"/><path d="M8.5 7.5c-.8.3-1 1.5-.5 2.6 1 2.4 3 4.4 5.4 5.2 1 .4 2.2-.1 2.6-1l-2.3-1.5-.9 1c-1.5-.6-2.7-1.8-3.3-3.2l.8-.9-1.2-2.2Z"/></svg>}

export function ChandrayaanGallery({photos=chandrayaanGalleryPhotos,folder='chandrayaan',showHomePreview=true,allowEnlarge=true,after}:{photos?:typeof chandrayaanGalleryPhotos;folder?:string;showHomePreview?:boolean;allowEnlarge?:boolean;after?:ReactNode}){
 const gallery=photos;
 const galleryAsset=(name:string)=>imageAsset(`/${folder}/${name}.webp`,'thumb');
 const [open,setOpen]=useState(false);
 const {index,resolvedSrc,status,change}=useGallerySelection(gallery.map(p=>`/${folder}/${p.image}.webp`),open?'100vw':'(max-width: 760px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 122px), (max-width: 1200px) calc(51vw - 125px), (max-width: 1440px) calc(55vw - 145px), 580px');
 const trigger=useRef<HTMLButtonElement>(null);const thumbs=useRef<(HTMLButtonElement|null)[]>([]);
 const touch=useRef<{x:number;y:number}|null>(null);const dragged=useRef(false);
 useEffect(()=>{const thumb=thumbs.current[index];if(thumb&&window.matchMedia('(max-width: 760px)').matches){const rail=thumb.parentElement;if(rail)rail.scrollTo({left:thumb.offsetLeft-rail.offsetLeft-rail.clientWidth/2+28,behavior:'instant'})}},[index]);
 function start(e:PointerEvent){touch.current={x:e.clientX,y:e.clientY};dragged.current=false}
 function end(e:PointerEvent){if(!touch.current)return;const dx=e.clientX-touch.current.x,dy=e.clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){dragged.current=true;change(index+(dx<0?1:-1))}}
 const current=gallery[index];
 return <>
  <div className="ch3-gallery" role="group" aria-label="Product gallery">
   <div className="ch3-thumbnails" aria-label="Choose a product image">{gallery.map((item,i)=><button ref={el=>{thumbs.current[i]=el}} key={item.image} type="button" aria-label={`${i+1}. ${item.label}`} aria-pressed={i===index} onClick={()=>change(i)}><img src={galleryAsset(item.image)} width={76} height={76} alt="" loading="lazy" fetchPriority="low" decoding="async" draggable={false}/></button>)}</div>
   <div className="ch3-gallery-stage" aria-busy={status==='loading'} onPointerDown={start} onPointerUp={end} onPointerCancel={()=>{touch.current=null}} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(index+(e.key==='ArrowRight'?1:-1))}}}>
    {allowEnlarge?<button ref={trigger} className="ch3-main-image" aria-label={`View larger: ${current.label}`} onClick={()=>{if(dragged.current){dragged.current=false;return}setOpen(true)}}><Photo resolvedSrc={resolvedSrc} folder={folder} name={current.image} alt={current.alt} eager sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 122px), (max-width: 1200px) calc(51vw - 125px), (max-width: 1440px) calc(55vw - 145px), 580px"/></button>:<div className="ch3-main-image" tabIndex={0} aria-label={current.label}><Photo resolvedSrc={resolvedSrc} folder={folder} name={current.image} alt={current.alt} eager sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 122px), (max-width: 1200px) calc(51vw - 125px), (max-width: 1440px) calc(55vw - 145px), 580px"/></div>}
    <span className="ch3-counter" aria-live="polite">{index+1} / {gallery.length}</span>
    <button className="ch3-gallery-arrow previous" aria-label="Previous image" onClick={()=>change(index-1)}><ArrowLeft size={18}/></button><button className="ch3-gallery-arrow next" aria-label="Next image" onClick={()=>change(index+1)}><ArrowRight size={18}/></button>
   </div>
   <GalleryStatus status={status}/>{showHomePreview&&<HomePreview image="/chandrayaan/gallery-12-room.webp" alt="The Chandrayaan-3 model on a wooden console beside books." className="ch3-home-preview"/>}
   {after}
  </div>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent showCloseButton={false} className="ch3-lightbox" style={{translate:'none',transform:'none',inset:0}} onCloseAutoFocus={e=>{e.preventDefault();trigger.current?.focus()}} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(index+(e.key==='ArrowRight'?1:-1))}}}>
   <DialogTitle className="sr-only">{current.label}</DialogTitle><DialogDescription className="sr-only">Use the previous and next buttons or arrow keys to browse. Swipe on a phone. Press Escape to close.</DialogDescription>
   <div className="ch3-lightbox-toolbar"><span aria-live="polite">{index+1} / {gallery.length}</span><button aria-label="Close gallery" onClick={()=>setOpen(false)}><X size={22}/><span>Close</span></button></div>
   <GalleryStatus status={status}/><div className="ch3-lightbox-photo" onPointerDown={start} onPointerUp={end} onPointerCancel={()=>{touch.current=null}}><Photo resolvedSrc={resolvedSrc} folder={folder} name={current.image} alt={current.alt} eager large/></div>
   <div className="ch3-lightbox-navigation"><button aria-label="Previous image" onClick={()=>change(index-1)}><ArrowLeft size={20}/></button><span>{current.label}</span><button aria-label="Next image" onClick={()=>change(index+1)}><ArrowRight size={20}/></button></div>
  </DialogContent></Dialog>
 </>;
}

function PartGuide(){
 const [craft,setCraft]=useState<'lander'|'rover'>('lander');const [showSize,setShowSize]=useState(false);const [selected,setSelected]=useState<number|null>(null);
 const guide=useRef<HTMLDetailsElement>(null);const rows=useRef<(HTMLButtonElement|null)[]>([]);const diagram=useRef<HTMLDivElement>(null);const [phone,setPhone]=useState(false);
 useEffect(()=>{const query=window.matchMedia('(max-width:760px)');const update=()=>setPhone(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 function select(i:number,fromMarker=false){setSelected(i);if(guide.current)guide.current.open=true;if(fromMarker&&window.matchMedia('(max-width: 760px)').matches)rows.current[i]?.scrollIntoView({behavior:'smooth',block:'center'})}
 function markerClick(i:number,e:MouseEvent<HTMLButtonElement>){
  // Adjacent instruments keep their original centres. Resolve overlapping tap areas to the nearest centre.
  if(e.detail&&diagram.current){const r=diagram.current.getBoundingClientRect();let closest=i,distance=Infinity;points[craft].forEach((p,j)=>{const d=(e.clientX-r.left-r.width*p.x/100)**2+(e.clientY-r.top-r.height*p.y/100)**2;if(d<distance){distance=d;closest=j}});select(closest,true)}else select(i,true);
 }
 return <section className="ch3-section ch3-parts" id="ch-parts" aria-labelledby="ch3-parts-title"><div className="wrap">
  <div className="ch3-section-heading"><div><h2 id="ch3-parts-title">Every part has a job.</h2><p>Follow the numbers. Find out what each part does.</p></div><div className="ch3-tabs" role="group" aria-label="Choose parts or size">{(['lander','rover'] as const).map(c=><button key={c} aria-pressed={!showSize&&craft===c} onClick={()=>{setCraft(c);setShowSize(false);setSelected(null)}}>{c==='lander'?'Vikram · Lander':'Pragyan · Rover'}</button>)}<button aria-pressed={showSize} onClick={()=>{setShowSize(true);setSelected(null)}}>Size</button></div></div>
  {showSize?<div className="ch3-size-layout"><figure><Photo name="gallery-11-dimensions" alt="The complete lander and rover set with width, depth and height marked."/></figure><div className="ch3-size-copy"><h3>A little room for the Moon.</h3><dl><div><dt>Width</dt><dd>About 32 cm</dd></div><div><dt>Depth</dt><dd>About 28 cm</dd></div><div><dt>Height</dt><dd>About 17 cm</dd></div></dl><p>About one and a half A4 sheets of shelf space.</p></div></div>:<div className="ch3-part-layout"><figure><div ref={diagram} className={`ch3-diagram ${craft}`}><Photo name={craft==='lander'?'gallery-09-lander-clean':'gallery-02-rover-closeup'} alt={craft==='lander'?'Vikram and its lunar base, with twelve numbered parts.':'Pragyan, with six numbered parts.'}/>{points[craft].map((point,i)=><button key={`${craft}-${i}`} className={`ch3-marker${phone?' is-static':''}`} tabIndex={phone?-1:0} aria-hidden={phone||undefined} style={{left:point.x+'%',top:point.y+'%'}} aria-label={`${i+1}. ${parts[craft][i].name}`} aria-pressed={selected===i} aria-controls={`ch3-part-${craft}-${i}`} onClick={e=>markerClick(i,e)}><span>{i+1}</span></button>)}</div><figcaption>{craft==='lander'?<><strong>Vikram carries a founder’s name.</strong> A tribute to Dr Vikram Sarabhai, the founder of India’s space programme.</>:<><strong>Pragyan means wisdom.</strong> A small rover, sent to learn about another world.</>}</figcaption></figure>
   <details ref={guide} className="parts-disclosure"><summary>Explore all {parts[craft].length} parts</summary><ol className="ch3-part-list" aria-label={`${craft==='lander'?'Vikram':'Pragyan'} parts and functions`}>{parts[craft].map((part,i)=><li key={part.name}><button ref={el=>{rows.current[i]=el}} id={`ch3-part-${craft}-${i}`} aria-pressed={selected===i} onClick={()=>select(i)}><span className="ch3-part-number">{i+1}</span><span><strong>{part.name}</strong><span className="ch3-part-job">{part.job}</span></span></button></li>)}</ol></details>
  </div>}
 </div></section>;
}

export function ChandrayaanDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null);const contactRef=useRef<HTMLDivElement>(null);const {add,ready}=useStore();
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 return <div className="ch3-page" style={{'--ch3-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap ch3-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Chandrayaan-3</span></nav>
   <div className="ch3-top-layout"><ChandrayaanGallery showHomePreview={false}/><section className="ch3-buy" aria-label="Choose your set">
    <div className="ch3-title"><h1>Chandrayaan-3</h1><div className="ch3-craft-pair"><span><strong>Vikram</strong><span className="ch3-craft-role"> · Lander</span></span><span><strong>Pragyan</strong><span className="ch3-craft-role"> · Rover</span></span></div></div>
    <div className="ch3-facts"><span>Ages {p.age}+</span><span>{pieceLabel(p)} pieces</span><span>{p.buildTime}</span><span>{p.level}</span></div>
    <div className="ch3-description"><p>Build the lander, the rover and a piece of the Moon. The ramp unfolds, the rover rolls out, and the top lifts off.</p><p style={{marginTop:12}}>{inTheBox(p)}</p></div>
    <div className="ch3-pricing"><div className="price-block"><span className="price-tag">{productMoney(p)}</span><small>MRP inclusive of all taxes</small></div></div>
    <StockNotice/><div className="ch3-order"><div className="quantity-row"><span>Quantity</span><Stepper value={qty} onChange={setQty}/></div><button ref={buyRef} className="button primary full" disabled={!ready} onClick={()=>add(p,qty)}>Add to bag</button></div>
    <BuyerDetails p={p}/><div ref={contactRef} className="ch3-contact"><ContactLink><WhatsAppIcon/>Ask us on WhatsApp</ContactLink></div>
   </section></div>
  </div>
  <section className="ch3-section ch3-moves" id="ch-moves" aria-labelledby="ch3-moves-title"><div className="wrap"><div className="ch3-section-heading"><div><h2 id="ch3-moves-title">Built to move.</h2><p>Four moving details to try for yourself.</p></div></div><div className="ch3-moves-layout"><div className="ch3-move-photos"><figure><Photo name="gallery-04-door-closeup" alt="The hinged doorway and unfolded ramp."/></figure><figure><Photo name="gallery-07-inside-front" alt="Vikram with the top deck lifted off and the rover inside."/></figure></div><div className="ch3-move-list">{[
 ['The ramp unfolds.','Two hinged sections swing down from the door to the ground.'],['Pragyan rolls out.','All six wheels turn.'],['The top lifts off.','Take off the top deck to see the rover bay, the fuel tanks and the guide rails.'],['The solar panel flips.','It lies flat for the journey and stands up to charge.'],
 ].map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div></div></div></section>
  <PartGuide/>
  <section className="wrap ch3-section" aria-labelledby="ch3-size-title"><div className="ch3-size-layout"><figure><Photo name="gallery-11-dimensions" alt="The complete lander and rover set with width, depth and height marked."/></figure><div className="ch3-size-copy"><h2 id="ch3-size-title">Size and space.</h2><dl><div><dt>Width</dt><dd>About 32 cm</dd></div><div><dt>Depth</dt><dd>About 28 cm</dd></div><div><dt>Height</dt><dd>About 17 cm</dd></div></dl><p>About one and a half A4 sheets of shelf space.</p></div></div></section>
  <section className="ch3-moon" aria-label="Inspired by the mission"><picture><source media="(max-width:640px)" srcSet={imageSrcSet('/chandrayaan/ad-moon-portrait.webp')} sizes="100vw"/><img src={asset('ad-moon-banner')} srcSet={imageSrcSet('/chandrayaan/ad-moon-banner.webp')} sizes="100vw" width={1672} height={941} alt="The brick lander and rover in an imagined lunar scene." loading="lazy" decoding="async"/></picture><div className="ch3-moon-copy"><span>23 August 2023 · 6:04 pm</span><h2>A landing<br/>worth remembering.</h2><p>A build that keeps the story close.</p></div></section>
  <section className="wrap ch3-section ch3-story" id="ch-story" aria-labelledby="ch3-timeline-title"><h2 id="ch3-timeline-title">From Earth to the Moon.</h2><ol className="ch3-timeline">{timeline.map((item,i)=><li key={item.date} className={i===2?'ch3-touchdown':undefined}><span className="ch3-timeline-node" aria-hidden="true"/><span className="ch3-date">{item.date}</span><div><h3>{item.event}</h3>{item.note&&<p>{item.note}</p>}</div></li>)}</ol><p className="ch3-tribute">An independent tribute to the mission. Not made by, affiliated with or endorsed by ISRO.</p></section>
  {sticky&&<div className="ch3-sticky"><div><strong>Chandrayaan-3</strong><span>{productMoney(p)}</span></div><button className="button primary" disabled={!ready} onClick={()=>add(p,qty)}>Add to bag</button></div>}
 </div>;
}
