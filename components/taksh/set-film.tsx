'use client';
import {useEffect,useRef,useState} from 'react';
import './set-film.css';
// A set's own reel, placed after the part of the page it shows. Nothing downloads until it is near the screen;
// it then plays silently on a loop. "Sound on" restarts it with sound. Reduced motion: no autoplay.
export function SetFilm({name,caption}:{name:string;caption:string}){
 const ref=useRef<HTMLVideoElement>(null),[sound,setSound]=useState(false),src=`/films/${name}.mp4`;
 useEffect(()=>{const v=ref.current;if(!v)return;const still=matchMedia('(prefers-reduced-motion: reduce)').matches;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){if(!v.getAttribute('src')){v.src=src;v.load()}if(!still||!v.muted)v.play().catch(()=>{})}else v.pause()},{rootMargin:'300px 0px',threshold:.2});io.observe(v);return()=>io.disconnect()},[src]);
 const toggle=()=>{const v=ref.current;if(!v)return;if(!v.getAttribute('src'))v.src=src;const on=!sound;setSound(on);v.muted=!on;if(on)v.currentTime=0;v.play().catch(()=>{})};
 return <section className="set-film" aria-label={caption}><figure><video ref={ref} poster={`/films/${name}.jpg`} muted loop playsInline preload="none" onClick={toggle}/><figcaption><span>{caption}</span><button type="button" onClick={toggle}>{sound?'Sound off':'Sound on'}</button></figcaption></figure></section>;
}
