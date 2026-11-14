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

const odds=[['1','win in two earlier tournaments'],['66 to 1','the odds against India'],['43','runs, the winning margin']];

function NoChance(){
 return <section className="tr-odds" aria-labelledby="tr-odds-heading"><div className="wrap tr-odds-inner">
  <div className="tr-odds-copy"><h2 id="tr-odds-heading">Nobody gave them a chance.</h2>
   <ul className="tr-numbers">{odds.map(([n,l])=><li key={n}><strong>{n}</strong><span>{l}</span></li>)}</ul>
   <p>India came to England having won one match in two earlier tournaments. Bookmakers put them at 66 to 1. In the final they were all out for 183 against the West Indies, champions twice over. They bowled them out for 140 and won by 43 runs.</p>
   <p className="tr-odds-close">That night, a country learned it could beat the best.</p></div>
  <figure className="tr-odds-photo"><SetPhoto image="/1983-trophy/story-that-night.webp" alt="A living room late at night in 1983: an old television shows a cricket match, a transistor radio and a steel tumbler of tea wait on the table." sizes="(max-width: 960px) calc(100vw - 40px), 760px"/></figure>
 </div></section>;
}

function WhereItBegan(){
 return <section className="tr-began" aria-labelledby="tr-began-heading">
  <div className="tr-began-banner"><SetPhoto image="/1983-trophy/banner-where-it-began.webp" alt="A lane at dusk: cricket stumps drawn on an old wall, a worn bat leaning beside them and a taped tennis ball on the ground." sizes="100vw"/>
   <div className="tr-began-copy"><h2 id="tr-began-heading">Where it all began.</h2><p>Before 1983, cricket was one sport among many in India. After that night, children in every lane picked up a bat, and the game became the country’s own.</p><p>This is the cup it started with. Give it to the one who was there at the start.</p></div>
  </div>
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
  <WhereItBegan/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
