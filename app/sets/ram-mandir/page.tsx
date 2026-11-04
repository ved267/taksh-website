import {RamMandirDetail} from '@/components/taksh/ram-mandir';
import {ProductFrame,productForSlug,generateMetadata as metadata} from '../_product-page';
const slug='ram-mandir';
export function generateMetadata(){return metadata({params:Promise.resolve({slug})})}
export default function Page(){return <ProductFrame slug={slug}><RamMandirDetail p={{...productForSlug(slug),description:'Bring a little of Ayodhya home. Build the temple hall by hall, from the first step to the saffron flag.'}}/></ProductFrame>}
