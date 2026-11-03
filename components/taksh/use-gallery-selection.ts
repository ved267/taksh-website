'use client';
import {useEffect,useMemo,useState} from 'react';
import {createImageSelection} from '@/lib/experience-domain.mjs';
import {createDecodedImageCache} from '@/lib/decoded-image-cache.mjs';
import {imageAsset,imageSrcSet} from '@/lib/images';
export function useGallerySelection(images:string[],sizes:string,initialIndex=0){
 const [index,setIndex]=useState(initialIndex),[resolved,setResolved]=useState<{src:string;sizes:string}>(),[status,setStatus]=useState('ready');
 const load=useMemo(()=>createDecodedImageCache((request:{index:number;src:string;sizes:string})=>new Promise<string>((resolve,reject)=>{
  const image=new Image();image.onload=async()=>{try{await image.decode();resolve(image.currentSrc||image.src)}catch{reject(new Error('Image unavailable'))}};let fallback=false;image.onerror=()=>{if(!fallback&&image.srcset.includes('.avif')){fallback=true;image.srcset='';image.src=imageAsset(request.src);return}reject(new Error('Image unavailable'))};
  image.sizes=request.sizes;image.srcset=imageSrcSet(request.src)||'';image.src=imageAsset(request.src);
 })),[]);
 const selection=useMemo(()=>createImageSelection(load,(request:{index:number;sizes:string},src:string)=>{setIndex(request.index);setResolved({src,sizes:request.sizes})},setStatus),[]);
 useEffect(()=>()=>selection.cancel(),[selection]);
 // Let the browser select a fresh candidate when the viewport or viewer changes.
 useEffect(()=>{const resize=()=>setResolved(undefined);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[]);
 const resolvedSrc=resolved?.sizes===sizes?resolved.src:undefined;
 const request=(i:number)=>({index:i,src:images[i],sizes,viewportWidth:window.innerWidth,pixelRatio:window.devicePixelRatio});
 return {index,resolvedSrc,status,warm:(next:number)=>load(request(next)).catch(()=>undefined),change:(next:number)=>{const i=(next+images.length)%images.length;return selection.select(request(i))}};
}
