import {notFound} from 'next/navigation';
import {Shell} from '@/components/taksh/shell';
import {SiteLink} from '@/components/taksh/site-link';
import {catalogueProducts as products,pageMeta,origin} from '@/lib/shop';
import type {ReactNode} from 'react';
const ramDescription='Bring a little of Ayodhya home. Build the temple hall by hall, from the first step to the saffron flag.';
const ramShareDescription='The Ram Mandir of Ayodhya in about 1,500 bricks. Stone locked into stone, built piece by piece.';
async function productMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=products.find(p=>p.slug===slug);
 if(!p)return pageMeta('Set not found','Find another build in the Taksh collection.');
 if(slug==='nonsense'){const meta=pageMeta(p.name,p.description);const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='ram-mandir'){const meta=pageMeta(p.name,ramShareDescription);const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='map-of-india'){const meta=pageMeta(p.name,'28 states, 8 union territories and 7 rivers, built one dot at a time. Tap the map to see why every state has its colour.');const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:2000,height:2000,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug==='yellow-taxi'){const meta=pageMeta(p.name,"Kolkata's yellow Ambassador taxi in about 350 bricks. Luggage on the roof, marigolds on the grille, 1962 on the plate.");const image=origin+p.image;return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:p.imageAlt}]},twitter:{...meta.twitter,images:[image]}}}
 if(slug!=='chandrayaan-3')return pageMeta(p.name,p.description);
 const description='Build Vikram, Pragyan and a piece of the lunar surface. About 1,250 pieces.';
 const meta=pageMeta(p.name,description);const image=origin+'/chandrayaan/gallery-01-hero.webp';
 return {...meta,openGraph:{...meta.openGraph,images:[{url:image,width:1254,height:1254,alt:'Chandrayaan-3 brick lander and rover on a lunar base'}]},twitter:{...meta.twitter,images:[image]}};
}
export async function generateMetadata(args:{params:Promise<{slug:string}>}){const {slug}=await args.params;return {...await productMetadata(args),alternates:{canonical:origin+'/sets/'+slug}}}

export function productForSlug(slug:string){const p=products.find(p=>p.slug===slug);if(!p)notFound();return p}
export function ProductFrame({slug,children}:{slug:string;children:ReactNode}){return <Shell hideAnnouncement={['chandrayaan-3','ram-mandir','yellow-taxi','map-of-india','nonsense'].includes(slug)} hideFloatingContact={['chandrayaan-3','ram-mandir','yellow-taxi','map-of-india','nonsense'].includes(slug)}>{children}<div className="product-return"><SiteLink href="/sets">See all sets</SiteLink></div></Shell>}
