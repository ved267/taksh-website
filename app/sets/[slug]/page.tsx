import {ProductDetail} from '@/components/taksh/product-detail';
import {ProductFrame,productForSlug,generateMetadata} from '../_product-page';
export {generateMetadata};
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <ProductFrame slug={slug}><ProductDetail p={productForSlug(slug)}/></ProductFrame>}
