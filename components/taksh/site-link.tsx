'use client';
import {useRouter} from 'next/navigation';
import {useCallback,useEffect,useRef,type ComponentProps} from 'react';

// Warm only a likely destination, not every link or its image gallery.
// Keep native anchor semantics and avoid this Vinext release's next/link shim.
export function SiteLink({href,onClick,onPointerEnter,onFocus,onTouchStart,preload=false,...props}:ComponentProps<'a'>&{preload?:boolean}){
 const router=useRouter();
 const anchor=useRef<HTMLAnchorElement>(null);
 const internal=!!href?.startsWith('/')&&!href.startsWith('//')&&!href.startsWith('/api/')&&!props.download&&(!props.target||props.target==='_self');
 const prepare=useCallback(()=>{
  if(!internal||!href)return;
  const connection=(navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string}}).connection;
  if(connection?.saveData||connection?.effectiveType?.includes('2g'))return;
  const path=href.split('#')[0];
  if(path===location.pathname+location.search)return;
  // Full prefetch also prepares the selected product's client code for navigation.
  // Vinext supports this option for dynamic routes; it is not in Next's public type.
  router.prefetch(path,{kind:'full'} as Parameters<typeof router.prefetch>[1]);
 },[href,internal,router]);
 useEffect(()=>{
  if(!preload||!anchor.current)return;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const observer=new IntersectionObserver(entries=>{
   clearTimeout(timer);
   if(entries.some(entry=>entry.isIntersecting))timer=setTimeout(prepare,250);
  });
  observer.observe(anchor.current);
  return()=>{clearTimeout(timer);observer.disconnect()};
 },[preload,prepare]);
 return <a ref={anchor} href={href} {...props}
  onPointerEnter={event=>{onPointerEnter?.(event);if(!event.defaultPrevented)prepare()}}
  onFocus={event=>{onFocus?.(event);if(!event.defaultPrevented)prepare()}}
  onTouchStart={event=>{onTouchStart?.(event);if(!event.defaultPrevented)prepare()}}
  onClick={event=>{
   onClick?.(event);
   if(event.currentTarget.hasAttribute('download')||!internal||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   // Same-page anchors scroll natively; cross-page anchors reuse the app shell.
   if(href!.includes('#')&&href!.split('#')[0]===location.pathname+location.search)return;
   event.preventDefault();router.push(href!);
  }}/>
}
