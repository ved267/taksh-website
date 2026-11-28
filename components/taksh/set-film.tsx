'use client';
import {useEffect,useRef,useState} from 'react';
import './set-film.css';
// A set's own reel as a small "Watch" tile pinned to the corner of the section it belongs to, so the page gets no longer.
// Desktop hover: the tile grows and previews silently. Tap or click: the reel opens over the page with sound.
export function SetFilm({name,caption,side='right',at='bottom'}:{name:string;caption:string;side?:'left'|'right';at?:'top'|'bottom'}){
 const src=`/films/${name}.mp4`,box=useRef<HTMLDialogElement>(null),big=useRef<HTMLVideoElement>(null),peek=useRef<HTMLVideoElement>(null),[open,setOpen]=useState(false);
 useEffect(()=>{const v=big.current;if(!v)return;if(open){if(!v.getAttribute('src'))v.src=src;v.currentTime=0;v.play().catch(()=>{})}else v.pause()},[open,src]);
 const hover=(on:boolean)=>{const v=peek.current;if(!v||matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches)return;if(on){if(!v.getAttribute('src'))v.src=src;v.play().catch(()=>{})}else v.pause()};
 const show=()=>{box.current?.showModal();setOpen(true)},hide=()=>{box.current?.close();setOpen(false)};
 return <div className={`set-film set-film-${side} set-film-${at}`}>
  <button type="button" className="set-film-tile" onClick={show} onMouseEnter={()=>hover(true)} onMouseLeave={()=>hover(false)} aria-label={`Watch: ${caption}`}>
   <img src={`/films/${name}-thumb.jpg`} alt="" loading="lazy" decoding="async"/>
   <video ref={peek} muted loop playsInline preload="none" aria-hidden="true"/>
   <span className="set-film-play" aria-hidden="true"/><span className="set-film-label">Watch</span>
  </button>
  <dialog ref={box} className="set-film-box" onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)hide()}} aria-label={caption}>
   <video ref={big} poster={`/films/${name}.jpg`} controls playsInline preload="none"/>
   <p>{caption}</p><button type="button" className="set-film-close" onClick={hide} aria-label="Close">×</button>
  </dialog>
 </div>;
}
