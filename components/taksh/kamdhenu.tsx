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
import './kamdhenu.css';

const gallery:PhotoInfo[]=[
 {image:'/kamdhenu/gallery-02-mandir.webp',label:'In the mandir',alt:'The set on a marble ledge in a carved wooden mandir, beside a lit brass diya and marigolds.'},
 {image:'/kamdhenu/gallery-01-hero.webp',label:'Kamdhenu',alt:'A white brick cow with a dark red saddle cloth, an orange cap between gold horns and a bell at her neck, one front hoof raised, beside a reddish brown post on a tan studded base.'},
 {image:'/kamdhenu/gallery-03-new-home.webp',label:'A new home',alt:'The set on a wooden console by a doorway hung with a mango-leaf and marigold toran, a rangoli on the floor.'},
 {image:'/kamdhenu/gallery-04-childs-room.webp',label:'A child’s room',alt:'The set on a white shelf in a child’s room, under a child’s drawing of a cow, beside books and a plant.'},
 {image:'/kamdhenu/gallery-05-head.webp',label:'Up close',alt:'Her head up close: pink ears, an orange cap between gold horns, a gold necklace and a bell. Beside her, the rope coiled on her post.'},
 {image:'/kamdhenu/gallery-06-size.webp',label:'Size',alt:'The set with dimension lines: about 32 cm long and about 23 cm tall.'},
];

// The name: a centred band under the product on laptops, right after Add to bag on phones. काम + धेनु come apart once in view, then a warm line says what they mean.
function TheName(){
 const ref=useRef<HTMLDivElement>(null);
 const [split,setSplit]=useState<'open'|'joined'>('open');
 useEffect(()=>{
  const node=ref.current;if(!node||!('IntersectionObserver' in window))return;
  setSplit('joined');let timer=0;
  const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){timer=window.setTimeout(()=>setSplit('open'),450);io.disconnect()}},{threshold:.6});
  io.observe(node);return()=>{io.disconnect();clearTimeout(timer)};
 },[]);
 return <div ref={ref} className="kd-name" data-split={split}>
  <div className="kd-word" aria-hidden="true">
   <div className="kd-part" lang="sa"><span className="kd-deva">काम</span><span className="kd-roman">Kāma</span></div>
   <span className="kd-plus">+</span>
   <div className="kd-part" lang="sa"><span className="kd-deva">धेनु</span><span className="kd-roman">Dhenu</span></div>
  </div>
  <p className="kd-name-line">Kāma is every wish you have ever made. Dhenu is a cow whose love never runs dry. Put them together: a cow who never says no to a wish.</p>
 </div>;
}

const homes=[['The mandir','It is said every god lives in her. Keep her by the diya.'],['The family','For generations, families have called her mother.'],['A child’s room','Little Krishna was called Gopal, the boy who looked after the cows. Now she looks after your little one.']] as const;

function PlentySection(){
 return <section className="kd-plenty" aria-labelledby="kd-plenty-heading">
  <div className="kd-plenty-banner"><SetPhoto image="/kamdhenu/banner-pichwai.webp" alt="A painting in the Pichwai style: white cows in red saddle cloths walk with their calves through a green forest towards a lotus pond." sizes="100vw"/></div>
  <div className="kd-plenty-copy"><h2 id="kd-plenty-heading">She blesses every home.</h2>
   <ul className="kd-homes">{homes.map(([where,line])=><li key={where}><b>{where}</b><span>{line}</span></li>)}</ul>
  </div>
 </section>;
}

export function KamdhenuDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page kd-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="kd-top"><div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Kamdhenu</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name="Kamdhenu"/>
    <div className="kd-buy-column"><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/><p className="kd-preview-note">Images are design previews; sizes are estimates.</p></div>
    <TheName/>
   </div>
  </div></div>
  <PlentySection/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
