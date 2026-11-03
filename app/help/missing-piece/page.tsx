import {products} from '@/lib/shop';
import {Shell} from '@/components/taksh/shell';import {MissingPiece} from '@/components/taksh/help';import {pageMeta} from '@/lib/shop';
export const metadata=pageMeta('Missing a piece?','We’ll send a missing piece free. Tell us your set and the piece you need.');export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){const s=await searchParams;return <Shell><MissingPiece initialSet={products.some(p=>p.slug===s.set)?s.set:''}/></Shell>}
