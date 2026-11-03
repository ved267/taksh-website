import {SiteLink} from '@/components/taksh/site-link';
import {Shell} from '@/components/taksh/shell';
export default function NotFound(){return <Shell><div className="wrap not-found"><h1>This page isn’t here.</h1><SiteLink href="/" className="button primary">Back to home</SiteLink></div></Shell>}
