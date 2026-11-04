import {YellowTaxiDetail} from '@/components/taksh/yellow-taxi';
import {ProductFrame,productForSlug,generateMetadata as metadata} from '../_product-page';
const slug='yellow-taxi';
export function generateMetadata(){return metadata({params:Promise.resolve({slug})})}
export default function Page(){return <ProductFrame slug={slug}><YellowTaxiDetail p={productForSlug(slug)}/></ProductFrame>}
