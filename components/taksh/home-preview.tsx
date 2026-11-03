'use client';

import {X} from 'lucide-react';
import {Dialog,DialogClose,DialogContent,DialogDescription,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
import {imageAsset,imageInfo,imageSrcSet} from '@/lib/images';
import './home-preview.css';

export function HomePreview({image,alt,className='',compact=false}:{image:string;alt:string;className?:string;compact?:boolean}){
 const info=imageInfo(image);
 return <Dialog>
  <DialogTrigger asChild><button type="button" className={`home-preview-trigger ${className}`}>Picture it in your home</button></DialogTrigger>
  <DialogContent showCloseButton={false} className={`home-preview${compact?' home-preview-compact':''}`} style={{translate:'none'}}>
   <div className="home-preview-toolbar">
    <DialogTitle>Picture it in your home</DialogTitle>
    <DialogClose asChild><button type="button" aria-label="Close home preview"><X size={18}/><span>Close</span></button></DialogClose>
   </div>
   <DialogDescription className="sr-only">{alt} Press Escape or click outside to close.</DialogDescription>
   <img src={imageAsset(image)} srcSet={imageSrcSet(image)} sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1008px) calc(100vw - 48px), 960px" width={info?.width} height={info?.height} alt={alt} decoding="async" draggable={false}/>
  </DialogContent>
 </Dialog>;
}
