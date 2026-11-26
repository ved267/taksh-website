import {Shell} from '@/components/taksh/shell';
import {SiteLink} from '@/components/taksh/site-link';
import {HomeHero} from '@/components/taksh/home-hero';
import {ProductGrid} from '@/components/taksh/cards';
import {products,origin} from '@/lib/shop';
import {imageAsset} from '@/lib/images';
const share='/bharat/product-page/life-05-floor.jpg';
const description="Brick building sets that tell India's stories. Chandrayaan-3, Ram Mandir, the Map of India, the Yellow Taxi and more.";
export const metadata={title:'Taksh | What you build, builds you.',description,alternates:{canonical:'/'},openGraph:{title:'Taksh | What you build, builds you.',description,images:[{url:origin+imageAsset(share),width:1800,height:1200}]},twitter:{card:'summary_large_image' as const,images:[origin+imageAsset(share)]}};
// Every set on the home page: Masters first, then Craft with the newest at the front. A set not listed here still shows, at the end of its group.
// Owner note, 26 Nov 2026: Padma, Ram Mandir, Gully Cricket and the Map are the centre of attention; Ulta Chashma and Yellow Taxi come last.
const order=['padma','ram-mandir','gully-cricket','map-of-india','chandrayaan-3','kamdhenu','surajmukhi','1983-trophy','yellow-taxi','nonsense'];
const rank=(slug:string)=>{const i=order.indexOf(slug);return i<0?order.length:i};
const sets=products.filter(p=>!p.catalogueOnly).sort((a,b)=>rank(a.slug)-rank(b.slug));
export default function Home(){return <Shell><HomeHero/><section id="sets" className="home-sets"><div className="wrap home-sets-inner"><h2>Find your next build.</h2><div className="home-set-group"><ProductGrid items={sets} editorial={false}/></div><div className="home-all-sets"><SiteLink className="button outline" href="/sets">See all sets</SiteLink></div></div></section></Shell>}
