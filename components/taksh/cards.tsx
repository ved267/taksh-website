'use client';
import {StockNotice} from './stock-notice';
import {ProductPhoto} from './product-photo';
import {SiteLink} from './site-link';
import {useStore} from './store';
import {productMoney,pieceLabel,type Product} from '@/lib/shop';
import {imageAsset,imageSrcSet} from '@/lib/images';
export function ProductCard({p,editorial=true}:{p:Product;editorial?:boolean}){
 const{add,ready}=useStore();
 const map=editorial&&p.slug==='map-of-india';
 return <article className={`set-card${map?' set-card-map':''}`}>
  <SiteLink className="set-card-link" href={'/sets/'+p.slug} aria-label={`View ${p.name}`}>
   <div className="set-card-image"><ProductPhoto rootMargin="80px 0px" src={imageAsset(p.image||'','medium')} srcSet={imageSrcSet(p.image||'')} sizes={map?'(max-width:760px) calc(100vw - 40px), (max-width:1200px) 30vw, 350px':'(max-width:760px) calc((100vw - 52px) / 2), (max-width:1200px) 30vw, 350px'} alt={p.imageAlt||p.name} width={700} height={700} decoding="async"/></div>
   <h3>{p.shortName||p.name}</h3><p className="set-card-facts"><span>{pieceLabel(p)} pieces</span></p><strong className="set-card-price">{productMoney(p)}</strong>
  </SiteLink>
  <StockNotice compact/><button className="button primary full" disabled={!ready} aria-label={`Add ${p.name} to bag`} onClick={()=>add(p)}>Add to bag</button>
 </article>
}
export function ProductGrid({items,editorial=true}:{items:Product[];editorial?:boolean}){return <div className="set-card-grid">{items.map(p=><ProductCard key={p.slug} p={p} editorial={editorial}/>)}</div>}
