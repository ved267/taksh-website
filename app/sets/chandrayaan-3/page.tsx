import {ChandrayaanDetail} from '@/components/taksh/chandrayaan';
import {ProductFrame,productForSlug,generateMetadata as metadata} from '../_product-page';
const slug='chandrayaan-3';
export function generateMetadata(){return metadata({params:Promise.resolve({slug})})}
export default function Page(){return <ProductFrame slug={slug}><ChandrayaanDetail p={productForSlug(slug)}/></ProductFrame>}
