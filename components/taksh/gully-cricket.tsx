'use client';
import {useEffect,useRef,useState,type CSSProperties,type RefObject} from 'react';
import {SiteLink} from './site-link';
import {ImageViewer,SetPhoto,GalleryStatus,type PhotoInfo} from './set-gallery';
import {ProductPhoto} from './product-photo';
import {imageAsset,imageInfo,imageSrcSet,imageOriginal} from '@/lib/images';
import {SetBuyBox,SetStickyBar} from './set-buy-box';
import {useGallerySelection} from './use-gallery-selection';
import {useStickyPurchase} from './use-sticky-purchase';
import {useStore} from './store';
import {track} from '@/lib/tracking';
import {type Product} from '@/lib/shop';
import {gullyGallery,gullyScenes,gullyExplorer,gullyDisclaimer} from '@/lib/gully-cricket.mjs';
import './ram-mandir.css';
import './gully-cricket.css';

function GalleryViewer({photos,initialIndex,trigger,onClose}:{photos:PhotoInfo[];initialIndex:number;trigger:RefObject<HTMLButtonElement|null>;onClose:()=>void}){
 const originals=photos.map(p=>({...p,image:imageOriginal(p.image)}));
 const {index,resolvedSrc,status,change}=useGallerySelection(originals.map(p=>p.image),'100vw',initialIndex);
 return <ImageViewer photos={originals} index={index} resolvedSrc={resolvedSrc} status={status} onChange={change} onClose={onClose} trigger={trigger}/>;
}

function BuildExplorer(){
 const {index,resolvedSrc,status,change,warm}=useGallerySelection(gullyExplorer.map(s=>s.image),'(max-width: 760px) calc(100vw - 40px), 760px');
 const rail=useRef<HTMLDivElement>(null),buttons=useRef<(HTMLButtonElement|null)[]>([]),trigger=useRef<HTMLButtonElement>(null),request=useRef(0);
 const [pending,setPending]=useState<number|null>(null),[viewer,setViewer]=useState<{photos:PhotoInfo[];initialIndex:number}|null>(null);
 // Owner note, 26 Nov 2026: every set page opens on the set at home; the builds are one tap away.
 const [home,setHome]=useState(true);
 const atHome=gullyGallery[5],scene=gullyExplorer[index],shown=home?{...atHome,id:'home'}:scene;
 function select(next:number){
  setHome(false);
  const row=rail.current,button=buttons.current[next-1];
  if(row&&button&&getComputedStyle(row).display==='flex')row.scrollTo({left:button.offsetLeft-row.offsetLeft-(row.clientWidth-button.clientWidth)/2,behavior:'instant'});
  if(next===index&&pending===null)return;
  const token=++request.current;setPending(next);
  void change(next).finally(()=>{if(token===request.current)setPending(null)});
 }
 function openGallery(button:HTMLButtonElement,zoom=false){
  trigger.current=button;
  setViewer(home?{photos:gullyGallery,initialIndex:5}:zoom&&index!==0?{photos:[scene],initialIndex:0}:{photos:gullyGallery,initialIndex:1});
 }
 return <section className="gc-explorer" aria-label="Explore Gully Cricket">
  <div className="gc-explorer-stage" aria-busy={status==='loading'}>
   <button className={`gc-explorer-photo${home?' is-home':''}`} aria-label={`View larger: ${shown.label}`} onClick={e=>openGallery(e.currentTarget,true)}><SetPhoto key={shown.id} image={shown.image} alt={shown.alt} resolvedSrc={home?undefined:resolvedSrc} sizes="(max-width: 760px) 100vw, 760px" eager/></button>
   <div className="gc-build-feedback" data-visible={status!=='ready'}><GalleryStatus status={status}/></div>
  </div>
  <div className="gc-explorer-tools"><button onClick={()=>select(0)} aria-pressed={!home&&index===0} aria-busy={pending===0}>See all five</button><button onClick={e=>openGallery(e.currentTarget)}>View all photos <span aria-hidden="true">↗</span></button></div>
  <div className="gc-choice-heading"><h2>Build. Imagine. Create.</h2><p>Five builds in one set. Then your own.</p></div>
  <div className="gc-build-choices" ref={rail} role="group" aria-label="Choose a build" onKeyDown={e=>{
   const current=buttons.current.indexOf(document.activeElement as HTMLButtonElement);if(current<0)return;
   let next=current;if(e.key==='ArrowRight')next=(current+1)%6;else if(e.key==='ArrowLeft')next=(current+5)%6;else if(e.key==='Home')next=0;else if(e.key==='End')next=5;else return;
   e.preventDefault();buttons.current[next]?.focus({preventScroll:true});select(next+1);
  }}>{gullyScenes.map((s,i)=><button key={s.id} ref={el=>{buttons.current[i]=el}} aria-pressed={!home&&index===i+1} aria-busy={pending===i+1} onPointerEnter={()=>{void warm(i+1)}} onFocus={()=>{void warm(i+1)}} onTouchStart={()=>{void warm(i+1)}} onClick={()=>select(i+1)} className={i===5?'gc-yours':''} aria-label={i===5?'Create your own':s.label}><img src={imageAsset(s.image,'thumb')} width={160} height={120} alt="" decoding="async"/><span>{i===5?'Create your own':s.label}</span></button>)}</div>
  <div className="gc-caption"><p className="gc-build-line" aria-live="polite" aria-atomic="true">{home||index===0?"One set. Build one at a time.":scene.line}</p>
  {!home&&index!==0&&<p className="gc-one-set">One set. Build one at a time.</p>}</div>
  {viewer&&<GalleryViewer {...viewer} trigger={trigger} onClose={()=>setViewer(null)}/>}
 </section>;
}

export function GullyCricketDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 const night=imageInfo('/gully-cricket/banner-street-lamp.png');
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page gc-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Gully Cricket</span></nav>
   <div className="rm-product-layout"><BuildExplorer/>
    <div className="gc-buy-column"><SetBuyBox p={{...p,buildTime:'5 guided builds + your own ideas'}} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/><p className="gc-preview-note">Images are design previews.</p></div>
   </div>
  </div>
  <section className="gc-night" aria-label="One more over">
   <ProductPhoto src={imageAsset('/gully-cricket/banner-street-lamp.png')} srcSet={imageSrcSet('/gully-cricket/banner-street-lamp.png')} sizes="100vw" width={night?.width} height={night?.height} rootMargin="800px 0px" fetchPriority="low" decoding="async" alt="The brick set on a ledge in a dark lane at dusk, under a street lamp, a bat leaning on the wall behind."/>
   <div className="gc-dialogue" lang="hi-Latn"><p><span className="gc-speaker">Maa</span><span className="gc-quote">“Andar aa jao. Andhera ho gaya.”</span></p><p><span className="gc-speaker">Bachche</span><span className="gc-quote">“Bas ek over aur.”</span></p></div>
  </section>
  <section className="wrap rm-legal gc-legal" aria-label="About this set"><p className="rm-disclaimer">{gullyDisclaimer}</p></section>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
