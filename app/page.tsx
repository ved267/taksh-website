import {Shell} from '@/components/taksh/shell';
import {SiteLink} from '@/components/taksh/site-link';
import {HomeHero} from '@/components/taksh/home-hero';
import {ProductGrid} from '@/components/taksh/cards';
import {products,origin} from '@/lib/shop';
import {imageAsset} from '@/lib/images';
const description="Brick building sets that tell India's stories. Chandrayaan-3, Ram Mandir, the Map of India, the Yellow Taxi and more.";
export const metadata={title:'Taksh | What you build, builds you.',description,alternates:{canonical:'/'},openGraph:{title:'Taksh | What you build, builds you.',description,images:[{url:origin+imageAsset('/chandrayaan/ad-moon-banner.webp'),width:1672,height:941}]},twitter:{card:'summary_large_image' as const,images:[origin+imageAsset('/chandrayaan/ad-moon-banner.webp')]}};
// Every set on the home page: Masters first, then Craft with the newest at the front. A set not listed here still shows, at the end of its group.
const craftOrder=['kamdhenu','surajmukhi','padma','1983-trophy','gully-cricket','yellow-taxi','nonsense'];
const rank=(slug:string)=>{const i=craftOrder.indexOf(slug);return i<0?craftOrder.length:i};
const masters=products.filter(p=>p.level==='Master'&&!p.catalogueOnly);
const craft=products.filter(p=>p.level==='Craft'&&!p.catalogueOnly).sort((a,b)=>rank(a.slug)-rank(b.slug));
export default function Home(){return <Shell><HomeHero/><section id="sets" className="home-sets"><div className="wrap home-sets-inner"><h2>Find your next build.</h2><div className="home-set-group masters-group"><p className="set-group-label">MASTERS · OVER 1,000 PIECES</p><ProductGrid items={masters} editorial={false}/></div><div className="home-set-group craft-group"><p className="set-group-label">CRAFT · UNDER 1,000 PIECES</p><ProductGrid items={craft} editorial={false}/></div><div className="home-all-sets"><SiteLink className="button outline" href="/sets">See all sets</SiteLink></div></div></section></Shell>}
