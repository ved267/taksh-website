'use client';
import {StockNotice} from './stock-notice';
import {ProductPhoto} from './product-photo';
import {SiteLink} from './site-link';
import {useStore} from './store';
import {productMoney,type Product} from '@/lib/shop';
import {imageAsset,imageSrcSet} from '@/lib/images';
// One feeling line per card (owner decision, 25 Nov 2026), the same words as the homepage hero; else the set's subtitle.
const cardLine:Record<string,string>={'map-of-india':'Keep a little India close.','chandrayaan-3':'The day we all watched the Moon.','ram-mandir':'Ayodhya, at home.','nonsense':'Nazariya badlo, nazara badlega.'};
// Owner note, 26 Nov 2026: sets should fill their card. Ram Mandir and Chandrayaan-3 show the model at home on a table;
// the studio shots are scaled to the set's measured outline so the model, not the backdrop, fills the frame.
const cardPhoto:Record<string,string>={'ram-mandir':'/ram-mandir/gallery-10-room.webp','chandrayaan-3':'/chandrayaan/gallery-12-room.webp'};
const cardZoom:Record<string,string>={'yellow-taxi':'scale(1.15)','padma':'scale(1.14)','surajmukhi':'scale(1.16)','1983-trophy':'scale(1.08) translateX(6%)','map-of-india':'scale(1.08)','gully-cricket':'scale(1.07)','nonsense':'scale(1.05)'};
export function ProductCard({p,editorial=true,large=false}:{p:Product;editorial?:boolean;large?:boolean}){
 const{add,ready}=useStore();
 const map=editorial&&p.slug==='map-of-india',home=cardPhoto[p.slug],photo=home||p.image||'';
 return <article className={`set-card${map?' set-card-map':''}`}>
  <SiteLink className="set-card-link" href={'/sets/'+p.slug} aria-label={`View ${p.name}`}>
   <div className="set-card-image"><ProductPhoto rootMargin="80px 0px" src={imageAsset(photo,'medium')} srcSet={imageSrcSet(photo)} style={home?{objectFit:'cover'}:cardZoom[p.slug]?{transform:cardZoom[p.slug]}:undefined} sizes={map||large?'(max-width:760px) calc(100vw - 40px), (max-width:1200px) 30vw, 350px':'(max-width:760px) calc((100vw - 52px) / 2), (max-width:1200px) 30vw, 350px'} alt={p.imageAlt||p.name} width={700} height={700} decoding="async"/></div>
   <h3>{p.shortName||p.name}</h3>{(cardLine[p.slug]||p.subtitle)&&<p className="set-card-line">{cardLine[p.slug]||p.subtitle}</p>}<strong className="set-card-price">{productMoney(p)}</strong>
  </SiteLink>
  <StockNotice compact/><button className="button primary full" disabled={!ready} aria-label={`Add ${p.name} to bag`} onClick={()=>add(p)}>Add to bag</button>
 </article>
}
export function ProductGrid({items,editorial=true,large=false}:{items:Product[];editorial?:boolean;large?:boolean}){return <div className={`set-card-grid${large?' set-card-grid-large':''}`}>{items.map(p=><ProductCard key={p.slug} p={p} editorial={editorial} large={large}/>)}</div>}
