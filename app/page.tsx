import {Shell} from '@/components/taksh/shell';
import {SiteLink} from '@/components/taksh/site-link';
import {HomeHero} from '@/components/taksh/home-hero';
import {ProductGrid} from '@/components/taksh/cards';
import {products,origin} from '@/lib/shop';
import {imageAsset} from '@/lib/images';
const description="Brick building sets that tell India's stories. Chandrayaan-3, Ram Mandir, the Map of India, the Yellow Taxi and more.";
export const metadata={title:'Taksh | What you build, builds you.',description,alternates:{canonical:'/'},openGraph:{title:'Taksh | What you build, builds you.',description,images:[{url:origin+imageAsset('/chandrayaan/ad-moon-banner.webp'),width:1672,height:941}]},twitter:{card:'summary_large_image' as const,images:[origin+imageAsset('/chandrayaan/ad-moon-banner.webp')]}};
export default function Home(){return <Shell><HomeHero/><section id="sets" className="home-sets"><div className="wrap home-sets-inner"><h2>Find your next build.</h2><div className="home-set-group"><p className="set-group-label">MASTERS · OVER 1,000 PIECES</p><ProductGrid items={products.filter(p=>p.level==='Master').slice(0,3)}/></div><div className="home-set-group craft-group"><p className="set-group-label">CRAFT · UNDER 1,000 PIECES</p><ProductGrid items={['surajmukhi','1983-trophy','padma'].map(slug=>products.find(p=>p.slug===slug)!)}/></div><div className="home-all-sets"><SiteLink className="button outline" href="/sets">See all sets</SiteLink></div></div></section></Shell>}
