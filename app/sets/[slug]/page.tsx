import {ProductDetail} from '@/components/taksh/product-detail';
import {notFound} from 'next/navigation';
import {Shell} from '@/components/taksh/shell';
import {BharatDetail} from '@/components/taksh/bharat';
import {YellowTaxiDetail} from '@/components/taksh/yellow-taxi';
import {RamMandirDetail} from '@/components/taksh/ram-mandir';
import {NonsenseDetail} from '@/components/taksh/nonsense';
import {ChandrayaanDetail} from '@/components/taksh/chandrayaan';
import {PadmaDetail} from '@/components/taksh/padma';
import {Trophy1983Detail} from '@/components/taksh/trophy-1983';
import {SurajmukhiDetail} from '@/components/taksh/surajmukhi';
import {SiteLink} from '@/components/taksh/site-link';
import {catalogueProducts as products,pageMeta,origin} from '@/lib/shop';
const ramDescription='Bring a little of Ayodhya home. Build the temple hall by hall, from the first step to the saffron flag.';
const ramShareDescription='The Ram Mandir of Ayodhya in about 1,500 bricks. Stone locked into stone, built piece by piece.';
async function productMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=products.find(p=>p.slug===slug);
 if(!p)return pageMeta('Set not found','Find another build in the Taksh collection.');
 if(slug==='nonsense'){const meta=pageMeta(p.name,p.description);const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='ram-mandir'){const meta=pageMeta(p.name,ramShareDescription);const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='map-of-india'){const meta=pageMeta(p.name,'28 states, 8 union territories and 7 rivers, built one dot at a time. Tap the map to see why every state has its colour.');const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:2000,height:2000,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='1983-trophy'){const meta=pageMeta(p.name,"The cup India brought home from Lord's in 1983, in about 520 bricks: silver cup, two handles, brown plinth and plaque.");const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1600,height:1600,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='surajmukhi'){const meta=pageMeta(p.name,'Two brick sunflowers that face the sun by day and turn to each other by night. About 400 pieces.');const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1600,height:1600,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='padma'){const meta=pageMeta(p.name,'Three brick lotuses on a gold lotus seat. A real lotus lasts about three days; this one stays. About 240 pieces.');const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1600,height:1600,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='yellow-taxi'){const meta=pageMeta(p.name,"Kolkata's yellow Ambassador taxi in about 350 bricks. Luggage on the roof, marigolds on the grille, 1962 on the plate.");const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug!=='chandrayaan-3')return pageMeta(p.name,p.description);
 const description='Build Vikram, Pragyan and a piece of the lunar surface. About 1,250 pieces.';
 const meta=pageMeta(p.name,description);const image=origin+'/chandrayaan/gallery-01-hero.webp';
 return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:'Chandrayaan-3 brick lander and rover on a lunar base'}]},twitter:{...meta.twitter,images:[image]}};
}
export async function generateMetadata(args:{params:Promise<{slug:string}>}){const {slug}=await args.params;return {...await productMetadata(args),alternates:{canonical:origin+'/sets/'+slug}}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const p=products.find(p=>p.slug===slug);if(!p)notFound();return <Shell hideAnnouncement={['chandrayaan-3','ram-mandir','yellow-taxi','map-of-india','nonsense','padma','1983-trophy','surajmukhi'].includes(p.slug)} hideFloatingContact={['chandrayaan-3','ram-mandir','yellow-taxi','map-of-india','nonsense','padma','1983-trophy','surajmukhi'].includes(p.slug)}>{p.slug==='nonsense'?<NonsenseDetail p={p}/>:p.slug==='padma'?<PadmaDetail p={p}/>:p.slug==='1983-trophy'?<Trophy1983Detail p={p}/>:p.slug==='surajmukhi'?<SurajmukhiDetail p={p}/>:p.slug==='map-of-india'?<BharatDetail p={p}/>:p.slug==='yellow-taxi'?<YellowTaxiDetail p={p}/>:p.slug==='ram-mandir'?<RamMandirDetail p={{...p,description:ramDescription}}/>:p.slug==='chandrayaan-3'?<ChandrayaanDetail p={p}/>:<ProductDetail p={p}/>}<div className="product-return"><SiteLink href="/sets">See all sets</SiteLink></div></Shell>}
