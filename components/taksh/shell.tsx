'use client';
import {useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {Menu,ShoppingBag} from 'lucide-react';
import {SiteLink} from './site-link';
import {Logo} from './visuals';
import {useStore} from './store';
import {AnalyticsChoices} from './analytics-consent';
import {brand,products,origin} from '@/lib/shop';
const nav=[['Sets','/sets'],['Quality','/quality'],['Help','/help']];
export function ContactLink({kind='whatsapp',children,className='',share=false}:{kind?:'whatsapp'|'instagram'|'email',children:React.ReactNode,className?:string,share?:boolean}){
 const path=usePathname();const config=brand[kind];const valid=share||!config.includes('[');
 const set=products.find(p=>path==='/sets/'+p.slug)?.name;
 const fallback='/help/contact?channel='+kind+'&from='+encodeURIComponent(path);
 const href=!valid?fallback:kind==='instagram'?`https://instagram.com/${config}`:kind==='email'?`mailto:${config}`:`https://wa.me/${share?'':config}?text=${encodeURIComponent(share?`Look at this Taksh set: ${origin}${path}`:set?`Hi Taksh, I have a question about ${set}`:'Hi Taksh, I have a question.')}`;
 return <SiteLink className={className} href={href} target={valid&&kind!=='email'?'_blank':undefined} rel={valid?'noopener noreferrer':undefined}>{children}</SiteLink>
}

export function Header({}:{hideAnnouncement?:boolean}){const{count,ready}=useStore();const path=usePathname();const menu=useRef<HTMLDetailsElement>(null);const [menuOpen,setMenuOpen]=useState(false);return <><SiteLink className="skip-link" href="#main">Skip to content</SiteLink><header className="header"><div className="header-inner"><Logo reversed/><nav aria-label="Main navigation">{nav.map(([label,href])=><SiteLink href={href} key={href} aria-current={path===href?'page':path.startsWith(href+'/')?'location':undefined}>{label}</SiteLink>)}</nav><SiteLink href="/bag" className="header-bag" aria-label={ready?`Bag, ${count} ${count===1?'item':'items'}`:'Bag'}><ShoppingBag size={21}/><span className="bag-count" aria-hidden="true" style={{visibility:ready?'visible':'hidden'}}>{count}</span></SiteLink>{(path==='/'||path==='/sets')&&<ContactLink className="icon-button mobile-only header-contact"><WhatsAppIcon/><span className="sr-only">Chat on WhatsApp</span></ContactLink>}<details ref={menu} className="phone-menu mobile-only" onToggle={e=>setMenuOpen(e.currentTarget.open)} onKeyDown={e=>{if(e.key==='Escape'&&menu.current?.open){e.preventDefault();menu.current.open=false;menu.current.querySelector('summary')?.focus()}}}><summary className="icon-button" aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen}><Menu/></summary><nav aria-label="Phone navigation">{nav.map(([label,href])=><SiteLink href={href} key={href} aria-current={path===href?'page':path.startsWith(href+'/')?'location':undefined} onClick={()=>{if(menu.current)menu.current.open=false}}>{label}</SiteLink>)}</nav></details></div></header></>}
// Owner note, 26 Nov 2026: a short, quiet footer. One line, one row of links, one line of small print.
export function Footer(){return <footer className="footer"><div className="wrap footer-slim"><h2 className="footer-line">What you build, builds you.</h2><nav className="footer-links" aria-label="More from Taksh"><ContactLink kind="instagram">Instagram</ContactLink><ContactLink>WhatsApp</ContactLink><SiteLink href="/returns">Returns</SiteLink><SiteLink href="/help">Help</SiteLink><SiteLink href="/privacy">Privacy</SiteLink><AnalyticsChoices/></nav><p className="footer-fine">© 2026 Taksh. An independent brand, not affiliated with any other brick maker. Taksh bricks fit other leading brick brands.</p></div></footer>}
export function Shell({children,hideFloatingContact=false}:{children:React.ReactNode;hideAnnouncement?:boolean;hideFloatingContact?:boolean}){return <><Header/><main id="main">{children}</main><Footer/>{!hideFloatingContact&&<FloatingContact/>}</>}

function FloatingContact(){const path=usePathname();if(path==='/checkout')return null;return <ContactLink className={`floating-whatsapp ${path.startsWith('/sets/')?'on-product':''} ${path==='/'||path==='/sets'?'on-browse':''}`}><WhatsAppIcon/><span className="sr-only">Chat with Taksh on WhatsApp</span></ContactLink>}

function WhatsAppIcon(){return <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.6 11.6a8.7 8.7 0 0 1-12.9 7.6L3 20.5l1.3-4.6a8.7 8.7 0 1 1 16.3-4.3Z"/><path d="M8.5 7.5c-.8.3-1 1.5-.5 2.6 1 2.4 3 4.4 5.4 5.2 1 .4 2.2-.1 2.6-1l-2.3-1.5-.9 1c-1.5-.6-2.7-1.8-3.3-3.2l.8-.9-1.2-2.2Z"/></svg>}
