'use client';
import {useGallerySelection} from './use-gallery-selection';
import {ProductPhoto} from './product-photo';
import {useEffect,useRef,useState,type PointerEvent,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {imageAsset,imageInfo,imageSrcSet} from '@/lib/images';
export type PhotoInfo={image:string;label:string;alt:string};
export function SetPhoto({image,alt,eager=false,large=false,sizes,className,resolvedSrc}:{image:string;alt:string;eager?:boolean;large?:boolean;sizes?:string;className?:string;resolvedSrc?:string}){
 const info=imageInfo(image);
 return <ProductPhoto eager={eager} className={className} src={resolvedSrc||imageAsset(image)} srcSet={resolvedSrc?undefined:imageSrcSet(image)} sizes={sizes??(large?'100vw':'(max-width: 640px) and (min-resolution: 2.5dppx) 60vw, (max-width: 960px) 90vw, (max-width: 1400px) 47vw, 660px')} width={info?.width} height={info?.height} alt={alt} fetchPriority={eager?'high':'auto'} decoding="async" draggable={false}/>;
}
export function ImageViewer({photos,index,onChange,onClose,trigger,resolvedSrc,status}:{photos:PhotoInfo[];index:number;onChange:(n:number)=>void;onClose:()=>void;trigger:React.RefObject<HTMLButtonElement|null>;resolvedSrc?:string;status:string}){
 const pointer=useRef<{x:number;y:number}|null>(null);
 const item=photos[index];
 function change(delta:number){onChange((index+delta+photos.length)%photos.length)}
 function end(e:PointerEvent){if(!pointer.current)return;const dx=e.clientX-pointer.current.x,dy=e.clientY-pointer.current.y;pointer.current=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))change(dx<0?1:-1)}
 return <Dialog open onOpenChange={open=>{if(!open)onClose()}}><DialogContent showCloseButton={false} className="rm-viewer" style={{translate:'none',transform:'none',inset:0}} onCloseAutoFocus={e=>{e.preventDefault();trigger.current?.focus()}} onKeyDown={e=>{if(photos.length>1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();change(e.key==='ArrowRight'?1:-1)}}}>
  <DialogTitle className="sr-only">{item.label}</DialogTitle><DialogDescription className="sr-only">{photos.length>1?'Use the arrows or swipe to browse. Press Escape to close.':'Press Escape or Close to return.'}</DialogDescription>
  <div className="rm-viewer-toolbar"><span aria-live="polite">{photos.length>1?`${index+1} / ${photos.length}`:item.label}</span><button onClick={onClose} aria-label="Close image"><X size={22}/><span>Close</span></button></div>
  <GalleryStatus status={status}/><div className="rm-viewer-image" onPointerDown={e=>{pointer.current={x:e.clientX,y:e.clientY}}} onPointerUp={end} onPointerCancel={()=>{pointer.current=null}}><SetPhoto image={item.image} alt={item.alt} resolvedSrc={resolvedSrc} eager large/></div>
  {photos.length>1&&<div className="rm-viewer-nav"><button aria-label="Previous image" onClick={()=>change(-1)}><ArrowLeft size={20}/></button><span>{item.label}</span><button aria-label="Next image" onClick={()=>change(1)}><ArrowRight size={20}/></button></div>}
 </DialogContent></Dialog>;
}

export function SetGallery({photos:gallery,name,after}:{photos:PhotoInfo[];name:string;after?:ReactNode}){
 const [open,setOpen]=useState(false);
 const {index,resolvedSrc,status,change}=useGallerySelection(gallery.map(p=>p.image),open?'100vw':'(max-width: 760px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 112px), (max-width: 1400px) 47vw, 660px');
 const trigger=useRef<HTMLButtonElement>(null),rail=useRef<HTMLDivElement>(null);
 const pointer=useRef<{x:number;y:number}|null>(null),dragged=useRef(false);
 useEffect(()=>{const row=rail.current,item=row?.children[index] as HTMLElement|undefined;if(row&&item)row.scrollTo({left:item.offsetLeft-row.offsetLeft-row.clientWidth/2+28,behavior:'instant'})},[index]);
 function end(e:PointerEvent){if(!pointer.current)return;const dx=e.clientX-pointer.current.x,dy=e.clientY-pointer.current.y;pointer.current=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){dragged.current=true;change(index+(dx<0?1:-1))}}
 const item=gallery[index];
 return <section className="rm-gallery" aria-label={`${name} product gallery`}>
  <div className="rm-gallery-stage" aria-busy={status==='loading'} onPointerDown={e=>{pointer.current={x:e.clientX,y:e.clientY};dragged.current=false}} onPointerUp={end} onPointerCancel={()=>{pointer.current=null}} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(index+(e.key==='ArrowRight'?1:-1))}}}>
   <button className="rm-main-image" aria-label={`View larger: ${item.label}`} onClick={e=>{if(dragged.current){dragged.current=false;return}trigger.current=e.currentTarget;setOpen(true)}}><SetPhoto image={item.image} alt={item.alt} resolvedSrc={resolvedSrc} eager/></button>
   <span className="rm-counter" aria-live="polite">{index+1} / {gallery.length}</span>
   <button className="rm-gallery-arrow previous" aria-label="Previous image" onClick={()=>change(index-1)}><ArrowLeft size={18}/></button><button className="rm-gallery-arrow next" aria-label="Next image" onClick={()=>change(index+1)}><ArrowRight size={18}/></button>
  </div>
  <GalleryStatus status={status}/><div className="rm-thumbnails" ref={rail} aria-label="Choose a product image">{gallery.map((photo,i)=><button key={photo.image} aria-label={`${i+1}. ${photo.label}`} aria-pressed={index===i} onClick={()=>change(i)}><img src={imageAsset(photo.image,'thumb')} width={56} height={56} alt="" loading="lazy" fetchPriority="low" decoding="async" draggable={false}/></button>)}</div>
  {after}
  {open&&<ImageViewer photos={gallery} index={index} resolvedSrc={resolvedSrc} status={status} onChange={change} onClose={()=>setOpen(false)} trigger={trigger}/>}
 </section>;
}


export function GalleryStatus({status}:{status:string}){return <p className={`gallery-status ${status==='error'?'has-error':'sr-only'}`} role="status">{status==='loading'?'Loading photograph…':status==='error'?'This photo could not load. Your previous photo is still here. Try again or choose another.':''}</p>}
