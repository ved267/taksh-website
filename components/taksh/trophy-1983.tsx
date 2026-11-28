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
import {SetFilm} from './set-film';

const gallery:PhotoInfo[]=[
 {image:'/1983-trophy/gallery-03-on-desk.webp',label:'On a desk',alt:'The set on a study desk beside a coffee mug. It is about 21 cm tall, a little over twice the height of the mug.'},
 {image:'/1983-trophy/gallery-01-hero.webp',label:'1983 Trophy',alt:'A silver brick trophy with two handles and a stepped lid, on a brown plinth with a plaque that reads 1983 India.'},
 {image:'/1983-trophy/gallery-02-plaque.webp',label:'The plaque',alt:'The brown brick plinth up close, with a black plaque that reads 1983 India.'},
];

const titles=[['2007','The first T20 world title'],['2011','World champions again, at home'],['2013','A one-day world title in England'],['2024','A second T20 world title'],['2025','A one-day world title, and the women’s first'],['2026','A third T20 world title, at home']];

function NoChance(){
 return <><section className="tr-odds" aria-labelledby="tr-odds-heading"><div className="wrap tr-odds-inner">
  <div className="tr-odds-copy"><h2 id="tr-odds-heading" className="tr-opening"><span className="tr-qmark">“</span>Like people says, taste the success once… tongue want more.<span className="tr-qmark">”</span></h2><p className="tr-opening-cite">The captain to his team, 1983</p>
   <ol className="tr-timeline">
    <li><span className="tr-when">Before 1983</span><p><strong>One win in two world tournaments.</strong> Bookmakers put India at 66 to 1.</p></li>
    <li className="tr-turn"><span className="tr-when">25 June 1983</span><p><strong>183 was enough.</strong> India bowled out the champions for 140.</p></li>
    <li><span className="tr-when">Since then</span><p><strong>They wanted more.</strong></p><ul className="tr-titles">{titles.map(([y,t])=><li key={y}><b>{y}</b><span>{t}</span></li>)}</ul></li>
   </ol></div>
 </div></section><SetFilm name="trophy-odds" caption="66 to 1, and still they won."/></>;
}


function ThankYou(){
 return <><section className="tr-began" aria-labelledby="tr-began-heading">
  <div className="tr-began-banner"><SetPhoto image="/1983-trophy/banner-thank-you.webp" alt="A team of Indian cricketers in cream sweaters, seen from behind with their arms around each other on a pavilion balcony in golden evening light." sizes="100vw"/></div>
  <div className="tr-began-copy"><h2 id="tr-began-heading">Thank you, 1983.</h2><p className="tr-lead">Fourteen players. Three wins nobody saw coming.</p><p>They taught a country to believe.</p><figure className="tr-finale"><blockquote><span className="tr-qmark">“</span>We here to win… to win the World Cup, what else we here for?<span className="tr-qmark">”</span></blockquote><figcaption>The captain, to the press, June 1983</figcaption></figure></div>
 </section><SetFilm name="trophy-1890" caption="The trophy’s story."/></>;
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
  {/* Owner note, 26 Nov 2026: the players' photo comes straight after the top. */}
  <ThankYou/>
  <NoChance/>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
