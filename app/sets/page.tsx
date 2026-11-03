import {Shell} from '@/components/taksh/shell';
import {SiteLink} from '@/components/taksh/site-link';
import {Catalogue} from '@/components/taksh/catalogue';
import {pageMeta} from '@/lib/shop';
export const metadata=pageMeta('All sets',"Find your next Taksh build. Explore the full range of Masters and Craft sets.");
export default function Page(){return <Shell><section className="wrap all-sets"><div className="breadcrumb"><SiteLink href="/">Home</SiteLink><span>/</span>All sets</div><h1>Find your next build.</h1><Catalogue/></section></Shell>}
