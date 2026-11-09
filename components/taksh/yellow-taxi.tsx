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
import './yellow-taxi.css';

const photo=(name:string)=>`/yellow-taxi/${name}.webp`;
const gallery:PhotoInfo[]=[
 {image:photo('gallery-01-hero'),label:'Yellow Taxi',alt:'A yellow brick taxi with a blue stripe, luggage on the roof and marigolds on the grille.'},
 {image:photo('gallery-02-front'),label:'The front',alt:'The brick taxi from the front, with the plate WBT 1962.'},
 {image:photo('gallery-03-inside'),label:'Get in.',alt:'The brick taxi with its roof lifted off and its bonnet open.'},
 {image:photo('gallery-04-roof-luggage'),label:'On the roof.',alt:'A tin trunk, a suitcase and a bedding roll on the roof carrier.'},
 {image:photo('gallery-05-dashboard'),label:'On the dashboard.',alt:'The cabin: steering wheel on the right, a fare meter and a clay cup on the dashboard.'},
 {image:photo('gallery-06-in-a-real-taxi'),label:'Where to?',alt:"The brick taxi on the dashboard of a real taxi, beside the driver's hand on the wheel."},
 {image:photo('gallery-07-dimensions'),label:'Size and space.',alt:'The brick taxi with its size: about 17 cm long, 8 cm wide and 9 cm tall.'},
];

export function YellowTaxiDetail({p}:{p:Product}){
 const [qty,setQty]=useState(1);
 const buyRef=useRef<HTMLButtonElement>(null),contactRef=useRef<HTMLDivElement>(null);
 const {add,ready}=useStore();const {sticky,headerHeight}=useStickyPurchase(buyRef,contactRef);
 useEffect(()=>{track('ViewContent',{content_ids:[p.setNumber],content_name:p.name,value:p.price})},[p]);
 return <div className="rm-page yt-page" style={{'--rm-header-height':`${headerHeight}px`} as CSSProperties}>
  <div className="wrap rm-opening"><nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span><span>Yellow Taxi</span></nav>
   <div className="rm-product-layout"><SetGallery photos={gallery} name="Yellow Taxi"/><SetBuyBox p={p} qty={qty} setQty={setQty} buyRef={buyRef} contactRef={contactRef} ready={ready} onAdd={()=>add(p,qty)} showPaymentNote={false}/></div>
  </div>
  <section className="yt-inside yt-section" aria-labelledby="yt-inside-heading"><div className="wrap">
   <h2 id="yt-inside-heading">Get in.</h2>
   <div className="yt-look-around">
    <figure className="yt-roof"><SetPhoto {...gallery[3]} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 31vw, 422px"/><figcaption><h3>On the roof.</h3><p>A tin trunk, a suitcase and a bedding roll. The train journey is over. The taxi ride begins.</p></figcaption></figure>
    <figure className="yt-dashboard"><SetPhoto {...gallery[4]} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 31vw, 422px"/><figcaption><h3>On the dashboard.</h3><p>A clay cup of tea beside the fare meter. A box of sweets on the back seat.</p></figcaption></figure>
    <figure className="yt-bonnet"><SetPhoto {...gallery[2]} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 31vw, 422px"/><figcaption><h3>Under the bonnet.</h3><p>Lift the bonnet to see the engine. Simple to mend, the Ambassador kept its drivers on the road for decades.</p></figcaption></figure>
   </div>
  </div></section>
  <section className="yt-night" aria-labelledby="yt-taxi-heading">
   <SetPhoto image={photo('ad-night-banner')} alt="A yellow brick taxi under a street lamp on a dark, wet street with tram rails." large/>
   <div className="wrap yt-night-overlay"><div className="yt-night-copy"><h2 id="yt-taxi-heading">Taxi!</h2><p>In 1962, the Ambassador became Calcutta’s taxi. It wore yellow so you could spot it even from afar.</p><p className="yt-plate-note">Your model carries that year on its plate: WBT 1962.</p></div></div>
  </section>
  <section className="yt-history" aria-labelledby="yt-history-heading">
   <div className="wrap yt-history-layout">
    <figure className="yt-history-photo"><SetPhoto {...gallery[5]} sizes="(max-width: 960px) calc(100vw - 40px), (max-width: 1440px) 57vw, 768px"/><figcaption><h2 id="yt-history-heading">Last stop.</h2></figcaption></figure>
    <div className="yt-history-copy">
     <p>At Uttarpara in West Bengal, just outside Calcutta, Hindustan Motors built the Ambassador for fifty-seven years, from 1957 to 2014.</p>
     <p>Production stopped in May 2014. The yellow Ambassadors still working in Kolkata are due off the road by the end of 2027.</p>
    </div>
   </div>
   <p className="wrap yt-closing">Soon there will be none left to hail.<br/>{' '}You can still build one.</p>
  </section>
  <section className="yt-story" aria-label="The Ambassador">
   <figure className="yt-victoria">
    <SetPhoto image={photo('ad-victoria-banner')} alt="A yellow brick taxi driving past the Victoria Memorial in a sepia photograph." large/>
   </figure>
   <div className="wrap rm-real-temple"><p>The same Ambassador, painted white, carried India’s prime ministers for decades. In yellow, it carried everyone else.</p></div>
  </section>
  <section className="wrap rm-specs" aria-labelledby="yt-size-heading"><h2 id="yt-size-heading">Size and space.</h2><dl><div><dt>Length</dt><dd>About 17 cm</dd></div><div><dt>Width</dt><dd>About 8 cm</dd></div><div><dt>Height with the luggage</dt><dd>About 9 cm</dd></div></dl><div className="rm-real-temple"><p>About as long as your hand. It sits on a desk, a shelf or a windowsill.</p></div><p className="rm-disclaimer">A simplified brick model inspired by the yellow Ambassador taxis of Kolkata. It is not an exact scale replica and is not made by, affiliated with or endorsed by Hindustan Motors or the owners of the Ambassador name. The number plate is a tribute, not a real registration. The street scenes on this page are imagined; the model shown in them is the Taksh set.</p></section>
  {sticky&&<SetStickyBar p={p} ready={ready} onAdd={()=>add(p,qty)}/>}
 </div>;
}
