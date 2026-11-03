import {Shell} from '@/components/taksh/shell';import {Bag} from '@/components/taksh/bag';import {pageMeta} from '@/lib/shop';
export const metadata=pageMeta('Your bag','Your next build starts here. Free delivery across India.');
export default function Page(){return <Shell><Bag/></Shell>}
