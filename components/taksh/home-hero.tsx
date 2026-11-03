'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {SiteLink} from './site-link';
import {imageAsset,imageInfo,imageSrcSet} from '@/lib/images';
import {products,productMoney} from '@/lib/shop';
const slides=[
 {name:'Bharat: The Map of India',label:'Map of India',slug:'map-of-india',image:'/bharat/product-page/life-05-floor.jpg',alt:'A family building the India map on a round rug, with their grandmother nearby.'},
 {name:'Chandrayaan-3',label:'Chandrayaan-3',slug:'chandrayaan-3',image:'/chandrayaan/ad-moon-banner.webp',alt:'The brick Vikram lander and Pragyan rover on the Moon.'},
 {name:'Ram Mandir',label:'Ram Mandir',slug:'ram-mandir',image:'/ram-mandir/ad-room-banner.webp',alt:'The brick Ram Mandir on a wooden sideboard in warm sunlight.'},
 {name:'Gully Cricket',label:'Gully Cricket',slug:'gully-cricket',image:'/gully-cricket/gallery-01-hero.png',alt:'The Gully Cricket Terrace House with green shutters, an open terrace and four figures playing cricket in front.'},
 {name:'Yellow Taxi',label:'Yellow Taxi',slug:'yellow-taxi',image:'/yellow-taxi/ad-night-banner.webp',alt:'The yellow brick taxi under a street lamp at night.'},
 {name:'Ulta Chashma',label:'Ulta Chashma',slug:'nonsense',image:'/nonsense/gallery-04-breakfast.webp',alt:'The blue brick Ulta Chashma glasses on a breakfast table with chai and snacks.'}
];
const photoSizes='(max-width:760px) calc(100vw - 40px), (max-width:1200px) 54vw, 610px';
export function HomeHero(){
 const[active,setActive]=useState(0),[previous,setPrevious]=useState<number|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const current=useRef(0),sequence=useRef(0),mounted=useRef(true),start=useRef<{x:number;y:number}|null>(null),controls=useRef<(HTMLButtonElement|null)[]>([]);
 const slide=slides[active],product=products.find(p=>p.slug===slide.slug)!;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
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
 useEffect(()=>{if(previous===null)return;const timer=setTimeout(()=>setPrevious(null),650);return()=>clearTimeout(timer)},[active,previous]);
 function photo(index:number,old=false){const item=slides[index],info=imageInfo(item.image);return <img key={`${old?'old':'current'}-${index}`} className={old?'home-photo-previous':previous!==null?'home-photo-enter':''} style={{objectFit:index===0||item.slug==='gully-cricket'?'contain':'cover',objectPosition:item.slug==='nonsense'?'50% 50%':'100% 50%'}} onError={e=>{if(e.currentTarget.currentSrc.endsWith('.avif')){e.currentTarget.srcset='';e.currentTarget.src=imageAsset(item.image)}}} src={imageAsset(item.image,'large')} srcSet={imageSrcSet(item.image)} sizes={photoSizes} width={info?.width} height={info?.height} alt={old?'':item.alt} aria-hidden={old||undefined} fetchPriority={index===0&&!old?'high':'auto'} decoding="async"/>}
 return <section id="our-story" className="home-opening" aria-label="Discover Taksh" aria-roledescription="carousel"><div className="home-feature wrap">
  <div id="featured-photo" className="home-feature-photo" aria-busy={busy} onTouchStart={e=>{start.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if(!start.current)return;const dx=e.changedTouches[0].clientX-start.current.x,dy=e.changedTouches[0].clientY-start.current.y;start.current=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))select(current.current+(dx<0?1:-1))}} onTouchCancel={()=>{start.current=null}}>
   {previous!==null&&photo(previous,true)}{photo(active)}
  </div>
  <div className="home-intro"><h1>Keep a little <br/>India close.</h1><p>Build the places and stories you grew up with.</p></div>
  <div className="home-feature-copy"><div className="home-feature-product" aria-live="polite" aria-atomic="true"><h2>{slide.name}</h2><strong>{productMoney(product)}</strong></div><div className="home-feature-action"><SiteLink href={'/sets/'+slide.slug} className="button primary" aria-label={`View ${slide.name}`}>View set</SiteLink><SiteLink href="/sets" className="home-browse-link">See all sets</SiteLink></div>{slide.slug==='nonsense'&&<span className="sr-only">Khelo bachchon.</span>}</div>
  <div className="home-feature-controls"><div className="home-feature-select" role="group" aria-label="Choose a featured set" onKeyDown={e=>{const i=controls.current.indexOf(document.activeElement as HTMLButtonElement);if(i<0)return;let next=i;if(e.key==='ArrowRight')next=(i+1)%slides.length;else if(e.key==='ArrowLeft')next=(i+slides.length-1)%slides.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=slides.length-1;else return;e.preventDefault();select(next);controls.current[next]?.focus()}}>{slides.map((s,i)=><button key={s.slug} ref={node=>{controls.current[i]=node}} aria-pressed={i===active} aria-controls="featured-photo" onClick={()=>select(i)}>{s.label}</button>)}</div><span className="sr-only" role="status">{error|| (busy?'Loading the selected photograph.':'')}</span></div>
 </div></section>;
}
