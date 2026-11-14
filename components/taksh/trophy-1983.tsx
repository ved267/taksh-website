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
import './trophy-1983.css';

const gallery:PhotoInfo[]=[
 {image:'/1983-trophy/gallery-01-hero.webp',label:'1983 Trophy',alt:'A silver brick trophy with two handles and a stepped lid, on a brown plinth with a plaque that reads 1983 India.'},
 {image:'/1983-trophy/gallery-02-plaque.webp',label:'The plaque',alt:'The brown brick plinth up close, with a black plaque that reads 1983 India.'},
 {image:'/1983-trophy/gallery-03-lid-handles.webp',label:'Lid and handles',alt:'The stepped silver lid with a round knob, and the two curved handles.'},
 {image:'/1983-trophy/gallery-04-size.webp',label:'Size',alt:'The set is about 21 cm tall and 13 cm wide.'},
];

function NoChance(){
 return <section className="tr-odds" aria-labelledby="tr-odds-heading"><div className="wrap tr-odds-inner">
  <div className="tr-odds-copy"><h2 id="tr-odds-heading">Nobody gave them a chance.</h2>
   <ol className="tr-timeline">
    <li><span className="tr-when">Before 1983</span><p><strong>The underdogs.</strong> One match won in two world tournaments. Bookmakers put India at 66 to 1.</p></li>
    <li className="tr-turn"><span className="tr-when">25 June 1983</span><p><strong>Champions of the world.</strong> All out for 183, India bowled out the West Indies for 140 and won by 43 runs.</p></li>
    <li><span className="tr-when">Since then</span><p><strong>Never the underdogs again.</strong> World titles in 2007, 2011, 2013, 2024, 2025 and 2026.</p></li>
   </ol></div>
  <figure className="tr-odds-photo"><SetPhoto image="/1983-trophy/story-that-night.webp" alt="A living room late at night in 1983: an old television shows a cricket match, a transistor radio and a steel tumbler of tea wait on the table." sizes="(max-width: 960px) calc(100vw - 40px), 760px"/></figure>
 </div></section>;
}

const teamWins=['Beat the West Indies, who had never lost a match at the tournament.','Were 17 for 5 against Zimbabwe, and still won.','Beat England, the hosts, in the semi-final.'];

function ThankYou(){
 return <section className="tr-began" aria-labelledby="tr-began-heading">
  <div className="tr-began-banner"><SetPhoto image="/1983-trophy/banner-thank-you.webp" alt="A team of Indian cricketers in cream sweaters, seen from behind with their arms around each other on a pavilion balcony in golden evening light." sizes="100vw"/></div>
  <div className="tr-began-copy"><h2 id="tr-began-heading">Thank you, 1983.</h2>
    <ul className="tr-team-wins">{teamWins.map(w=><li key={w}>{w}</li>)}</ul>
    <p>A ten-year-old in Bombay watched them win. Twenty-eight years later, he won it again in his own city.</p><p className="tr-thanks">This cup is our thank you.</p></div>
 </section>;
}

export function Trophy1983Detail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page tr-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>1983 Trophy</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name="1983 Trophy"/>
    <div className="tr-buy-column"><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)}/><p className="tr-preview-note">Images are design previews; sizes are estimates.</p></div>
   </div>
  </div>
  <NoChance/>
  <ThankYou/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
