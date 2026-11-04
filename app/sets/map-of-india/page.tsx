import {BharatDetail} from '@/components/taksh/bharat';
import {ProductFrame,productForSlug,generateMetadata as metadata} from '../_product-page';
const slug='map-of-india';
export function generateMetadata(){return metadata({params:Promise.resolve({slug})})}
export default function Page(){return <ProductFrame slug={slug}><BharatDetail p={productForSlug(slug)}/></ProductFrame>}
