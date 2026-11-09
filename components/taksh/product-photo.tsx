'use client';
import {useEffect,useRef,useState,type ComponentProps} from 'react';

type PhotoProps=Omit<ComponentProps<'img'>,'loading'|'ref'|'alt'> & {alt:string;eager?:boolean;rootMargin?:string};

// Native lazy loading may start several screens ahead on a phone. Keep story
// photos out of the initial download queue, then give them a short head start.
export function ProductPhoto({eager=false,rootMargin='600px 0px',src,srcSet,alt,onError,...props}:PhotoProps){
 const image=useRef<HTMLImageElement>(null);
 const [near,setNear]=useState(eager);
 useEffect(()=>{
  if(eager||near)return;
  const node=image.current;if(!node)return;
  if(!('IntersectionObserver' in window)){const timer=setTimeout(()=>setNear(true),0);return()=>clearTimeout(timer)}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){setNear(true);observer.disconnect()}
  },{rootMargin});
  observer.observe(node);
  return()=>observer.disconnect();
 },[eager,near,rootMargin]);
 return <><img {...props} onError={e=>{const node=e.currentTarget;if(node.currentSrc.endsWith('.avif')&&typeof src==='string'&&src!==node.currentSrc){node.srcset='';node.src=src;return}onError?.(e)}} alt={alt} style={eager||near?props.style:{...props.style,background:'var(--tint)'}} ref={image} src={eager||near?src:'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} srcSet={eager||near?srcSet:undefined} loading={eager?'eager':'lazy'}/>{!eager&&<noscript><img {...props} alt={alt} src={src} srcSet={srcSet} loading="lazy"/></noscript>}</>;
}
