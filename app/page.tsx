import {Shell} from '@/components/taksh/shell';
import {SiteLink} from '@/components/taksh/site-link';
import {HomeHero} from '@/components/taksh/home-hero';
import {ProductGrid} from '@/components/taksh/cards';
import {products,origin} from '@/lib/shop';
import {imageAsset,imageSrcSet} from '@/lib/images';
const share='/bharat/product-page/life-05-floor.jpg',together='/bharat/product-page/life-07-joining.jpg';
const description="Brick building sets that tell India's stories. Chandrayaan-3, Ram Mandir, the Map of India, the Yellow Taxi and more.";
export const metadata={title:'Taksh | What you build, builds you.',description,alternates:{canonical:'/'},openGraph:{title:'Taksh | What you build, builds you.',description,images:[{url:origin+imageAsset(share),width:1800,height:1200}]},twitter:{card:'summary_large_image' as const,images:[origin+imageAsset(share)]}};
// Every set on the home page: Masters first, then Craft with the newest at the front. A set not listed here still shows, at the end of its group.
const craftOrder=['kamdhenu','surajmukhi','padma','1983-trophy','gully-cricket','yellow-taxi','nonsense'];
const rank=(slug:string)=>{const i=craftOrder.indexOf(slug);return i<0?craftOrder.length:i};
const masters=products.filter(p=>p.level==='Master'&&!p.catalogueOnly);
const craft=products.filter(p=>p.level==='Craft'&&!p.catalogueOnly).sort((a,b)=>rank(a.slug)-rank(b.slug));
export default function Home(){return <Shell><HomeHero/><ul className="home-promises wrap" aria-label="Our promises"><li>Free delivery · 5–7 days</li><li>Unopened or damaged? Full refund</li><li>Missing piece? Sent free</li></ul><section id="sets" className="home-sets"><div className="wrap home-sets-inner"><h2>Find your next build.</h2><div className="home-set-group masters-group"><p className="set-group-label">MASTERS · OVER 1,000 PIECES</p><ProductGrid items={masters} editorial={false}/></div><div className="home-set-group craft-group"><p className="set-group-label">CRAFT · UNDER 1,000 PIECES</p><ProductGrid items={craft} editorial={false}/></div><div className="home-all-sets"><SiteLink className="button outline" href="/sets">See all sets</SiteLink></div></div></section><section className="home-why" aria-labelledby="home-why-heading"><div className="wrap home-why-inner"><img src={imageAsset(together,'medium')} srcSet={imageSrcSet(together)} sizes="(max-width:760px) calc(100vw - 40px), 560px" width={1800} height={1200} alt="A child's hands and a grown-up's hands joining two finished plates of the India map on a rug." loading="lazy" decoding="async"/><div><h2 className="home-why-label" id="home-why-heading">Why Taksh</h2><h3>Every set is a story you already know.</h3><h3>Built together, by every age.</h3><h3>Made to keep, long after it is built.</h3></div></div></section></Shell>}
