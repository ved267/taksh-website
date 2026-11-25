'use client';
import {SiteLink} from './site-link';
import {ProductGrid} from './cards';
import {useStore} from './store';
import {products,productMoney,type Product} from '@/lib/shop';
import './set-ending.css';

// The end of every set page (owner decision, 25 Nov 2026): Size and space where the page has none,
// one closing line with Add to bag, then three other sets. Padma and 1983 Trophy close inside their own story.
const closing:Record<string,string>={
 'map-of-india':'Keep a little India close.',
 'chandrayaan-3':'Bring the landing home.',
 'ram-mandir':'Bring a little of Ayodhya home.',
 'gully-cricket':'Bas ek over aur.',
 'yellow-taxi':'Your taxi is waiting.',
 'nonsense':'See the world a little differently.',
 'surajmukhi':'Two sunflowers. Build one each.',
 'kamdhenu':'Bring her home.'
};
type Size={rows:[string,string][];note:string};
const sizes:Record<string,Size>={
 'nonsense':{rows:[['Width','About 15 cm'],['Depth','About 17 cm'],['Height','About 11 cm']],note:'Life-size. It sits on a desk or a bedside table.'},
 'padma':{rows:[['Height','About 28 cm'],['Width','About 19 cm'],['Base','About 13 cm across']],note:'It fits a mandir shelf or a side table.'},
 '1983-trophy':{rows:[['Height','About 21 cm'],['Width','About 13 cm'],['Plinth','About 8 cm across']],note:'It sits on a desk or a showcase shelf.'},
 'surajmukhi':{rows:[['Height','About 38 cm per flower']],note:'Stand them in a bottle or a vase (not included).'},
 'kamdhenu':{rows:[['Length','About 32 cm'],['Height','About 23 cm']],note:'She fits a mandir shelf or a side table.'}
};
// Same level first, then the rest, in catalogue order after this set.
function related(p:Product){const i=products.findIndex(x=>x.slug===p.slug),rest=[...products.slice(i+1),...products.slice(0,i)].filter(x=>!x.catalogueOnly);return [...rest.filter(x=>x.level===p.level),...rest.filter(x=>x.level!==p.level)].slice(0,3)}
export function SetEnding({p}:{p:Product}){
 const{add,ready}=useStore();const line=closing[p.slug],size=sizes[p.slug];
 return <>
  {size&&<section className="wrap se-size" aria-labelledby="se-size-heading"><h2 id="se-size-heading">Size and space.</h2><dl>{size.rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p>{size.note}</p></section>}
  {line&&<section className="wrap se-close" aria-label={'Bring home '+p.name}><h2>{line}</h2><button className="button primary" disabled={!ready} aria-label={`Add ${p.name} to bag`} onClick={()=>add(p)}>Add to bag · {productMoney(p)}</button></section>}
  <section className="wrap se-more" aria-labelledby="se-more-heading"><h2 id="se-more-heading">Build another.</h2><ProductGrid items={related(p)} editorial={false}/><div className="product-return"><SiteLink href="/sets">See all sets</SiteLink></div></section>
 </>;
}
