import {Shell} from '@/components/taksh/shell';
import {GullyCricketDetail} from '@/components/taksh/gully-cricket';
import {SiteLink} from '@/components/taksh/site-link';
import {products,pageMeta,origin} from '@/lib/shop';
import {gullyDescription} from '@/lib/gully-cricket.mjs';
const p=products.find(p=>p.slug==='gully-cricket')!;
const meta=pageMeta('Gully Cricket',gullyDescription);
export const metadata={...meta,alternates:{canonical:origin+'/sets/gully-cricket'},openGraph:{...meta.openGraph,images:[{url:origin+p.image,width:1448,height:1086,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[origin+p.image]}};
export default function Page(){return <Shell hideFloatingContact><GullyCricketDetail p={p}/><div className="product-return"><SiteLink href="/sets">See all sets</SiteLink></div></Shell>}
