'use client';
import {useEffect,useRef,useState} from 'react';
import './set-film.css';
// A set's own reel as a small "Watch" pill on the corner of the photo it belongs to, so the page gets no longer.
// Tap or click: the reel opens in the centre of the screen with sound.
// The player is our own: tap to pause, a thin progress line, sound toggle and close; no browser controls.
export function SetFilm({name,caption,length,side='right',at='bottom'}:{name:string;caption:string;length:string;side?:'left'|'right';at?:'top'|'bottom'}){
 const src=`/films/${name}.mp4`,box=useRef<HTMLDialogElement>(null),big=useRef<HTMLVideoElement>(null),bar=useRef<HTMLSpanElement>(null),[open,setOpen]=useState(false),[paused,setPaused]=useState(false),[muted,setMuted]=useState(false);
 useEffect(()=>{const v=big.current;if(!v)return;if(open){if(!v.getAttribute('src'))v.src=src;v.currentTime=0;v.muted=false;v.play().catch(()=>{v.muted=true;setMuted(true);v.play().catch(()=>{})});document.documentElement.style.overflow='hidden'}else{v.pause();document.documentElement.style.overflow=''}},[open,src]);
 const show=()=>{setPaused(false);setMuted(false);box.current?.showModal();setOpen(true)},hide=()=>{box.current?.close();setOpen(false)};
 const toggle=()=>{const v=big.current;if(!v)return;if(v.paused)v.play().catch(()=>{});else v.pause()};
 return <div className={`set-film set-film-${side} set-film-${at}`}>
  <button type="button" className="set-film-tile" onClick={show} aria-label={`Watch: ${caption} (${length})`}><span className="set-film-play" aria-hidden="true"/>Watch<span className="set-film-time">{length}</span></button>
  <dialog ref={box} className="set-film-box" onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)hide()}} aria-label={caption}>
   <div className="set-film-player">
    <video ref={big} poster={`/films/${name}.jpg`} playsInline preload="none" onClick={toggle} onPlay={()=>setPaused(false)} onPause={()=>setPaused(true)} onEnded={()=>setPaused(true)} onTimeUpdate={e=>{const v=e.currentTarget;if(bar.current&&v.duration)bar.current.style.transform=`scaleX(${v.currentTime/v.duration})`}}/>
    {paused&&<button type="button" className="set-film-resume" onClick={toggle} aria-label="Play"/>}
    <p>{caption}</p>
    <span className="set-film-progress" aria-hidden="true"><span ref={bar}/></span>
    <button type="button" className="set-film-sound" onClick={()=>{const v=big.current;if(!v)return;v.muted=!v.muted;setMuted(v.muted)}} aria-label={muted?'Sound on':'Sound off'}>{muted?'Sound on':'Sound off'}</button>
    <button type="button" className="set-film-close" onClick={hide} aria-label="Close">×</button>
   </div>
  </dialog>
 </div>;
}
