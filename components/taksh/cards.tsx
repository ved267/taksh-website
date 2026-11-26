'use client';
import {type CSSProperties} from 'react';
import {StockNotice} from './stock-notice';
import {ProductPhoto} from './product-photo';
import {SiteLink} from './site-link';
import {useStore} from './store';
import {productMoney,pieceLabel,type Product} from '@/lib/shop';
import {imageAsset,imageSrcSet} from '@/lib/images';
// Owner note, 26 Nov 2026: cards stay on the plain backdrop, two to a row; each model is scaled to its measured outline so it fills the card.
const cardZoom:Record<string,string>={'chandrayaan-3':'scale(1.25)','ram-mandir':'scale(1.15) translate(1%,2%)','map-of-india':'scale(1.07)','gully-cricket':'scale(1.11)','yellow-taxi':'scale(1.13)','nonsense':'scale(1.03)','padma':'scale(1.12) translate(-2%,-0%)','1983-trophy':'scale(1.07) translate(11%,-1%)','surajmukhi':'scale(1.14)'};
export function ProductCard({p,editorial=true,large=false}:{p:Product;editorial?:boolean;large?:boolean}){
 const{add,ready}=useStore();
 const map=editorial&&p.slug==='map-of-india',photo=p.image||'';
 return <article className={`set-card${map?' set-card-map':''}`} data-set={p.slug}>
  <SiteLink className="set-card-link" href={'/sets/'+p.slug} aria-label={`View ${p.name}`}>
   <div className="set-card-image"><ProductPhoto rootMargin="80px 0px" src={imageAsset(photo,'medium')} srcSet={imageSrcSet(photo)} style={cardZoom[p.slug]?{'--z':cardZoom[p.slug]} as CSSProperties:undefined} sizes={map||large?'(max-width:760px) calc(100vw - 40px), (max-width:1200px) 30vw, 350px':'(max-width:760px) calc((100vw - 52px) / 2), (max-width:1200px) 30vw, 350px'} alt={p.imageAlt||p.name} width={700} height={700} decoding="async"/></div>
   <h3>{p.shortName||p.name}</h3><p className="set-card-pieces">{pieceLabel(p)} pieces</p><strong className="set-card-price">{productMoney(p)}</strong>
  </SiteLink>
  <StockNotice compact/><button className="button primary full" disabled={!ready} aria-label={`Add ${p.name} to bag`} onClick={()=>add(p)}>Add to bag</button>
 </article>
}
export function ProductGrid({items,editorial=true,large=false}:{items:Product[];editorial?:boolean;large?:boolean}){return <div className={`set-card-grid${large?' set-card-grid-large':''}`}>{items.map(p=><ProductCard key={p.slug} p={p} editorial={editorial} large={large}/>)}</div>}
