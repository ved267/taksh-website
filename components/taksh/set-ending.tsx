import {SiteLink} from './site-link';
import {products,productMoney,pieceLabel,type Product} from '@/lib/shop';
import {imageAsset,imageSrcSet} from '@/lib/images';
import {cardImage} from '@/lib/card-colours';
import './set-ending.css';

// The end of every set page: four other sets, nothing else (owner notes, 26 Nov 2026: buy only at the top
// and on the sticky bar; size lives in the "Size, delivery & returns" dropdown). Rendered on the server: no code ships.
// Owner note, 26 Nov 2026: Padma, Ram Mandir, Gully Cricket and the Map are the centre of attention; Ulta Chashma and Yellow Taxi last.
const order=['padma','ram-mandir','gully-cricket','map-of-india','chandrayaan-3','kamdhenu','surajmukhi','1983-trophy','yellow-taxi','nonsense'];
const rank=(slug:string)=>{const i=order.indexOf(slug);return i<0?order.length:i};
function related(p:Product){return products.filter(x=>x.slug!==p.slug&&!x.catalogueOnly).sort((a,b)=>rank(a.slug)-rank(b.slug)).slice(0,4)}
export function SetEnding({p}:{p:Product}){
 return <section className="wrap se-more" aria-labelledby="se-more-heading"><h2 id="se-more-heading">Build another.</h2><ul className="se-cards">{related(p).map(x=>{const photo=cardImage(x);return <li key={x.slug} data-set={x.slug}><SiteLink href={'/sets/'+x.slug}><img src={imageAsset(photo,'small')} srcSet={imageSrcSet(photo)} sizes="(max-width:760px) calc((100vw - 52px) / 2), 280px" width={700} height={700} alt={x.imageAlt||x.name} loading="lazy" decoding="async"/><h3>{x.shortName||x.name}</h3><p>{pieceLabel(x)} pieces</p><strong>{productMoney(x)}</strong></SiteLink></li>})}</ul><div className="product-return"><SiteLink href="/sets">See all sets</SiteLink></div></section>;
}
