import type { Metadata } from 'next';
import './globals.css';
import './redesign.css';
import './home-storefront.css';
import './product-experience.css';
import {AnalyticsConsent} from '@/components/taksh/analytics-consent';
import {StoreProvider} from '@/components/taksh/store';
import {earlyInteractionScript} from '@/lib/early-interaction.mjs';
export const metadata: Metadata = {
 metadataBase: new URL('https://taksh.store'),
 title: 'Taksh | What you build, builds you.', description:'Brick building sets for every age. Build. Create. Imagine.',
 openGraph:{title:'Taksh | What you build, builds you.',description:'Brick building sets for every age.',images:[{url:'/og.png',width:1200,height:630}]},
 twitter:{card:'summary_large_image',images:['/og.png']},icons:{icon:'/favicon.png',apple:'/app-icon.png'}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-IN"><head><script dangerouslySetInnerHTML={{__html:earlyInteractionScript}}/><link rel="preload" href="/fonts/figtree.8330490a01c6.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/bricolage-grotesque.0648460bcf25.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body><StoreProvider>{children}<AnalyticsConsent/></StoreProvider></body></html>}
