import {NonsenseDetail} from '@/components/taksh/nonsense';
import {ProductFrame,productForSlug,generateMetadata as metadata} from '../_product-page';
const slug='nonsense';
export function generateMetadata(){return metadata({params:Promise.resolve({slug})})}
export default function Page(){return <ProductFrame slug={slug}><NonsenseDetail p={productForSlug(slug)}/></ProductFrame>}
