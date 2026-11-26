'use client';
import {Fragment,useCallback,useEffect,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {imageAsset,imageInfo,imageSrcSet} from '@/lib/images';
import {products} from '@/lib/shop';
// One photograph per set. fit/pos keep each model whole inside the 3:2 frame.
const slides=[
 {slug:'ram-mandir',label:'Ram Mandir',image:'/ram-mandir/ad-room-banner.webp',fit:'cover',pos:'78% 50%',alt:'The brick Ram Mandir on a wooden sideboard in warm sunlight.'},
 {slug:'padma',label:'Padma',image:'/padma/gallery-04-at-home.webp',fit:'cover',pos:'50% 40%',alt:'The brick Padma lotuses on a wooden table beside a book and reading glasses.'},
 {slug:'1983-trophy',label:'1983 Trophy',image:'/1983-trophy/gallery-03-on-desk.webp',fit:'cover',pos:'50% 38%',alt:'The silver brick 1983 Trophy on a wooden desk beside a mug and old books.'},
 {slug:'kamdhenu',label:'Kamdhenu',image:'/kamdhenu/gallery-07-festive.webp',fit:'cover',pos:'50% 60%',alt:'The brick Kamdhenu on a red cloth with diyas, a rangoli and a marigold garland.'},
 {slug:'chandrayaan-3',label:'Chandrayaan-3',image:'/chandrayaan/ad-moon-banner.webp',fit:'cover',pos:'100% 50%',alt:'The brick Vikram lander and Pragyan rover on the Moon.'},
 {slug:'surajmukhi',label:'Surajmukhi',image:'/surajmukhi/banner-at-home.webp',fit:'cover',pos:'92% 50%',alt:'The brick Surajmukhi sunflowers in a glass bottle by a sunlit window.'},
 {slug:'gully-cricket',label:'Gully Cricket',image:'/gully-cricket/gallery-06-at-home.png',fit:'cover',pos:'40% 50%',alt:'Two children on a rug playing cricket with the brick set while their grandmother watches.'},
 {slug:'map-of-india',label:'Map of India',image:'/bharat/product-page/life-05-floor.jpg',fit:'cover',pos:'50% 50%',alt:'A family building the India map on a round rug, with their grandmother nearby.'},
 {slug:'yellow-taxi',label:'Yellow Taxi',image:'/yellow-taxi/ad-night-banner.webp',fit:'cover',pos:'100% 50%',alt:'The yellow brick taxi under a street lamp at night.'},
 {slug:'nonsense',label:'Ulta Chashma',image:'/nonsense/gallery-04-breakfast.webp',fit:'cover',pos:'70% 50%',alt:'The blue brick Ulta Chashma glasses on a breakfast table with chai and snacks.'},
].filter(s=>products.some(p=>p.slug===s.slug));
const photoSizes='(max-width:760px) 100vw, (max-width:1200px) 54vw, 610px';
// Owner note, 26 Nov 2026: three times as fast, so every set is seen.
export const HERO_SECONDS=1.8;
// Ram Mandir opens the page and stays a little longer.
const LEAD_SECONDS=2.8;
export function HomeHero(){
 const[active,setActive]=useState(0),[previous,setPrevious]=useState<number|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 // rolling: the visitor's own choice (pause button). held: a temporary reason to wait (hover, focus, touch, off screen).
 const[rolling,setRolling]=useState(true),[held,setHeld]=useState(false),[still,setStill]=useState(false);
 const current=useRef(0),sequence=useRef(0),mounted=useRef(true),start=useRef<{x:number;y:number}|null>(null),controls=useRef<(HTMLButtonElement|null)[]>([]),root=useRef<HTMLElement>(null);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 // People who ask for less motion get a still frame; they can still choose a set.
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const set=()=>setStill(q.matches);set();q.addEventListener('change',set);return()=>q.removeEventListener('change',set)},[]);
 // Wait while the hero is scrolled away or the tab is in the background, so nobody comes back to a set they never saw.
 const[onScreen,setOnScreen]=useState(true),[shown,setShown]=useState(true);
 useEffect(()=>{const node=root.current;if(!node||!('IntersectionObserver' in window))return;const o=new IntersectionObserver(([e])=>setOnScreen(e.isIntersecting),{threshold:.35});o.observe(node);return()=>o.disconnect()},[]);
 useEffect(()=>{const set=()=>setShown(document.visibilityState!=='hidden');set();document.addEventListener('visibilitychange',set);return()=>document.removeEventListener('visibilitychange',set)},[]);
 // Warm only the next photograph, so the change is instant without downloading every set up front (not on Save-Data or 2G).
 const warmed=useRef(new Set<number>([0]));
 const warm=useCallback((n:number)=>{n=(n+slides.length)%slides.length;if(warmed.current.has(n))return;const c=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;if(c?.saveData||/2g/.test(c?.effectiveType||''))return;warmed.current.add(n);const i=new Image();i.sizes=photoSizes;i.srcset=imageSrcSet(slides[n].image)||'';i.src=imageAsset(slides[n].image,'large')},[]);
 useEffect(()=>{const t=setTimeout(()=>{warm(active+1);warm(active+2)},active===0?1200:0);return()=>clearTimeout(t)},[active,warm]);
 const select=useCallback((n:number)=>{
  const next=(n+slides.length)%slides.length,token=++sequence.current;
  if(next===current.current){setBusy(false);return}
  setBusy(true);setError('');
  // Decode only the chosen photograph before replacing the visible frame.
  const image=new Image();
  image.onload=async()=>{try{await image.decode()}catch{}if(!mounted.current||token!==sequence.current)return;setPrevious(current.current);current.current=next;setActive(next);setBusy(false)};
  let fallback=false;image.onerror=()=>{if(!fallback&&image.srcset.includes('.avif')){fallback=true;image.srcset='';image.src=imageAsset(slides[next].image);return}if(!mounted.current||token!==sequence.current)return;setBusy(false);setError('This photograph could not load. Choose another set.')};
  image.sizes=photoSizes;image.srcset=imageSrcSet(slides[next].image)||'';image.src=imageAsset(slides[next].image,'large');
 },[]);
 useEffect(()=>{if(previous===null)return;const timer=setTimeout(()=>setPrevious(null),950);return()=>clearTimeout(timer)},[active,previous]);
 const visible=onScreen&&shown,moving=rolling&&!still,running=moving&&!held&&visible&&!busy;
 function photo(index:number,old=false){const item=slides[index],info=imageInfo(item.image);return <img key={`p-${index}`} className={old?'home-photo-previous':previous!==null?'home-photo-enter':''} style={{objectFit:item.fit as 'cover'|'contain',objectPosition:item.pos}} onError={e=>{if(e.currentTarget.currentSrc.endsWith('.avif')){e.currentTarget.srcset='';e.currentTarget.src=imageAsset(item.image)}}} src={imageAsset(item.image,'large')} srcSet={imageSrcSet(item.image)} sizes={photoSizes} width={info?.width} height={info?.height} alt={old?'':item.alt} aria-hidden={old||undefined} fetchPriority={index===0&&!old?'high':'auto'} decoding="async"/>}
 return <section ref={root} id="our-story" className="home-opening" data-set={slides[active].slug} aria-label="Discover Taksh" aria-roledescription="carousel" onPointerEnter={e=>{if(e.pointerType==='mouse')setHeld(true)}} onPointerLeave={e=>{if(e.pointerType==='mouse')setHeld(false)}} onFocus={e=>{if((e.target as HTMLElement).matches?.(':focus-visible'))setHeld(true)}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setHeld(false)}}><div className="home-feature wrap">
  <div className="home-intro"><h1>Brick-building sets that keep <em>Indian stories and culture</em> close</h1><p>For every age, to build together.</p></div>
  <div id="featured-photo" className="home-feature-photo" aria-busy={busy} onTouchStart={e=>{setHeld(true);start.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{setHeld(false);if(!start.current)return;const dx=e.changedTouches[0].clientX-start.current.x,dy=e.changedTouches[0].clientY-start.current.y;start.current=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))select(current.current+(dx<0?1:-1))}} onTouchCancel={()=>{setHeld(false);start.current=null}}>
   {previous!==null&&photo(previous,true)}{photo(active)}
   {!still&&<button type="button" className="home-play" aria-label={rolling?'Pause the photos':'Start the photos'} onClick={()=>setRolling(v=>!v)}>{rolling?<Pause aria-hidden="true"/>:<Play aria-hidden="true"/>}</button>}
  </div>
  <div className="home-feature-controls">
   <div className="home-feature-select" role="group" aria-label="Choose a set" onKeyDown={e=>{const i=controls.current.indexOf(document.activeElement as HTMLButtonElement);if(i<0)return;let next=i;if(e.key==='ArrowRight')next=(i+1)%slides.length;else if(e.key==='ArrowLeft')next=(i+slides.length-1)%slides.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=slides.length-1;else return;e.preventDefault();select(next);controls.current[next]?.focus()}}>
    {slides.map((s,i)=><Fragment key={s.slug}>{i===5&&<span className="home-break" aria-hidden="true"/>}<button className="home-chip" ref={node=>{controls.current[i]=node}} aria-pressed={i===active} aria-controls="featured-photo" onPointerEnter={()=>warm(i)} onFocus={()=>warm(i)} onClick={()=>select(i)}>{i===active&&<span key={active} className={`home-chip-fill${moving?' is-timed':''}`} style={{animationDuration:(i===0?LEAD_SECONDS:HERO_SECONDS)+'s',animationPlayState:running?'running':'paused'}} onAnimationEnd={()=>select(current.current+1)}/>}<span className="home-chip-name">{s.label}</span></button></Fragment>)}
   </div>
   <span className="sr-only" role="status">{error|| (busy?'Loading the selected photograph.':'')}</span>
  </div>
 </div></section>;
}
