import {Checkout} from '@/components/taksh/checkout';
import {Shell} from '@/components/taksh/shell';
import {pageMeta} from '@/lib/shop';
export const metadata={...pageMeta('Request availability','Save your Taksh selection and receive stock updates.'),robots:{index:false,follow:false}};
export default function Page(){return <Shell><Checkout/></Shell>}
